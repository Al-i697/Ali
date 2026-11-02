"""Fill an empty database with SAMPLE data so the screens can be tried out.

    python manage.py seed_demo

Everything created here is fake (names, phones, amounts). Do not run it on the
real database: it refuses unless the database has no customers yet.
"""
import random
from datetime import datetime, time, timedelta
from decimal import Decimal as D

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from core.models import (
    Area, CompanySettings, Customer, LedgerEntry, Order, OrderItem, PaymentPromise, Product, Profile, Role,
)

User = get_user_model()

AREAS = [("النعيمية", "السبت والثلاثاء"), ("الراشدية", "الأحد والأربعاء"), ("المويهات", "الاثنين والخميس"), ("الجرف", "")]
PRODUCTS = [("اسطوانة 12 كجم", D("65.00")), ("اسطوانة 25 كجم", D("120.00")), ("اسطوانة 45 كجم", D("200.00"))]
NAMES = [
    "أحمد المنصوري", "سالم الكعبي", "فاطمة النعيمي", "خالد الشامسي", "مريم الظاهري", "محمد الزعابي", "عبدالله المرزوقي",
    "موزة الكتبي", "راشد السويدي", "علي بن حيدر", "حمد المهيري", "شيخة الفلاسي", "سعيد القبيسي", "نورة العامري",
    "يوسف البلوشي", "ماجد الحوسني", "هند المزروعي", "سلطان الدرعي", "عائشة الهاجري", "جاسم الرميثي",
    "مطعم الديوان", "مخبز الصباح", "كافتيريا النخيل", "مطبخ الأصيل", "بقالة السلام", "مغسلة اللؤلؤ",
    "ناصر الجنيبي", "لطيفة الشحي",
]


class Command(BaseCommand):
    help = "تعبئة بيانات تجريبية للتجربة فقط."

    @transaction.atomic
    def handle(self, *args, **options):
        if Customer.objects.exists():
            raise CommandError("قاعدة البيانات فيها عملاء. هذا الأمر للتجربة على قاعدة فاضية فقط.")
        rng = random.Random(7)
        today = timezone.localdate()
        tz = timezone.get_current_timezone()

        owner = User.objects.create_user("owner", password="demo1234", first_name="مدير الشركة", is_superuser=True, is_staff=True)
        manager = User.objects.create_user("manager", password="demo1234", first_name="المدير")
        Profile.objects.create(user=manager, role=Role.MANAGER)
        driver = User.objects.create_user("driver", password="demo1234", first_name="سالم السائق")
        Profile.objects.create(user=driver, role=Role.DRIVER)
        driver2 = User.objects.create_user("driver2", password="demo1234", first_name="بديل السائق")
        Profile.objects.create(user=driver2, role=Role.DRIVER)

        settings_ = CompanySettings.get()
        settings_.company_name = "شركة الغاز"
        settings_.payment_note = "الدفع نقداً للسائق أو تحويل على الحساب (بيانات تجريبية)."
        settings_.save()

        areas = [Area.objects.create(name=n, delivery_days=d, sort_order=i) for i, (n, d) in enumerate(AREAS)]
        products = [Product.objects.create(name=n, price=p, sort_order=i) for i, (n, p) in enumerate(PRODUCTS)]
        p12, p25, p45 = products

        customers = []
        for i, name in enumerate(NAMES):
            business = name.startswith(("مطعم", "مخبز", "كافتيريا", "مطبخ", "بقالة", "مغسلة"))
            customers.append(Customer.objects.create(
                name=name, phone=f"0500{i + 1:06d}", area=areas[i % len(areas)],
                address=f"{'محل' if business else 'فيلا'} {rng.randint(1, 60)} - شارع {rng.randint(1, 20)}",
                location_url="https://maps.google.com/?q=25.4,55.4" if i % 3 == 0 else "",
                credit_limit=D("1000") if business else D("0"),
            ))

        def add_order(customer, day, items, by):
            when = timezone.make_aware(datetime.combine(day, time(rng.randint(9, 17), rng.randint(0, 59))), tz)
            order = Order.objects.create(
                customer=customer, status=Order.Status.DELIVERED, source=rng.choice(["phone", "whatsapp", "phone"]),
                delivery_date=day, created_by=by, delivered_at=when, delivered_on=day, delivered_by=by,
            )
            total = D("0")
            for product, qty in items:
                OrderItem.objects.create(order=order, product=product, quantity=qty, unit_price=product.price)
                total += product.price * qty
            charge = LedgerEntry.objects.create(customer=customer, kind="charge", amount=total, date=day, order=order, created_by=by)
            if day < today:  # history should look like history, not like something typed in today
                Order.objects.filter(pk=order.pk).update(created_at=when - timedelta(hours=rng.randint(1, 20)))
                LedgerEntry.objects.filter(pk=charge.pk).update(created_at=when)
            return order, total

        def pay(customer, day, amount, by, order=None):
            if amount > 0 and day <= today:
                entry = LedgerEntry.objects.create(
                    customer=customer, kind="payment", amount=-amount, date=day, order=order,
                    method=rng.choice(["cash", "cash", "transfer"]), created_by=by,
                )
                if day < today:
                    noon = timezone.make_aware(datetime.combine(day, time(12, 0)), tz)
                    LedgerEntry.objects.filter(pk=entry.pk).update(created_at=noon)

        for customer in customers:
            profile = rng.choices(["good", "credit", "slow", "partial"], [50, 25, 15, 10])[0]
            every = rng.randint(14, 40) if customer.name.startswith(("مطعم", "مخبز", "كافتيريا", "مطبخ")) else rng.randint(24, 45)
            day = today - timedelta(days=rng.randint(100, 125))
            owed_days = []
            while True:
                day += timedelta(days=max(7, every + rng.randint(-4, 4)))
                if day > today - timedelta(days=2):
                    break
                by = rng.choice([driver, driver, driver2])
                product = rng.choices([p12, p25, p45], [70, 10, 20])[0]
                order, total = add_order(customer, day, [(product, rng.choice([1, 1, 2]))], by)
                if profile == "good":
                    pay(customer, day, total, by, order)
                elif profile == "partial":
                    pay(customer, day, (total / 2).quantize(D("0.01")), by, order)
                elif profile == "credit":
                    owed_days.append(day)
                    if len(owed_days) >= 2 and rng.random() < 0.8:
                        pay(customer, day + timedelta(days=rng.randint(3, 12)), customer.current_balance() or D(0), manager)
                        owed_days = []
                elif rng.random() < 0.25:
                    pay(customer, day + timedelta(days=rng.randint(5, 20)), D(rng.choice([50, 65, 100])), manager)
            # keep balances realistic: a payment can never exceed what is owed
            balance = customer.current_balance()
            if balance < 0:
                LedgerEntry.objects.filter(customer=customer, kind="payment").order_by("-id").first().delete()

        # three old debts that existed before the system
        for customer, amount, age in [(customers[3], D("340.00"), 130), (customers[9], D("180.00"), 75), (customers[22], D("620.00"), 52)]:
            LedgerEntry.objects.create(
                customer=customer, kind="opening", amount=amount, date=today - timedelta(days=age),
                note="رصيد سابق قبل النظام", created_by=owner,
            )

        # today's work: some pending orders, one late, one for tomorrow
        todo = [(customers[0], 0), (customers[4], 0), (customers[10], 0), (customers[20], 0), (customers[12], -1), (customers[25], 1), (customers[7], 0)]
        for customer, offset in todo:
            if customer.orders.filter(status="pending").exists():
                continue
            order = Order.objects.create(
                customer=customer, delivery_date=today + timedelta(days=offset), source="phone", created_by=manager,
                notes="اتصل قبل ما توصل" if customer is customers[4] else "",
            )
            OrderItem.objects.create(order=order, product=p12, quantity=rng.choice([1, 2]), unit_price=p12.price)

        # two deliveries done earlier today
        for customer, mode in [(customers[15], "full"), (customers[18], "credit")]:
            order, total = add_order(customer, today, [(p12, 1)], driver)
            if mode == "full":
                pay(customer, today, total, driver, order)

        # promises to pay
        debtors = sorted((c for c in customers if c.current_balance() > 0), key=lambda c: -c.current_balance())
        for customer, offset in zip(debtors[:3], (0, -3, 5)):
            PaymentPromise.objects.create(
                customer=customer, promised_date=today + timedelta(days=offset),
                amount=(customer.current_balance() / 2).quantize(D("1")), created_by=manager,
                note="قال يسدد بعد الراتب",
            )

        self.stdout.write(self.style.SUCCESS(f"تم: {len(customers)} عميل، {Order.objects.count()} طلب."))
        self.stdout.write("حسابات التجربة (كلمة السر لكلها demo1234): owner (مدير الشركة)، manager (مدير)، driver (سائق)، driver2 (سائق بديل).")
        self.stdout.write(self.style.WARNING("هذي بيانات تجريبية. لا تستخدمها في العمل الحقيقي."))
