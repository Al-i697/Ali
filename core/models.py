"""Data model.

The heart of the system is `LedgerEntry`: every debt and every payment of a
customer is one immutable row. Rows are never deleted or edited; a mistake is
"voided" (kept on screen, struck through, with who/when/why), so the history
can always be audited and a customer's balance is always the sum of the rows
that are not voided.
"""
from decimal import Decimal

from django.conf import settings
from django.db import models
from django.db.models import DecimalField, Max, Q, Sum
from django.db.models.functions import Coalesce
from django.utils import timezone

from .text import normalize_arabic, normalize_phone

MONEY = {"max_digits": 10, "decimal_places": 2}
ZERO = Decimal("0.00")


class Role(models.TextChoices):
    OWNER = "owner", "مدير الشركة"
    MANAGER = "manager", "مدير"
    DRIVER = "driver", "سائق"


class CompanySettings(models.Model):
    """A single row with the company's name and the text added to reminders."""

    company_name = models.CharField("اسم الشركة", max_length=120, default="شركة الغاز")
    payment_note = models.CharField(
        "ملاحظة الدفع (تظهر في رسائل التذكير)",
        max_length=255,
        blank=True,
        help_text="مثال: التحويل على حساب رقم ... أو الدفع نقداً للسائق.",
    )

    class Meta:
        verbose_name = "إعدادات الشركة"

    def __str__(self):
        return self.company_name

    @classmethod
    def get(cls) -> "CompanySettings":
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField("الصلاحية", max_length=10, choices=Role.choices, default=Role.DRIVER)

    def __str__(self):
        return f"{self.user} ({self.get_role_display()})"


class Area(models.Model):
    name = models.CharField("اسم المنطقة", max_length=80, unique=True)
    delivery_days = models.CharField("أيام التوزيع", max_length=80, blank=True, help_text="مثال: السبت والثلاثاء")
    sort_order = models.PositiveIntegerField("الترتيب", default=0)
    is_active = models.BooleanField("فعّالة", default=True)

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField("الاسم", max_length=80, unique=True)
    price = models.DecimalField("السعر", **MONEY)
    sort_order = models.PositiveIntegerField("الترتيب", default=0)
    is_active = models.BooleanField("فعّال", default=True)

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name


class CustomerQuerySet(models.QuerySet):
    def with_balance(self):
        """Annotate every customer with `balance` (positive = he owes us)."""
        return self.annotate(
            balance=Coalesce(
                Sum("entries__amount", filter=Q(entries__voided=False)),
                ZERO,
                output_field=DecimalField(**MONEY),
            ),
            last_payment_date=Max(
                "entries__date", filter=Q(entries__voided=False, entries__kind="payment")
            ),
        )

    def search(self, text: str):
        """Name/address/phone search that ignores Arabic spelling variants."""
        text = (text or "").strip()
        if not text:
            return self
        qs = self
        digits = "".join(ch for ch in text if ch.isdigit())
        if digits and len(digits) >= len(text.replace(" ", "")) - 1:
            core = digits.lstrip("0")
            if core.startswith("971"):
                core = core[3:]
            if core:
                return qs.filter(Q(phone_digits__contains=core) | Q(phone2_digits__contains=core))
        for token in normalize_arabic(text).split():
            qs = qs.filter(search_text__contains=token)
        return qs


class Customer(models.Model):
    name = models.CharField("الاسم", max_length=120)
    phone = models.CharField("رقم الجوال", max_length=32, blank=True)
    phone2 = models.CharField("رقم ثاني", max_length=32, blank=True)
    area = models.ForeignKey(Area, verbose_name="المنطقة", on_delete=models.PROTECT, related_name="customers")
    address = models.CharField("العنوان / وصف البيت", max_length=200, blank=True)
    location_url = models.URLField("رابط الموقع (قوقل ماب)", max_length=500, blank=True)
    credit_limit = models.DecimalField(
        "حد الدين", default=ZERO, help_text="0 = بدون حد. يظهر تحذير لما يتجاوزه العميل.", **MONEY
    )
    notes = models.TextField("ملاحظات", blank=True)
    is_active = models.BooleanField("فعّال", default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Derived, kept in sync in save(); used only for searching.
    search_text = models.CharField(max_length=400, blank=True, editable=False)
    phone_digits = models.CharField(max_length=20, blank=True, editable=False, db_index=True)
    phone2_digits = models.CharField(max_length=20, blank=True, editable=False)

    objects = CustomerQuerySet.as_manager()

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.search_text = normalize_arabic(f"{self.name} {self.address}")
        self.phone_digits = normalize_phone(self.phone)
        self.phone2_digits = normalize_phone(self.phone2)
        super().save(*args, **kwargs)

    def current_balance(self) -> Decimal:
        total = self.entries.filter(voided=False).aggregate(t=Sum("amount"))["t"]
        return total or ZERO


class OrderQuerySet(models.QuerySet):
    def with_details(self):
        return self.select_related("customer", "customer__area", "created_by", "delivered_by").prefetch_related(
            "items__product"
        )


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "بانتظار التوصيل"
        DELIVERED = "delivered", "تم التوصيل"
        CANCELLED = "cancelled", "ملغي"

    class Source(models.TextChoices):
        PHONE = "phone", "اتصال"
        WHATSAPP = "whatsapp", "واتساب"
        VISIT = "visit", "طلب مباشر"
        OTHER = "other", "أخرى"

    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="orders")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING, db_index=True)
    source = models.CharField("وصل الطلب عن طريق", max_length=10, choices=Source.choices, default=Source.PHONE)
    delivery_date = models.DateField("تاريخ التوصيل المطلوب", default=timezone.localdate)
    notes = models.CharField("ملاحظات", max_length=200, blank=True)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)

    delivered_at = models.DateTimeField(null=True, blank=True)
    delivered_on = models.DateField(null=True, blank=True, db_index=True)
    delivered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.PROTECT, related_name="+"
    )
    cancel_reason = models.CharField(max_length=200, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.PROTECT, related_name="+"
    )

    objects = OrderQuerySet.as_manager()

    class Meta:
        ordering = ["delivery_date", "id"]

    def __str__(self):
        return f"طلب {self.pk} - {self.customer}"

    @property
    def total(self) -> Decimal:
        return sum((i.line_total for i in self.items.all()), ZERO)

    @property
    def cylinders(self) -> int:
        return sum(i.quantity for i in self.items.all())

    @property
    def items_summary(self) -> str:
        return "، ".join(f"{i.quantity} × {i.product.name}" for i in self.items.all())

    @property
    def is_late(self) -> bool:
        return self.status == self.Status.PENDING and self.delivery_date < timezone.localdate()


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="+")
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(**MONEY)

    class Meta:
        ordering = ["product__sort_order", "id"]

    @property
    def line_total(self) -> Decimal:
        return (self.unit_price * self.quantity).quantize(ZERO)


class LedgerQuerySet(models.QuerySet):
    def effective(self):
        return self.filter(voided=False)


class LedgerEntry(models.Model):
    class Kind(models.TextChoices):
        OPENING = "opening", "رصيد سابق"
        CHARGE = "charge", "توصيل"
        PAYMENT = "payment", "سداد"
        WRITEOFF = "writeoff", "خصم / إعفاء"

    class Method(models.TextChoices):
        CASH = "cash", "نقد"
        TRANSFER = "transfer", "تحويل"
        CHEQUE = "cheque", "شيك"
        CARD = "card", "بطاقة"

    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="entries")
    kind = models.CharField(max_length=10, choices=Kind.choices)
    # Signed: positive = the customer owes more, negative = he owes less.
    amount = models.DecimalField(**MONEY)
    date = models.DateField(default=timezone.localdate)
    method = models.CharField(max_length=10, choices=Method.choices, blank=True)
    note = models.CharField(max_length=200, blank=True)
    order = models.ForeignKey(Order, null=True, blank=True, on_delete=models.PROTECT, related_name="entries")

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)

    voided = models.BooleanField(default=False, db_index=True)
    voided_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.PROTECT, related_name="+"
    )
    voided_at = models.DateTimeField(null=True, blank=True)
    void_reason = models.CharField(max_length=200, blank=True)

    objects = LedgerQuerySet.as_manager()

    class Meta:
        ordering = ["-date", "-id"]
        indexes = [models.Index(fields=["customer", "voided"])]

    def __str__(self):
        return f"{self.get_kind_display()} {self.amount} - {self.customer}"

    @property
    def is_debit(self) -> bool:
        return self.amount > 0

    @property
    def can_void(self) -> bool:
        """A delivery's charge is cancelled by reverting the delivery, never alone."""
        return not self.voided and not (self.order_id and self.kind == self.Kind.CHARGE)


class PaymentPromise(models.Model):
    """'أسدد يوم 15': the customer's word, so we know when to follow up."""

    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="promises")
    promised_date = models.DateField("تاريخ الوعد")
    amount = models.DecimalField("المبلغ الموعود", null=True, blank=True, **MONEY)
    note = models.CharField("ملاحظة", max_length=200, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)
    done = models.BooleanField(default=False, db_index=True)
    done_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["promised_date", "id"]

    def __str__(self):
        return f"وعد {self.customer} {self.promised_date}"

    @property
    def days_overdue(self) -> int:
        return (timezone.localdate() - self.promised_date).days
