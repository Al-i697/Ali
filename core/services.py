"""Business rules. Views stay thin and call these functions.

Everything that changes money runs inside a transaction and leaves a trail:
nothing is deleted, wrong entries are voided with a reason.
"""
from collections import defaultdict
from dataclasses import dataclass
from datetime import date, timedelta
from decimal import ROUND_HALF_UP, Decimal
from statistics import mean

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from .models import (
    ZERO,
    Customer,
    LedgerEntry,
    Order,
    OrderItem,
    PaymentPromise,
    Product,
)

User = get_user_model()

OVERDUE_DAYS = 30
BUCKET_LABELS = ["حتى 30 يوم", "31 – 60 يوم", "61 – 90 يوم", "أكثر من 90 يوم"]
MAX_QTY = 99


class ServiceError(Exception):
    """A rule was broken; the message is safe to show to the user."""


def money(value) -> Decimal:
    return Decimal(value).quantize(ZERO, rounding=ROUND_HALF_UP)


# --------------------------------------------------------------------------- aging


def bucket_index(age_days: int) -> int:
    if age_days <= 30:
        return 0
    if age_days <= 60:
        return 1
    if age_days <= 90:
        return 2
    return 3


@dataclass
class Aging:
    buckets: list  # unpaid debt per age bucket, oldest payments applied first
    prepaid: Decimal  # money paid in advance (more payments than debts)
    oldest_date: date | None
    oldest_age: int | None

    @property
    def total_debt(self) -> Decimal:
        return sum(self.buckets, ZERO)

    @property
    def balance(self) -> Decimal:
        return self.total_debt - self.prepaid

    @property
    def overdue(self) -> Decimal:
        """Unpaid debt older than OVERDUE_DAYS."""
        return sum(self.buckets[1:], ZERO)


def compute_aging(entries, today: date) -> Aging:
    """`entries`: (date, signed_amount[, id[, order_id]]) of the entries that count.

    1. Money paid on the spot settles its own delivery first (a customer who
       pays cash at every delivery does not "use up" his old debt).
    2. Every other payment (collected later, discounts) is applied to the oldest
       remaining debts first.
    What is still unpaid is aged from the date of each debt."""
    rows = []
    for d, amount, *rest in entries:
        entry_id = rest[0] if len(rest) > 0 else 0
        order_id = rest[1] if len(rest) > 1 else None
        rows.append((d, Decimal(amount), entry_id or 0, order_id))

    debts = []  # [date, id, still_unpaid]
    by_order = {}
    for d, amount, eid, order_id in rows:
        if amount > 0:
            item = [d, eid, amount]
            debts.append(item)
            if order_id:
                by_order.setdefault(order_id, []).append(item)

    credit = ZERO
    for d, amount, eid, order_id in rows:
        if amount < 0:
            paid = -amount
            for item in by_order.get(order_id, ()):
                used = min(paid, item[2])
                item[2] -= used
                paid -= used
            credit += paid

    buckets = [ZERO] * 4
    oldest = None
    for d, _, amount in sorted(((i[0], i[1], i[2]) for i in debts)):
        applied = min(credit, amount)
        credit -= applied
        left = amount - applied
        if left > 0:
            age = max((today - d).days, 0)
            buckets[bucket_index(age)] += left
            if oldest is None:
                oldest = d
    return Aging(
        buckets=buckets,
        prepaid=credit,
        oldest_date=oldest,
        oldest_age=max((today - oldest).days, 0) if oldest else None,
    )


@dataclass
class DebtRow:
    customer: Customer
    aging: Aging
    last_payment: date | None

    @property
    def balance(self) -> Decimal:
        return self.aging.balance

    @property
    def oldest_age(self):
        return self.aging.oldest_age


def debt_rows(today: date | None = None, *, area_id=None, search: str = "", only_debtors=True) -> list[DebtRow]:
    today = today or timezone.localdate()
    customers = Customer.objects.select_related("area")
    if area_id:
        customers = customers.filter(area_id=area_id)
    if search:
        customers = customers.search(search)
    by_id = {c.id: c for c in customers}

    grouped = defaultdict(list)
    last_payment = {}
    qs = LedgerEntry.objects.effective().filter(customer_id__in=by_id).values_list(
        "customer_id", "date", "amount", "id", "kind", "order_id"
    )
    for cid, d, amount, eid, kind, order_id in qs:
        grouped[cid].append((d, amount, eid, order_id))
        if kind == LedgerEntry.Kind.PAYMENT and (cid not in last_payment or d > last_payment[cid]):
            last_payment[cid] = d

    rows = []
    for cid, customer in by_id.items():
        aging = compute_aging(grouped.get(cid, []), today)
        if only_debtors and aging.balance <= 0:
            continue
        rows.append(DebtRow(customer, aging, last_payment.get(cid)))
    return rows


@dataclass
class DebtOverview:
    rows: list
    total: Decimal
    overdue: Decimal
    buckets: list
    bucket_customers: list
    by_area: list  # (area name, amount, customers)

    @property
    def debtors(self) -> int:
        return len(self.rows)


def debt_overview(today: date | None = None) -> DebtOverview:
    rows = debt_rows(today)
    buckets = [ZERO] * 4
    bucket_customers = [0] * 4
    per_area = defaultdict(lambda: [ZERO, 0])
    for r in rows:
        for i, amount in enumerate(r.aging.buckets):
            buckets[i] += amount
            if amount > 0:
                bucket_customers[i] += 1
        per_area[r.customer.area.name][0] += r.balance
        per_area[r.customer.area.name][1] += 1
    by_area = sorted(((n, v[0], v[1]) for n, v in per_area.items()), key=lambda x: -x[1])
    return DebtOverview(
        rows=sorted(rows, key=lambda r: -r.balance),
        total=sum(buckets, ZERO),
        overdue=sum(buckets[1:], ZERO),
        buckets=buckets,
        bucket_customers=bucket_customers,
        by_area=by_area,
    )


# ----------------------------------------------------------------------- statement


def ledger_with_running_balance(customer: Customer):
    """All entries, newest first, each with the balance after it (voided: None)."""
    entries = list(customer.entries.select_related("created_by", "voided_by", "order"))
    running = {}
    total = ZERO
    for e in sorted((e for e in entries if not e.voided), key=lambda e: (e.date, e.id)):
        total += e.amount
        running[e.id] = total
    for e in entries:
        e.running = running.get(e.id)
    entries.sort(key=lambda e: (e.date, e.id), reverse=True)
    return entries


# ------------------------------------------------------------------------- orders


def _clean_quantities(quantities: dict) -> dict:
    cleaned = {}
    for key, qty in quantities.items():
        qty = int(qty or 0)
        if qty < 0 or qty > MAX_QTY:
            raise ServiceError("الكمية غير صحيحة.")
        if qty:
            cleaned[key] = qty
    return cleaned


@transaction.atomic
def create_order(customer: Customer, user, quantities: dict, *, source, delivery_date, notes="") -> Order:
    """`quantities`: {product_id: qty}. Prices are copied from the product now."""
    quantities = _clean_quantities(quantities)
    if not quantities:
        raise ServiceError("اختر اسطوانة واحدة على الأقل.")
    order = Order.objects.create(
        customer=customer, created_by=user, source=source, delivery_date=delivery_date, notes=notes
    )
    for product in Product.objects.filter(id__in=quantities):
        OrderItem.objects.create(
            order=order, product=product, quantity=quantities[product.id], unit_price=product.price
        )
    return order


@transaction.atomic
def update_order(order: Order, quantities: dict, *, source, delivery_date, notes="") -> Order:
    order = Order.objects.select_for_update().get(pk=order.pk)
    if order.status != Order.Status.PENDING:
        raise ServiceError("ما تقدر تعدّل طلب تم توصيله أو إلغاؤه.")
    quantities = _clean_quantities(quantities)
    if not quantities:
        raise ServiceError("اختر اسطوانة واحدة على الأقل.")
    existing = {i.product_id: i for i in order.items.all()}
    for pid, item in existing.items():
        if pid not in quantities:
            item.delete()
    for product in Product.objects.filter(id__in=quantities):
        if product.id in existing:  # keep the price the customer was quoted
            item = existing[product.id]
            item.quantity = quantities[product.id]
            item.save(update_fields=["quantity"])
        else:
            OrderItem.objects.create(
                order=order, product=product, quantity=quantities[product.id], unit_price=product.price
            )
    order.source, order.delivery_date, order.notes = source, delivery_date, notes
    order.save(update_fields=["source", "delivery_date", "notes"])
    return order


@transaction.atomic
def cancel_order(order: Order, user, reason: str = "") -> Order:
    order = Order.objects.select_for_update().get(pk=order.pk)
    if order.status != Order.Status.PENDING:
        raise ServiceError("يمكن إلغاء الطلبات التي لم تُوصَّل فقط.")
    order.status = Order.Status.CANCELLED
    order.cancel_reason = reason[:200]
    order.cancelled_by, order.cancelled_at = user, timezone.now()
    order.save(update_fields=["status", "cancel_reason", "cancelled_by", "cancelled_at"])
    return order


@transaction.atomic
def deliver_order(order: Order, user, quantities: dict, *, pay_mode: str, paid_amount=None, method="", note="") -> Order:
    """Mark an order delivered and write its money: one charge for the total and,
    when something was paid on the spot, one payment. Whatever is left unpaid is
    simply the difference, and shows up in the customer's balance.

    `quantities`: {order_item_id: delivered_qty}; a missing id keeps the ordered
    quantity, 0 removes the line. `pay_mode`: full | none | partial.
    """
    order = Order.objects.select_for_update().get(pk=order.pk)
    if order.status != Order.Status.PENDING:
        raise ServiceError("هذا الطلب تم توصيله أو إلغاؤه من قبل.")

    items = list(order.items.all())
    total = ZERO
    kept = []
    for item in items:
        qty = int(quantities.get(item.pk, item.quantity) or 0)
        if qty < 0 or qty > MAX_QTY:
            raise ServiceError("الكمية غير صحيحة.")
        if qty == 0:
            item.delete()
            continue
        if qty != item.quantity:
            item.quantity = qty
            item.save(update_fields=["quantity"])
        total += item.line_total
        kept.append(item)
    if not kept:
        raise ServiceError("ما في أي اسطوانة للتسليم. إذا انلغى الطلب استخدم زر الإلغاء.")

    if pay_mode == "full":
        paid = total
    elif pay_mode == "none":
        paid = ZERO
    elif pay_mode == "partial":
        paid = money(paid_amount or 0)
        if paid < 0 or paid > total:
            raise ServiceError("المبلغ المدفوع لازم يكون بين 0 وإجمالي الطلب.")
    else:
        raise ServiceError("اختر طريقة الدفع.")
    if paid > 0 and not method:
        method = LedgerEntry.Method.CASH

    now = timezone.now()
    today = timezone.localdate(now)
    order.status = Order.Status.DELIVERED
    order.delivered_at, order.delivered_on, order.delivered_by = now, today, user
    order.save(update_fields=["status", "delivered_at", "delivered_on", "delivered_by"])

    LedgerEntry.objects.create(
        customer=order.customer, kind=LedgerEntry.Kind.CHARGE, amount=total, date=today,
        order=order, created_by=user, note=note[:200],
    )
    if paid > 0:
        LedgerEntry.objects.create(
            customer=order.customer, kind=LedgerEntry.Kind.PAYMENT, amount=-paid, date=today,
            method=method, order=order, created_by=user,
        )
    return order


@transaction.atomic
def revert_delivery(order: Order, user, reason: str) -> Order:
    """Undo a delivery that was recorded wrongly: its money entries are voided
    and the order goes back to 'pending' so it can be delivered again."""
    order = Order.objects.select_for_update().get(pk=order.pk)
    if order.status != Order.Status.DELIVERED:
        raise ServiceError("هذا الطلب ما تم توصيله.")
    if not reason.strip():
        raise ServiceError("اكتب سبب التراجع.")
    now = timezone.now()
    order.entries.filter(voided=False).update(
        voided=True, voided_by=user, voided_at=now, void_reason=f"تراجع عن التسليم: {reason.strip()}"[:200]
    )
    order.status = Order.Status.PENDING
    order.delivered_at = order.delivered_on = order.delivered_by = None
    order.save(update_fields=["status", "delivered_at", "delivered_on", "delivered_by"])
    return order


# ------------------------------------------------------------------------- money


def _positive(amount) -> Decimal:
    amount = money(amount)
    if amount <= 0:
        raise ServiceError("المبلغ لازم يكون أكبر من صفر.")
    return amount


def _close_promises_if_settled(customer: Customer):
    if customer.current_balance() <= 0:
        customer.promises.filter(done=False).update(done=True, done_at=timezone.now())


@transaction.atomic
def record_payment(customer: Customer, user, amount, *, method, date_=None, note="") -> LedgerEntry:
    amount = _positive(amount)
    # A double tap (or a retried request) must not record the same payment twice.
    recent = timezone.now() - timedelta(seconds=20)
    if LedgerEntry.objects.filter(
        customer=customer, kind=LedgerEntry.Kind.PAYMENT, amount=-amount, created_by=user,
        voided=False, order__isnull=True, created_at__gte=recent,
    ).exists():
        raise ServiceError("هذا السداد انسجل قبل لحظات. تأكد من الحركات قبل ما تعيده.")
    entry = LedgerEntry.objects.create(
        customer=customer, kind=LedgerEntry.Kind.PAYMENT, amount=-amount,
        date=date_ or timezone.localdate(), method=method or LedgerEntry.Method.CASH,
        note=note[:200], created_by=user,
    )
    _close_promises_if_settled(customer)
    return entry


@transaction.atomic
def add_opening_balance(customer: Customer, user, amount, *, date_=None, note="") -> LedgerEntry:
    """Debt that existed before the system: the date matters because it sets how
    old the debt is in the aging report."""
    return LedgerEntry.objects.create(
        customer=customer, kind=LedgerEntry.Kind.OPENING, amount=_positive(amount),
        date=date_ or timezone.localdate(), note=note[:200] or "رصيد سابق قبل النظام", created_by=user,
    )


@transaction.atomic
def record_writeoff(customer: Customer, user, amount, *, note) -> LedgerEntry:
    if not note.strip():
        raise ServiceError("اكتب سبب الخصم أو الإعفاء.")
    entry = LedgerEntry.objects.create(
        customer=customer, kind=LedgerEntry.Kind.WRITEOFF, amount=-_positive(amount),
        date=timezone.localdate(), note=note[:200], created_by=user,
    )
    _close_promises_if_settled(customer)
    return entry


@transaction.atomic
def void_entry(entry: LedgerEntry, user, reason: str) -> LedgerEntry:
    entry = LedgerEntry.objects.select_for_update().get(pk=entry.pk)
    if entry.voided:
        raise ServiceError("هذه الحركة ملغاة من قبل.")
    if not reason.strip():
        raise ServiceError("اكتب سبب الإلغاء.")
    if not entry.can_void:
        raise ServiceError("دين التوصيل ما ينلغى لحاله. استخدم «التراجع عن التسليم» من صفحة الطلب.")
    entry.voided, entry.voided_by, entry.voided_at = True, user, timezone.now()
    entry.void_reason = reason.strip()[:200]
    entry.save(update_fields=["voided", "voided_by", "voided_at", "void_reason"])
    return entry


def add_promise(customer: Customer, user, promised_date, amount=None, note="") -> PaymentPromise:
    if promised_date < timezone.localdate():
        raise ServiceError("تاريخ الوعد لازم يكون اليوم أو بعده.")
    return PaymentPromise.objects.create(
        customer=customer, promised_date=promised_date, amount=amount or None, note=note[:200], created_by=user
    )


def credit_warning(customer: Customer, extra_debt: Decimal = ZERO, balance: Decimal | None = None):
    """Text if this customer is (or would be) over his credit limit, else ''."""
    if customer.credit_limit <= 0:
        return ""
    balance = customer.current_balance() if balance is None else balance
    if balance + extra_debt > customer.credit_limit:
        return f"تجاوز حد الدين ({customer.credit_limit:,.2f} د.إ)"
    return ""


# ---------------------------------------------------------------------- reporting


@dataclass
class Refill:
    customer: Customer
    last_delivery: date
    every_days: int
    expected: date
    days_until: int

    @property
    def days_since(self) -> int:
        return (timezone.localdate() - self.last_delivery).days

    @property
    def late_days(self) -> int:
        return max(-self.days_until, 0)


def predicted_refills(today: date | None = None, soon_days: int = 3) -> list[Refill]:
    """Customers who will probably need gas soon and have no open order.

    The usual interval is the average of the gaps between their last
    deliveries. Customers who stopped ordering (3x their usual gap) are left out.
    """
    today = today or timezone.localdate()
    by_customer = defaultdict(set)
    rows = Order.objects.filter(status=Order.Status.DELIVERED, delivered_on__isnull=False).values_list(
        "customer_id", "delivered_on"
    )
    for cid, d in rows:
        by_customer[cid].add(d)
    pending = set(Order.objects.filter(status=Order.Status.PENDING).values_list("customer_id", flat=True))
    customers = {
        c.id: c for c in Customer.objects.filter(is_active=True, id__in=list(by_customer)).select_related("area")
    }
    out = []
    for cid, dates in by_customer.items():
        if cid not in customers or cid in pending or len(dates) < 2:
            continue
        ordered = sorted(dates)
        gaps = [(b - a).days for a, b in zip(ordered, ordered[1:])][-5:]
        every = max(1, round(mean(gaps)))
        last = ordered[-1]
        expected = last + timedelta(days=every)
        days_until = (expected - today).days
        if days_until > soon_days or (today - last).days > every * 3:
            continue
        out.append(Refill(customers[cid], last, every, expected, days_until))
    return sorted(out, key=lambda r: (r.days_until, r.customer.name))


def daily_summary(day: date) -> dict:
    delivered = Order.objects.filter(status=Order.Status.DELIVERED, delivered_on=day)
    cylinders = list(
        OrderItem.objects.filter(order__in=delivered)
        .values_list("product__name")
        .annotate(qty=Sum("quantity"))
        .order_by("product__sort_order", "product__name")
    )
    entries = LedgerEntry.objects.effective().filter(date=day)
    sales = entries.filter(kind=LedgerEntry.Kind.CHARGE).aggregate(t=Sum("amount"))["t"] or ZERO
    payments = entries.filter(kind=LedgerEntry.Kind.PAYMENT)
    collected = -(payments.aggregate(t=Sum("amount"))["t"] or ZERO)
    at_delivery = -(payments.filter(order__isnull=False).aggregate(t=Sum("amount"))["t"] or ZERO)

    by_method = {m.value: ZERO for m in LedgerEntry.Method}
    for method, total in payments.values_list("method").annotate(t=Sum("amount")):
        by_method[method] = -total

    # One row per employee: what he delivered, the cash he is holding, and how
    # much he gave on credit (sales of his deliveries that were not paid on the spot).
    staff = defaultdict(lambda: {"deliveries": 0, "cylinders": 0, "sales": ZERO, "cash": ZERO, "other": ZERO,
                                 "paid_on_spot": ZERO, "name": "", "user_id": None})

    def person(user):
        row = staff[user.pk]
        row["name"], row["user_id"] = user.first_name or user.username, user.pk
        return row

    for order in delivered.select_related("delivered_by").prefetch_related("items"):
        row = person(order.delivered_by)
        row["deliveries"] += 1
        row["cylinders"] += order.cylinders
        row["sales"] += order.total
    for user_id, total in payments.filter(order__isnull=False).values_list("order__delivered_by_id").annotate(t=Sum("amount")):
        if user_id is not None:
            staff[user_id]["paid_on_spot"] += -total
    for user_id, method, total in payments.values_list("created_by_id", "method").annotate(t=Sum("amount")):
        key = "cash" if method == LedgerEntry.Method.CASH else "other"
        staff[user_id][key] += -total
    names = {u.pk: u for u in User.objects.filter(pk__in=list(staff))}
    for user_id, row in staff.items():
        person(names[user_id])
        row["credit"] = row["sales"] - row["paid_on_spot"]
    by_user = sorted(staff.values(), key=lambda r: r["name"])

    return {
        "date": day,
        "deliveries": delivered.count(),
        "cylinders": cylinders,
        "cylinders_total": sum(q for _, q in cylinders),
        "sales": sales,
        "collected": collected,
        "collected_at_delivery": at_delivery,
        "collected_old_debts": collected - at_delivery,
        "new_debt": sales - at_delivery,
        "by_method": [(LedgerEntry.Method(m).label, v) for m, v in by_method.items() if v],
        "by_user": by_user,
        "cancelled": Order.objects.filter(status=Order.Status.CANCELLED, delivery_date=day).count(),
    }


# ---------------------------------------------------------------- activity log


def activity_feed(day: date, user_id=None, limit: int = 300) -> list[dict]:
    """Everything the team did on one day, newest first, built from the records
    themselves (no separate log to forget to update). `flag` marks actions the
    manager usually wants to look at: cancellations, discounts, corrections."""
    events = []

    def add(when, user, label, customer, *, order=None, detail="", amount=None, flag=False):
        events.append({
            "when": when, "user_id": user.pk if user else None,
            "user": (user.first_name or user.username) if user else "—",
            "label": label, "customer": customer, "order_id": order.pk if order else None,
            "detail": detail, "amount": amount, "flag": flag,
        })

    orders = Order.objects.with_details()
    for o in orders.filter(created_at__date=day):
        add(o.created_at, o.created_by, "طلب جديد", o.customer, order=o, detail=o.items_summary, amount=o.total)

    delivered = list(orders.filter(status=Order.Status.DELIVERED, delivered_at__date=day))
    paid = {
        oid: -total
        for oid, total in LedgerEntry.objects.effective()
        .filter(order__in=delivered, kind=LedgerEntry.Kind.PAYMENT)
        .values_list("order_id").annotate(t=Sum("amount"))
    }
    for o in delivered:
        total, got = o.total, paid.get(o.pk, ZERO)
        if got >= total:
            how = "مدفوع كامل"
        elif got > 0:
            how = f"دفع {got:,.2f} والباقي دين {total - got:,.2f}"
        else:
            how = "آجل (دين)"
        add(o.delivered_at, o.delivered_by, "تسليم", o.customer, order=o, detail=f"{o.items_summary} · {how}", amount=total)

    for o in orders.filter(status=Order.Status.CANCELLED, cancelled_at__date=day):
        add(o.cancelled_at, o.cancelled_by, "إلغاء طلب", o.customer, order=o,
            detail=" · ".join(x for x in (o.items_summary, o.cancel_reason) if x), amount=o.total, flag=True)

    entries = LedgerEntry.objects.select_related("customer", "created_by", "order")
    for e in entries.filter(created_at__date=day):
        if e.kind == LedgerEntry.Kind.PAYMENT and e.order_id is None:
            add(e.created_at, e.created_by, "تحصيل", e.customer, detail=e.get_method_display(), amount=-e.amount)
        elif e.kind == LedgerEntry.Kind.OPENING:
            add(e.created_at, e.created_by, "دين سابق", e.customer, detail=e.note, amount=e.amount)
        elif e.kind == LedgerEntry.Kind.WRITEOFF:
            add(e.created_at, e.created_by, "خصم / إعفاء", e.customer, detail=e.note, amount=-e.amount, flag=True)

    reverted = set()
    for e in entries.select_related("voided_by").filter(voided_at__date=day):
        if e.order_id:  # a reverted delivery voids two entries: show it once
            if e.order_id in reverted:
                continue
            reverted.add(e.order_id)
            add(e.voided_at, e.voided_by, "تراجع عن تسليم", e.customer, order=e.order, detail=e.void_reason, flag=True)
        else:
            add(e.voided_at, e.voided_by, "إلغاء حركة", e.customer,
                detail=f"{e.get_kind_display()}: {e.void_reason}", amount=abs(e.amount), flag=True)

    for p in PaymentPromise.objects.select_related("customer", "created_by").filter(created_at__date=day):
        add(p.created_at, p.created_by, "وعد بالسداد", p.customer,
            detail=f"يسدد يوم {p.promised_date:%Y-%m-%d}", amount=p.amount)

    if user_id:
        events = [e for e in events if e["user_id"] == user_id]
    events.sort(key=lambda e: e["when"], reverse=True)
    return events[:limit]
