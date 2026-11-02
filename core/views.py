import csv
from datetime import datetime
from decimal import Decimal

from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView
from django.core.cache import cache
from django.core.exceptions import PermissionDenied
from django.core.paginator import Paginator
from django.db.models import Count, Q, Sum
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.http import require_POST

from . import services as s
from . import forms as f
from .models import (
    ZERO,
    Area,
    CompanySettings,
    Customer,
    LedgerEntry,
    Order,
    PaymentPromise,
    Product,
    Role,
)
from .permissions import admin_required, get_role, is_admin
from .templatetags.core_extras import ago, days_ar
from .text import whatsapp_url

User = get_user_model()
PAGE_SIZE = 40


# ------------------------------------------------------------------------ helpers


def safe_next(request, default: str) -> str:
    target = request.POST.get("next") or request.GET.get("next") or ""
    if target and url_has_allowed_host_and_scheme(target, allowed_hosts={request.get_host()}):
        return target
    return default


def paginate(request, items, per_page=PAGE_SIZE):
    return Paginator(items, per_page).get_page(request.GET.get("page"))


def form_page(request, form, *, title, submit="حفظ", back, subtitle="", danger=False, hint=""):
    return render(request, "core/form_page.html", {
        "form": form, "title": title, "subtitle": subtitle, "submit": submit, "back": back,
        "danger": danger, "hint": hint,
    })


def reminder_text(customer: Customer, balance: Decimal) -> str:
    company = CompanySettings.get()
    lines = [
        f"السلام عليكم {customer.name}،",
        f"المتبقي عليكم لدى {company.company_name}: {balance:,.2f} د.إ.",
    ]
    if company.payment_note:
        lines.append(company.payment_note)
    lines.append("شكراً لكم.")
    return "\n".join(lines)


def _flash_error(request, exc: s.ServiceError):
    messages.error(request, str(exc))


# ------------------------------------------------------------------------- login


class ThrottledLoginView(LoginView):
    """Stops password guessing: 8 wrong tries for one account lock it for 15 minutes."""

    template_name = "core/login.html"
    redirect_authenticated_user = True
    MAX_TRIES, LOCK_SECONDS = 8, 15 * 60

    def _key(self, request):
        user = (request.POST.get("username") or "").strip().lower()[:150]
        return f"login-fail:{request.META.get('REMOTE_ADDR', '')}:{user}"

    def post(self, request, *args, **kwargs):
        if cache.get(self._key(request), 0) >= self.MAX_TRIES:
            form = self.get_form()
            form.add_error(None, "محاولات كثيرة غلط. انتظر ١٥ دقيقة وجرّب مرة ثانية.")
            return self.render_to_response(self.get_context_data(form=form), status=429)
        return super().post(request, *args, **kwargs)

    def form_invalid(self, form):
        key = self._key(self.request)
        cache.set(key, cache.get(key, 0) + 1, self.LOCK_SECONDS)
        return super().form_invalid(form)

    def form_valid(self, form):
        cache.delete(self._key(self.request))
        return super().form_valid(form)


# --------------------------------------------------------------------- dashboard


@login_required
def home(request):
    if not is_admin(request.user):
        return redirect("route")
    today = timezone.localdate()
    ov = s.debt_overview(today)
    by_customer = {r.customer.id: r for r in ov.rows}

    follow, seen = [], set()
    for p in PaymentPromise.objects.filter(done=False, promised_date__lte=today).select_related("customer__area"):
        row = by_customer.get(p.customer_id)
        if not row:
            continue
        late = (today - p.promised_date).days
        reason = "وعد بالسداد اليوم" if late == 0 else f"وعد بالسداد تأخر {days_ar(late)}"
        follow.append({"customer": p.customer, "balance": row.balance, "reason": reason, "late": late, "row": row})
        seen.add(p.customer_id)
    follow.sort(key=lambda x: (-x["late"], -x["balance"]))
    for row in ov.rows:  # already sorted by amount, biggest first
        if row.customer.id in seen or row.oldest_age is None or row.oldest_age <= s.OVERDUE_DAYS:
            continue
        follow.append({
            "customer": row.customer, "balance": row.balance, "late": 0, "row": row,
            "reason": f"أقدم دين {ago(row.aging.oldest_date)}",
        })
    for item in follow:
        item["wa"] = whatsapp_url(item["customer"].phone, reminder_text(item["customer"], item["balance"]))
    follow_total = len(follow)

    top = max(ov.buckets) if ov.buckets and max(ov.buckets) > 0 else Decimal(1)
    aging_bars = [
        {"label": label, "amount": amount, "customers": n, "pct": float(amount / top * 100), "old": i >= 1}
        for i, (label, amount, n) in enumerate(zip(s.BUCKET_LABELS, ov.buckets, ov.bucket_customers))
    ]
    top_area = max((a for _, a, _ in ov.by_area), default=Decimal(1))
    area_bars = [
        {"name": n, "amount": a, "customers": c, "pct": float(a / top_area * 100)} for n, a, c in ov.by_area
    ]

    summary = s.daily_summary(today)
    pending_today = Order.objects.filter(status=Order.Status.PENDING, delivery_date__lte=today).count()
    if ov.debtors == 0:
        finding = "ما في ديون على العملاء حالياً."
    else:
        finding = f"{ov.debtors} عميل عليهم ديون"
        if ov.overdue > 0:
            finding += f"، منها {ov.overdue:,.2f} د.إ متأخرة أكثر من {s.OVERDUE_DAYS} يوم"
        finding += "."

    return render(request, "core/home.html", {
        "today": today, "ov": ov, "finding": finding, "follow": follow[:6], "follow_total": follow_total,
        "aging_bars": aging_bars, "area_bars": area_bars, "summary": summary, "pending_today": pending_today,
        "refills": s.predicted_refills(today)[:6],
    })


# ------------------------------------------------------------------------- route


@login_required
def route(request):
    """Today's work: pending orders grouped by area."""
    today = timezone.localdate()
    pending = list(
        Order.objects.with_details()
        .filter(status=Order.Status.PENDING, delivery_date__lte=today)
        .order_by("customer__area__sort_order", "customer__area__name", "delivery_date", "customer__name")
    )
    ids = {o.customer_id for o in pending}
    balances = {c.id: c.balance for c in Customer.objects.filter(id__in=ids).with_balance()}
    groups = {}
    for o in pending:
        o.balance = balances.get(o.customer_id, ZERO)
        o.wa = whatsapp_url(o.customer.phone)
        groups.setdefault(o.customer.area, []).append(o)
    done = list(
        Order.objects.with_details().filter(status=Order.Status.DELIVERED, delivered_on=today).order_by("-delivered_at")
    )
    done_paid = {
        order_id: -total
        for order_id, total in LedgerEntry.objects.effective()
        .filter(order__in=done, kind=LedgerEntry.Kind.PAYMENT)
        .values_list("order_id")
        .annotate(t=Sum("amount"))
    }
    for o in done:
        o.paid = done_paid.get(o.pk, ZERO)
        o.unpaid = o.total - o.paid
    upcoming = Order.objects.filter(status=Order.Status.PENDING, delivery_date__gt=today).count()
    return render(request, "core/route.html", {
        "today": today, "groups": list(groups.items()), "pending_count": len(pending),
        "area_count": len(groups), "done": done, "upcoming": upcoming,
        "cylinders_pending": sum(o.cylinders for o in pending),
    })


# ------------------------------------------------------------------------ orders


@login_required
def order_list(request):
    status = request.GET.get("status", "pending")
    qs = Order.objects.with_details().order_by("-delivery_date", "-id")
    if status in {"pending", "delivered", "cancelled"}:
        qs = qs.filter(status=status)
    q = request.GET.get("q", "").strip()
    if q:
        qs = qs.filter(customer__in=Customer.objects.search(q))
    area = request.GET.get("area", "")
    if area.isdigit():
        qs = qs.filter(customer__area_id=int(area))
    counts = dict(Order.objects.values_list("status").annotate(n=Count("id")))
    chips = [
        ("pending", "بانتظار التوصيل", counts.get("pending", 0)),
        ("delivered", "تم التوصيل", counts.get("delivered", 0)),
        ("cancelled", "ملغي", counts.get("cancelled", 0)),
        ("all", "الكل", sum(counts.values())),
    ]
    page = paginate(request, qs)
    return render(request, "core/order_list.html", {
        "page": page, "status": status, "chips": chips, "q": q, "area": area,
        "areas": Area.objects.filter(is_active=True),
    })


@login_required
def order_pick(request):
    """Step 1 of a new order: find the customer."""
    q = request.GET.get("q", "").strip()
    customers = Customer.objects.filter(is_active=True).select_related("area").with_balance().search(q)
    page = paginate(request, customers.order_by("name"), per_page=30)
    return render(request, "core/order_pick.html", {"page": page, "q": q})


@login_required
def order_create(request, customer_id):
    customer = get_object_or_404(Customer, pk=customer_id, is_active=True)
    products = Product.objects.filter(is_active=True)
    if request.method == "POST":
        form = f.OrderForm(request.POST)
        if form.is_valid():
            try:
                order = s.create_order(
                    customer, request.user, form.quantities(),
                    source=form.cleaned_data["source"], delivery_date=form.cleaned_data["delivery_date"],
                    notes=form.cleaned_data["notes"],
                )
            except s.ServiceError as exc:
                _flash_error(request, exc)
            else:
                messages.success(request, f"تم تسجيل طلب {customer.name}: {order.items_summary}.")
                if order.delivery_date <= timezone.localdate():
                    return redirect("route")
                return redirect("order_detail", pk=order.pk)
    else:
        initial = {"delivery_date": timezone.localdate(), "source": "phone"}
        last = (
            Order.objects.filter(customer=customer, status=Order.Status.DELIVERED)
            .order_by("-delivered_at").prefetch_related("items").first()
        )
        if last:  # most customers re-order what they got last time
            for item in last.items.all():
                initial[f"qty_{item.product_id}"] = item.quantity
        elif products:
            initial[f"qty_{products[0].pk}"] = 1
        form = f.OrderForm(initial=initial)
    return render(request, "core/order_form.html", {
        "form": form, "customer": customer, "balance": customer.current_balance(), "editing": False,
    })


@login_required
def order_edit(request, pk):
    order = get_object_or_404(Order.objects.with_details(), pk=pk)
    if order.status != Order.Status.PENDING:
        messages.error(request, "ما تقدر تعدّل طلب تم توصيله أو إلغاؤه.")
        return redirect("order_detail", pk=pk)
    if request.method == "POST":
        form = f.OrderForm(request.POST)
        if form.is_valid():
            try:
                s.update_order(
                    order, form.quantities(), source=form.cleaned_data["source"],
                    delivery_date=form.cleaned_data["delivery_date"], notes=form.cleaned_data["notes"],
                )
            except s.ServiceError as exc:
                _flash_error(request, exc)
            else:
                messages.success(request, "تم تعديل الطلب.")
                return redirect("order_detail", pk=pk)
    else:
        initial = {"delivery_date": order.delivery_date, "source": order.source, "notes": order.notes}
        for item in order.items.all():
            initial[f"qty_{item.product_id}"] = item.quantity
        form = f.OrderForm(initial=initial)
    return render(request, "core/order_form.html", {
        "form": form, "customer": order.customer, "balance": order.customer.current_balance(),
        "editing": True, "order": order,
    })


@login_required
def order_detail(request, pk):
    order = get_object_or_404(Order.objects.with_details(), pk=pk)
    return render(request, "core/order_detail.html", {
        "order": order, "entries": order.entries.select_related("voided_by", "created_by"),
        "balance": order.customer.current_balance(),
    })


@login_required
def order_deliver(request, pk):
    order = get_object_or_404(Order.objects.with_details(), pk=pk)
    if order.status != Order.Status.PENDING:
        messages.info(request, "هذا الطلب تم توصيله أو إلغاؤه من قبل.")
        return redirect("order_detail", pk=pk)
    customer = order.customer
    if request.method == "POST":
        form = f.DeliveryForm(request.POST, order=order)
        if form.is_valid():
            d = form.cleaned_data
            try:
                s.deliver_order(
                    order, request.user, form.quantities(), pay_mode=d["pay_mode"],
                    paid_amount=d.get("paid_amount"), method=d["method"], note=d["note"],
                )
            except s.ServiceError as exc:
                _flash_error(request, exc)
            else:
                order = Order.objects.with_details().get(pk=pk)
                owed = customer.current_balance()
                msg = f"تم تسليم {customer.name}."
                if owed > 0:
                    msg += f" المتبقي عليه الحين: {owed:,.2f} د.إ."
                messages.success(request, msg)
                return redirect(safe_next(request, reverse("route")))
    else:
        form = f.DeliveryForm(order=order)
    balance = customer.current_balance()
    return render(request, "core/order_deliver.html", {
        "form": form, "order": order, "customer": customer, "balance": balance,
        "limit_warning": s.credit_warning(customer, order.total, balance),
        "next": safe_next(request, ""),
    })


@require_POST
@login_required
def order_cancel(request, pk):
    order = get_object_or_404(Order, pk=pk)
    try:
        s.cancel_order(order, request.user, request.POST.get("reason", ""))
    except s.ServiceError as exc:
        _flash_error(request, exc)
    else:
        messages.success(request, "تم إلغاء الطلب.")
    return redirect(safe_next(request, reverse("order_detail", args=[pk])))


@admin_required
def order_revert(request, pk):
    order = get_object_or_404(Order.objects.with_details(), pk=pk)
    back = reverse("order_detail", args=[pk])
    if request.method == "POST":
        form = f.ReasonForm(request.POST)
        if form.is_valid():
            try:
                s.revert_delivery(order, request.user, form.cleaned_data["reason"])
            except s.ServiceError as exc:
                _flash_error(request, exc)
            else:
                messages.success(request, "تم التراجع عن التسليم. الطلب رجع بانتظار التوصيل ومعه قيود المال ملغاة.")
                return redirect(back)
    else:
        form = f.ReasonForm()
    return form_page(
        request, form, title="التراجع عن التسليم", back=back, submit="تأكيد التراجع", danger=True,
        subtitle=f"{order.customer.name} · {order.items_summary}",
        hint="الدين والسداد المسجلين على هذا التسليم راح ينلغون (يبقون ظاهرين في السجل)، ويرجع الطلب بانتظار التوصيل.",
    )


# --------------------------------------------------------------------- customers


@login_required
def customer_list(request):
    qs = Customer.objects.select_related("area").with_balance().search(request.GET.get("q", ""))
    area = request.GET.get("area", "")
    if area.isdigit():
        qs = qs.filter(area_id=int(area))
    only_debt = request.GET.get("debt") == "1"
    if only_debt:
        qs = qs.filter(balance__gt=0)
    if request.GET.get("inactive") != "1":
        qs = qs.filter(is_active=True)
    page = paginate(request, qs.order_by("name"))
    return render(request, "core/customer_list.html", {
        "page": page, "q": request.GET.get("q", ""), "area": area, "only_debt": only_debt,
        "areas": Area.objects.filter(is_active=True), "total": Customer.objects.filter(is_active=True).count(),
    })


@login_required
def customer_create(request):
    admin = is_admin(request.user)
    if request.method == "POST":
        form = f.CustomerForm(request.POST, admin=admin)
        if form.is_valid():
            customer = form.save()
            opening = form.cleaned_data.get("opening_balance")
            if opening:
                s.add_opening_balance(customer, request.user, opening, date_=form.cleaned_data["opening_date"])
            messages.success(request, f"تمت إضافة {customer.name}.")
            if request.GET.get("then") == "order":
                return redirect("order_create", customer_id=customer.pk)
            return redirect("customer_detail", pk=customer.pk)
    else:
        form = f.CustomerForm(admin=admin)
    return form_page(
        request, form, title="عميل جديد", back=reverse("customer_list"), submit="حفظ العميل",
    )


@login_required
def customer_edit(request, pk):
    customer = get_object_or_404(Customer, pk=pk)
    form = f.CustomerForm(request.POST or None, instance=customer, admin=is_admin(request.user))
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "تم حفظ التعديلات.")
        return redirect("customer_detail", pk=pk)
    return form_page(request, form, title=f"تعديل {customer.name}", back=reverse("customer_detail", args=[pk]))


@login_required
def customer_detail(request, pk):
    customer = get_object_or_404(Customer.objects.select_related("area"), pk=pk)
    today = timezone.localdate()
    live = list(customer.entries.filter(voided=False).values_list("date", "amount", "id", "order_id"))
    aging = s.compute_aging(live, today)
    balance = aging.balance
    ledger = s.ledger_with_running_balance(customer)
    show_all = request.GET.get("all") == "1"
    orders = list(Order.objects.with_details().filter(customer=customer).order_by("-delivery_date", "-id")[:6])
    promises = list(customer.promises.filter(done=False))
    for p in promises:
        p.late = max((today - p.promised_date).days, 0)
    return render(request, "core/customer_detail.html", {
        "customer": customer, "aging": aging, "balance": balance, "ledger": ledger if show_all else ledger[:12],
        "ledger_total": len(ledger), "show_all": show_all, "orders": orders, "promises": promises,
        "limit_warning": s.credit_warning(customer, balance=balance),
        "wa_reminder": whatsapp_url(customer.phone, reminder_text(customer, balance)) if balance > 0 else "",
        "wa_chat": whatsapp_url(customer.phone),
        "buckets": list(zip(s.BUCKET_LABELS, aging.buckets)),
        "pending_orders": [o for o in orders if o.status == Order.Status.PENDING],
    })


@login_required
def customer_statement(request, pk):
    customer = get_object_or_404(Customer.objects.select_related("area"), pk=pk)
    today = timezone.localdate()
    rows = [r for r in reversed(s.ledger_with_running_balance(customer)) if not r.voided]
    aging = s.compute_aging([(r.date, r.amount, r.id, r.order_id) for r in rows], today)
    return render(request, "core/statement.html", {
        "customer": customer, "rows": rows, "aging": aging, "today": today,
        "buckets": list(zip(s.BUCKET_LABELS, aging.buckets)),
    })


def _money_action(request, pk, *, form_cls, title, submit, run, success, hint="", admin_only=False):
    if admin_only and not is_admin(request.user):
        raise PermissionDenied
    customer = get_object_or_404(Customer, pk=pk)
    back = safe_next(request, reverse("customer_detail", args=[pk]))
    if request.method == "POST":
        form = form_cls(request.POST)
        if form.is_valid():
            try:
                run(customer, form.cleaned_data)
            except s.ServiceError as exc:
                _flash_error(request, exc)
            else:
                messages.success(request, success(customer, form.cleaned_data))
                return redirect(back)
    else:
        form = form_cls()
    balance = customer.current_balance()
    sub = f"{customer.name} · عليه الحين {balance:,.2f} د.إ" if balance > 0 else customer.name
    return form_page(request, form, title=title, back=back, submit=submit, subtitle=sub, hint=hint)


@login_required
def customer_payment(request, pk):
    def run(c, d):
        s.record_payment(c, request.user, d["amount"], method=d["method"], date_=d["date"], note=d["note"])

    return _money_action(
        request, pk, form_cls=f.PaymentForm, title="تسجيل سداد", submit="تسجيل السداد", run=run,
        success=lambda c, d: f"تم تسجيل سداد {d['amount']:,.2f} د.إ من {c.name}. المتبقي: {c.current_balance():,.2f} د.إ.",
    )


@admin_required
def customer_opening(request, pk):
    def run(c, d):
        s.add_opening_balance(c, request.user, d["amount"], date_=d["date"], note=d["note"])

    return _money_action(
        request, pk, form_cls=f.OpeningForm, title="إضافة دين سابق", submit="إضافة الدين", run=run,
        success=lambda c, d: f"تمت إضافة دين سابق {d['amount']:,.2f} د.إ على {c.name}.",
        hint="للديون اللي كانت قبل بدء النظام. التاريخ التقريبي مهم لأنه يحدد عمر الدين.",
    )


@admin_required
def customer_writeoff(request, pk):
    def run(c, d):
        s.record_writeoff(c, request.user, d["amount"], note=d["note"])

    return _money_action(
        request, pk, form_cls=f.WriteoffForm, title="خصم أو إعفاء من الدين", submit="تسجيل الخصم", run=run,
        success=lambda c, d: f"تم خصم {d['amount']:,.2f} د.إ من دين {c.name}.",
        hint="هذا ينقص الدين بدون ما يكون في فلوس مدفوعة. السبب يبقى مسجل.",
    )


@login_required
def customer_promise(request, pk):
    def run(c, d):
        s.add_promise(c, request.user, d["promised_date"], d.get("amount"), d["note"])

    return _money_action(
        request, pk, form_cls=f.PromiseForm, title="وعد بالسداد", submit="تسجيل الوعد", run=run,
        success=lambda c, d: f"تم تسجيل وعد {c.name} بالسداد يوم {d['promised_date']:%Y-%m-%d}. بنذكّركم فيه.",
        hint="لما يقول العميل «أسدد يوم كذا»، سجّل التاريخ هنا والنظام ينبّهكم إذا مر اليوم وما سدد.",
    )


@require_POST
@login_required
def promise_done(request, pk):
    promise = get_object_or_404(PaymentPromise, pk=pk)
    promise.done, promise.done_at = True, timezone.now()
    promise.save(update_fields=["done", "done_at"])
    messages.success(request, "تم إغلاق الوعد.")
    return redirect(safe_next(request, reverse("customer_detail", args=[promise.customer_id])))


@admin_required
def entry_void(request, pk):
    entry = get_object_or_404(LedgerEntry.objects.select_related("customer"), pk=pk)
    back = reverse("customer_detail", args=[entry.customer_id])
    if request.method == "POST":
        form = f.ReasonForm(request.POST)
        if form.is_valid():
            try:
                s.void_entry(entry, request.user, form.cleaned_data["reason"])
            except s.ServiceError as exc:
                _flash_error(request, exc)
            else:
                messages.success(request, "تم إلغاء الحركة. تبقى ظاهرة في السجل مشطوبة.")
                return redirect(back)
    else:
        form = f.ReasonForm()
    return form_page(
        request, form, title="إلغاء حركة", back=back, submit="تأكيد الإلغاء", danger=True,
        subtitle=f"{entry.customer.name} · {entry.get_kind_display()} {abs(entry.amount):,.2f} د.إ",
        hint="الحركة ما تنحذف: تبقى في السجل مشطوبة مع اسمك والسبب، ويتعدل رصيد العميل.",
    )


# -------------------------------------------------------------------------- debts


def _debt_view_data(request):
    today = timezone.localdate()
    area = request.GET.get("area", "")
    rows = s.debt_rows(
        today, area_id=int(area) if area.isdigit() else None, search=request.GET.get("q", "")
    )
    counts = [0, 0, 0, 0]
    for r in rows:
        counts[s.bucket_index(r.oldest_age or 0)] += 1
    age = request.GET.get("age", "")
    if age in {"0", "1", "2", "3"}:
        rows = [r for r in rows if s.bucket_index(r.oldest_age or 0) == int(age)]
    if request.GET.get("sort") == "age":
        rows.sort(key=lambda r: -(r.oldest_age or 0))
    else:
        rows.sort(key=lambda r: -r.balance)
    return rows, counts, age, area


@login_required
def debts(request):
    rows, counts, age, area = _debt_view_data(request)
    all_count = sum(counts)
    for r in rows:
        r.wa = whatsapp_url(r.customer.phone, reminder_text(r.customer, r.balance))
    chips = [("", "الكل", all_count)] + [
        (str(i), label, counts[i]) for i, label in enumerate(s.BUCKET_LABELS)
    ]
    return render(request, "core/debts.html", {
        "rows": rows, "chips": chips, "age": age, "area": area, "q": request.GET.get("q", ""),
        "sort": request.GET.get("sort", ""), "areas": Area.objects.filter(is_active=True),
        "total": sum((r.balance for r in rows), ZERO), "overdue_days": s.OVERDUE_DAYS,
    })


def _csv_safe(value):
    """Stop spreadsheet programs from running text that starts like a formula."""
    value = "" if value is None else str(value)
    return "'" + value if value[:1] in ("=", "+", "-", "@", "\t", "\r") else value


@admin_required
def debts_csv(request):
    rows, _, _, _ = _debt_view_data(request)
    today = timezone.localdate()
    response = HttpResponse(content_type="text/csv; charset=utf-8")
    response["Content-Disposition"] = f'attachment; filename="debts-{today:%Y-%m-%d}.csv"'
    response.write("﻿")  # so Excel reads Arabic correctly
    w = csv.writer(response)
    w.writerow(["العميل", "الجوال", "المنطقة", "الرصيد (د.إ)", "حتى 30 يوم", "31-60 يوم", "61-90 يوم", "أكثر من 90 يوم",
                "تاريخ أقدم دين", "عمر أقدم دين (يوم)", "آخر سداد"])
    for r in rows:
        w.writerow([
            _csv_safe(r.customer.name), _csv_safe(r.customer.phone), _csv_safe(r.customer.area.name), r.balance,
            *r.aging.buckets, r.aging.oldest_date or "", r.oldest_age if r.oldest_age is not None else "",
            r.last_payment or "",
        ])
    return response


# --------------------------------------------------------------------- reports etc


@admin_required
def daily(request):
    try:
        day = datetime.strptime(request.GET.get("date", ""), "%Y-%m-%d").date()
    except ValueError:
        day = timezone.localdate()
    user_id = int(request.GET["user"]) if request.GET.get("user", "").isdigit() else None
    return render(request, "core/daily.html", {
        "day": day, "summary": s.daily_summary(day), "is_today": day == timezone.localdate(),
        "orders": Order.objects.with_details().filter(status=Order.Status.DELIVERED, delivered_on=day).order_by("delivered_at"),
        "feed": s.activity_feed(day, user_id), "user_id": user_id,
        "staff": User.objects.filter(is_active=True).order_by("first_name", "username"),
    })


def _simple_admin_list(request, *, model, form_cls, template, ctx_name, annotate=None):
    """List + 'add' form on one page (areas, products)."""
    if request.method == "POST":
        form = form_cls(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "تمت الإضافة.")
            return redirect(request.path)
    else:
        form = form_cls()
    qs = model.objects.all()
    if annotate:
        qs = qs.annotate(**annotate)
    return render(request, template, {ctx_name: qs, "form": form})


@admin_required
def areas(request):
    return _simple_admin_list(
        request, model=Area, form_cls=f.AreaForm, template="core/areas.html", ctx_name="areas",
        annotate={"n_customers": Count("customers", filter=Q(customers__is_active=True))},
    )


@admin_required
def area_edit(request, pk):
    area = get_object_or_404(Area, pk=pk)
    form = f.AreaForm(request.POST or None, instance=area)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "تم حفظ المنطقة.")
        return redirect("areas")
    return form_page(request, form, title=f"تعديل منطقة {area.name}", back=reverse("areas"))


@admin_required
def products(request):
    return _simple_admin_list(
        request, model=Product, form_cls=f.ProductForm, template="core/products.html", ctx_name="products",
    )


@admin_required
def product_edit(request, pk):
    product = get_object_or_404(Product, pk=pk)
    form = f.ProductForm(request.POST or None, instance=product)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "تم حفظ المنتج. الطلبات الجديدة فقط تستخدم السعر الجديد.")
        return redirect("products")
    return form_page(
        request, form, title=f"تعديل {product.name}", back=reverse("products"),
        hint="تغيير السعر ما يغيّر الطلبات اللي تم تسجيلها قبل. فقط الطلبات الجديدة.",
    )


@admin_required
def settings_view(request):
    form = f.SettingsForm(request.POST or None, instance=CompanySettings.get())
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "تم حفظ الإعدادات.")
        return redirect("settings")
    return form_page(request, form, title="الإعدادات", back=reverse("home"))


# ------------------------------------------------------------------------- users


def _acting_owner(request) -> bool:
    return get_role(request.user) == Role.OWNER


@admin_required
def users(request):
    rows = [(u, get_role(u)) for u in User.objects.order_by("-is_active", "first_name", "username")]
    labels = dict(Role.choices)
    return render(request, "core/users.html", {
        "rows": [(u, labels.get(r, r)) for u, r in rows],
    })


@admin_required
def user_create(request):
    form = f.UserCreateForm(request.POST or None, acting_owner=_acting_owner(request))
    if request.method == "POST" and form.is_valid():
        user = form.save()
        messages.success(request, f"تم إنشاء حساب {user.first_name}. اسم الدخول: {user.username}")
        return redirect("users")
    return form_page(request, form, title="مستخدم جديد", back=reverse("users"), submit="إنشاء الحساب")


@admin_required
def user_edit(request, pk):
    target = get_object_or_404(User, pk=pk)
    if get_role(target) == Role.OWNER and not _acting_owner(request):
        raise PermissionDenied
    editing_self = target.pk == request.user.pk
    form = f.UserEditForm(
        request.POST or None, user=target, acting_owner=_acting_owner(request), editing_self=editing_self,
        initial={"first_name": target.first_name, "role": get_role(target), "is_active": target.is_active},
    )
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "تم حفظ التعديلات.")
        return redirect("users")
    return form_page(request, form, title=f"تعديل {target.first_name or target.username}", back=reverse("users"))


@login_required
def more(request):
    return render(request, "core/more.html")
