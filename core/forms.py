from decimal import Decimal

from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone

from .models import (
    Area,
    CompanySettings,
    Customer,
    LedgerEntry,
    Order,
    Product,
    Profile,
    Role,
)
from .text import normalize_phone

User = get_user_model()


class Styled:
    """Give every widget the CSS class the stylesheet expects."""

    def style_fields(self):
        for field in self.fields.values():
            w = field.widget
            if isinstance(w, (forms.CheckboxInput, forms.RadioSelect)):
                continue
            kind = "select" if isinstance(w, forms.Select) else "textarea" if isinstance(w, forms.Textarea) else "input"
            w.attrs["class"] = f'{w.attrs.get("class", "")} {kind}'.strip()


class StyledForm(Styled, forms.Form):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.style_fields()


class StyledModelForm(Styled, forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.style_fields()


def money_field(label, *, required=True, help_text="", min_value="0.01"):
    return forms.DecimalField(
        label=label, required=required, help_text=help_text, max_digits=10, decimal_places=2,
        min_value=Decimal(min_value) if min_value is not None else None,
        widget=forms.NumberInput(attrs={"inputmode": "decimal", "step": "0.01", "placeholder": "0.00"}),
    )


# ---------------------------------------------------------------------- customers


class CustomerForm(StyledModelForm):
    opening_balance = money_field(
        "الدين الحالي على العميل (إن وجد)", required=False,
        help_text="دين قديم قبل بدء النظام. اتركه فاضي إذا ما عليه شي.", min_value="0.01",
    )
    opening_date = forms.DateField(
        label="من متى هذا الدين؟", required=False, widget=forms.DateInput(attrs={"type": "date"}),
        help_text="تقريباً. هذا التاريخ يحدد «عمر الدين» في التقارير.",
    )

    class Meta:
        model = Customer
        fields = ["name", "phone", "phone2", "area", "address", "location_url", "credit_limit", "notes", "is_active"]
        widgets = {
            "phone": forms.TextInput(attrs={"type": "tel", "inputmode": "tel", "dir": "ltr", "placeholder": "050 123 4567"}),
            "phone2": forms.TextInput(attrs={"type": "tel", "inputmode": "tel", "dir": "ltr"}),
            "location_url": forms.URLInput(attrs={"dir": "ltr", "placeholder": "https://maps.app.goo.gl/..."}),
            "notes": forms.Textarea(attrs={"rows": 2}),
            "credit_limit": forms.NumberInput(attrs={"inputmode": "decimal", "step": "0.01"}),
        }

    def __init__(self, *args, admin=False, **kwargs):
        super().__init__(*args, **kwargs)
        editing = bool(self.instance.pk)
        areas = Area.objects.filter(is_active=True)
        if editing:
            areas = Area.objects.filter(is_active=True) | Area.objects.filter(pk=self.instance.area_id)
        self.fields["area"].queryset = areas.distinct()
        self.fields["area"].empty_label = "اختر المنطقة"
        self.fields["phone"].required = True
        if not admin:  # drivers fix contact details but cannot change money rules
            for name in ("credit_limit", "is_active"):
                del self.fields[name]
        if editing or not admin:
            del self.fields["opening_balance"]
            del self.fields["opening_date"]
        elif not self.is_bound:
            self.fields["opening_date"].initial = timezone.localdate()

    def clean_phone(self):
        phone = self.cleaned_data["phone"].strip()
        if len(normalize_phone(phone)) < 9:
            raise forms.ValidationError("رقم الجوال غير صحيح.")
        return phone

    def clean(self):
        data = super().clean()
        if data.get("opening_balance") and not data.get("opening_date"):
            data["opening_date"] = timezone.localdate()
        return data


# ------------------------------------------------------------------------ orders


class OrderForm(StyledForm):
    """One quantity box per active product, so taking an order is a few taps."""

    source = forms.ChoiceField(label="كيف وصل الطلب؟", choices=Order.Source.choices)
    delivery_date = forms.DateField(label="يوصل متى؟", widget=forms.DateInput(attrs={"type": "date"}))
    notes = forms.CharField(label="ملاحظات", required=False, max_length=200)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.products = list(Product.objects.filter(is_active=True))
        for p in self.products:
            self.fields[f"qty_{p.pk}"] = forms.IntegerField(
                label=p.name, required=False, min_value=0, max_value=99, initial=0,
                widget=forms.NumberInput(attrs={"inputmode": "numeric", "class": "qty-input", "min": 0, "max": 99}),
            )

    def product_rows(self):
        return [(p, self[f"qty_{p.pk}"]) for p in self.products]

    def clean(self):
        data = super().clean()
        if not any((data.get(f"qty_{p.pk}") or 0) > 0 for p in self.products):
            raise forms.ValidationError("اختر اسطوانة واحدة على الأقل.")
        return data

    def quantities(self) -> dict:
        return {p.pk: self.cleaned_data.get(f"qty_{p.pk}") or 0 for p in self.products}


class DeliveryForm(StyledForm):
    pay_mode = forms.ChoiceField(
        label="الدفع", widget=forms.RadioSelect,
        choices=[("full", "دفع كامل"), ("none", "آجل (دين)"), ("partial", "دفع جزء")],
        initial="full",
    )
    paid_amount = money_field("المبلغ المدفوع", required=False)
    method = forms.ChoiceField(label="طريقة الدفع", choices=LedgerEntry.Method.choices, initial="cash")
    note = forms.CharField(label="ملاحظة", required=False, max_length=200)

    def __init__(self, *args, order, **kwargs):
        super().__init__(*args, **kwargs)
        self.order = order
        self.items = list(order.items.select_related("product"))
        for item in self.items:
            self.fields[f"qty_{item.pk}"] = forms.IntegerField(
                label=item.product.name, min_value=0, max_value=99, initial=item.quantity,
                widget=forms.NumberInput(attrs={"inputmode": "numeric", "class": "qty-input", "min": 0, "max": 99}),
            )

    def item_rows(self):
        return [(item, self[f"qty_{item.pk}"]) for item in self.items]

    def clean(self):
        data = super().clean()
        if data.get("pay_mode") == "partial" and not data.get("paid_amount"):
            self.add_error("paid_amount", "اكتب المبلغ اللي دفعه العميل.")
        return data

    def quantities(self) -> dict:
        return {item.pk: self.cleaned_data.get(f"qty_{item.pk}") or 0 for item in self.items}


# ------------------------------------------------------------------------- money


class PaymentForm(StyledForm):
    amount = money_field("المبلغ")
    method = forms.ChoiceField(label="طريقة الدفع", choices=LedgerEntry.Method.choices, initial="cash")
    date = forms.DateField(label="تاريخ السداد", widget=forms.DateInput(attrs={"type": "date"}))
    note = forms.CharField(label="ملاحظة", required=False, max_length=200)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        today = timezone.localdate()
        self.fields["date"].initial = today
        self.fields["date"].widget.attrs["max"] = today.isoformat()

    def clean_date(self):
        d = self.cleaned_data["date"]
        if d > timezone.localdate():
            raise forms.ValidationError("تاريخ السداد لا يكون في المستقبل.")
        return d


class OpeningForm(StyledForm):
    amount = money_field("مبلغ الدين")
    date = forms.DateField(
        label="من متى هذا الدين؟", widget=forms.DateInput(attrs={"type": "date"}),
        help_text="تقريباً. يحدد عمر الدين في تقرير الأعمار.",
    )
    note = forms.CharField(label="ملاحظة", required=False, max_length=200)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["date"].initial = timezone.localdate()


class WriteoffForm(StyledForm):
    amount = money_field("المبلغ المخصوم")
    note = forms.CharField(label="السبب", max_length=200, help_text="مثال: خصم من المدير، تنازل عن الباقي.")


class PromiseForm(StyledForm):
    promised_date = forms.DateField(label="يسدد متى؟", widget=forms.DateInput(attrs={"type": "date"}))
    amount = money_field("كم بيسدد؟ (اختياري)", required=False)
    note = forms.CharField(label="ملاحظة", required=False, max_length=200)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        today = timezone.localdate()
        self.fields["promised_date"].widget.attrs["min"] = today.isoformat()


class ReasonForm(StyledForm):
    reason = forms.CharField(label="السبب", max_length=200)


# ---------------------------------------------------------------------- admin data


class AreaForm(StyledModelForm):
    class Meta:
        model = Area
        fields = ["name", "delivery_days", "sort_order", "is_active"]


class ProductForm(StyledModelForm):
    class Meta:
        model = Product
        fields = ["name", "price", "sort_order", "is_active"]
        widgets = {"price": forms.NumberInput(attrs={"inputmode": "decimal", "step": "0.01"})}


class SettingsForm(StyledModelForm):
    class Meta:
        model = CompanySettings
        fields = ["company_name", "payment_note"]


class UserCreateForm(StyledForm):
    username = forms.CharField(label="اسم الدخول", max_length=150, widget=forms.TextInput(attrs={"dir": "ltr", "autocapitalize": "none"}))
    first_name = forms.CharField(label="الاسم الظاهر", max_length=150)
    role = forms.ChoiceField(label="الصلاحية", choices=Role.choices, initial=Role.DRIVER)
    password = forms.CharField(label="كلمة السر", widget=forms.PasswordInput(attrs={"autocomplete": "new-password"}), help_text="٦ خانات على الأقل.")

    def __init__(self, *args, acting_owner=False, **kwargs):
        super().__init__(*args, **kwargs)
        if not acting_owner:
            self.fields["role"].choices = [c for c in Role.choices if c[0] != Role.OWNER]

    def clean_username(self):
        username = self.cleaned_data["username"].strip().lower()
        if User.objects.filter(username__iexact=username).exists():
            raise forms.ValidationError("اسم الدخول مستخدم من قبل.")
        return username

    def clean_password(self):
        pw = self.cleaned_data["password"]
        validate_password(pw)
        return pw

    def save(self):
        d = self.cleaned_data
        user = User.objects.create_user(username=d["username"], password=d["password"], first_name=d["first_name"])
        Profile.objects.create(user=user, role=d["role"])
        return user


class UserEditForm(StyledForm):
    first_name = forms.CharField(label="الاسم الظاهر", max_length=150)
    role = forms.ChoiceField(label="الصلاحية", choices=Role.choices)
    is_active = forms.BooleanField(label="الحساب فعّال", required=False)
    new_password = forms.CharField(
        label="كلمة سر جديدة", required=False, widget=forms.PasswordInput(attrs={"autocomplete": "new-password"}),
        help_text="اتركها فاضية إذا ما تبي تغيّرها.",
    )

    def __init__(self, *args, user, acting_owner=False, editing_self=False, **kwargs):
        super().__init__(*args, **kwargs)
        self.target = user
        if not acting_owner:
            self.fields["role"].choices = [c for c in Role.choices if c[0] != Role.OWNER]
        if editing_self:  # you cannot lock yourself out or demote yourself by accident
            del self.fields["role"]
            del self.fields["is_active"]

    def clean_new_password(self):
        pw = self.cleaned_data["new_password"]
        if pw:
            validate_password(pw, self.target)
        return pw

    def save(self):
        d = self.cleaned_data
        u = self.target
        u.first_name = d["first_name"]
        if "is_active" in d:
            u.is_active = d["is_active"]
        if d.get("new_password"):
            u.set_password(d["new_password"])
        u.save()
        if "role" in d:
            Profile.objects.update_or_create(user=u, defaults={"role": d["role"]})
        return u
