from datetime import timedelta
from decimal import Decimal as D

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from core import services as s
from core.models import Area, Customer, LedgerEntry, Order, PaymentPromise, Product, Profile, Role

User = get_user_model()


class ViewBase(TestCase):
    def setUp(self):
        cache.clear()
        self.owner = User.objects.create_user("owner", password="pw12345", first_name="المدير العام", is_superuser=True)
        self.manager = User.objects.create_user("mgr", password="pw12345", first_name="المدير")
        Profile.objects.create(user=self.manager, role=Role.MANAGER)
        self.driver = User.objects.create_user("drv", password="pw12345", first_name="السائق")
        Profile.objects.create(user=self.driver, role=Role.DRIVER)
        self.area = Area.objects.create(name="النعيمية", delivery_days="السبت")
        self.p12 = Product.objects.create(name="اسطوانة 12 كجم", price=D("65.00"))
        self.c = Customer.objects.create(name="أحمد المنصوري", phone="0501234567", area=self.area, address="فيلا 4")
        self.order = s.create_order(
            self.c, self.driver, {self.p12.pk: 2}, source="phone", delivery_date=timezone.localdate()
        )
        s.add_opening_balance(self.c, self.owner, D("200"), date_=timezone.localdate() - timedelta(days=45))

    def login(self, user):
        self.client.force_login(user)

    def balance(self):
        return self.c.current_balance()


class AccessTests(ViewBase):
    def admin_urls(self):
        c, o = self.c.pk, self.order.pk
        e = self.c.entries.first().pk
        return [
            reverse("home"), reverse("daily"), reverse("areas"), reverse("products"), reverse("users"),
            reverse("user_create"), reverse("settings"), reverse("debts_csv"), reverse("area_edit", args=[self.area.pk]),
            reverse("product_edit", args=[self.p12.pk]), reverse("user_edit", args=[self.driver.pk]),
            reverse("customer_opening", args=[c]), reverse("customer_writeoff", args=[c]),
            reverse("entry_void", args=[e]), reverse("order_revert", args=[o]),
        ]

    def shared_urls(self):
        c, o = self.c.pk, self.order.pk
        return [
            reverse("route"), reverse("more"), reverse("order_list"), reverse("order_pick"),
            reverse("order_create", args=[c]), reverse("order_detail", args=[o]), reverse("order_edit", args=[o]),
            reverse("order_deliver", args=[o]), reverse("customer_list"), reverse("customer_create"),
            reverse("customer_detail", args=[c]), reverse("customer_edit", args=[c]),
            reverse("customer_payment", args=[c]), reverse("customer_promise", args=[c]),
            reverse("customer_statement", args=[c]), reverse("debts"),
            reverse("customer_list") + "?q=احمد&debt=1", reverse("debts") + "?age=1&sort=age",
            reverse("order_list") + "?status=all&q=احمد", reverse("order_pick") + "?q=0501234567",
        ]

    def test_anonymous_users_are_sent_to_login(self):
        for url in self.admin_urls() + self.shared_urls():
            r = self.client.get(url)
            self.assertEqual(r.status_code, 302, url)
            self.assertIn(reverse("login"), r["Location"], url)

    def test_every_page_opens_for_admins(self):
        for user in (self.owner, self.manager):
            self.login(user)
            for url in self.admin_urls() + self.shared_urls():
                self.assertEqual(self.client.get(url).status_code, 200, f"{user} {url}")

    def test_drivers_get_the_daily_pages_and_are_refused_the_rest(self):
        self.login(self.driver)
        for url in self.shared_urls():
            self.assertEqual(self.client.get(url).status_code, 200, url)
        self.assertRedirects(self.client.get(reverse("home")), reverse("route"))
        for url in self.admin_urls():
            if url == reverse("home"):
                continue
            self.assertEqual(self.client.get(url).status_code, 403, url)

    def test_drivers_cannot_post_admin_actions(self):
        self.login(self.driver)
        pay = s.record_payment(self.c, self.owner, D("10"), method="cash")
        self.assertEqual(self.client.post(reverse("entry_void", args=[pay.pk]), {"reason": "x"}).status_code, 403)
        self.assertEqual(
            self.client.post(reverse("customer_writeoff", args=[self.c.pk]), {"amount": "50", "note": "x"}).status_code, 403
        )
        self.assertEqual(self.client.post(reverse("customer_opening", args=[self.c.pk]), {"amount": "5", "date": "2026-01-01"}).status_code, 403)
        pay.refresh_from_db()
        self.assertFalse(pay.voided)

    def test_error_pages_render(self):
        self.login(self.driver)
        self.assertEqual(self.client.get("/nope/").status_code, 404)

    def test_navigation_differs_by_role(self):
        self.login(self.driver)
        page = self.client.get(reverse("route")).content.decode()
        self.assertNotIn(reverse("daily"), page)
        self.login(self.manager)
        page = self.client.get(reverse("route")).content.decode()
        self.assertIn(reverse("daily"), page)


class OrderFlowTests(ViewBase):
    def test_taking_an_order_in_two_steps(self):
        self.login(self.driver)
        r = self.client.get(reverse("order_pick") + "?q=احمد")
        self.assertContains(r, reverse("order_create", args=[self.c.pk]))
        r = self.client.post(reverse("order_create", args=[self.c.pk]), {
            "source": "whatsapp", "delivery_date": timezone.localdate().isoformat(), f"qty_{self.p12.pk}": "3", "notes": "بعد المغرب",
        })
        self.assertRedirects(r, reverse("route"))
        new = Order.objects.exclude(pk=self.order.pk).get()
        self.assertEqual((new.cylinders, new.source, new.notes, new.created_by), (3, "whatsapp", "بعد المغرب", self.driver))

    def test_an_order_needs_at_least_one_cylinder(self):
        self.login(self.driver)
        r = self.client.post(reverse("order_create", args=[self.c.pk]), {
            "source": "phone", "delivery_date": timezone.localdate().isoformat(), f"qty_{self.p12.pk}": "0",
        })
        self.assertEqual(r.status_code, 200)
        self.assertContains(r, "اختر اسطوانة واحدة على الأقل")
        self.assertEqual(Order.objects.count(), 1)

    def test_delivering_on_credit_creates_debt_and_shows_it(self):
        self.login(self.driver)
        before = self.balance()
        r = self.client.post(reverse("order_deliver", args=[self.order.pk]), {
            "pay_mode": "none", "method": "cash", f"qty_{self.order.items.get().pk}": "2",
        }, follow=True)
        self.assertEqual(self.balance(), before + D("130.00"))
        self.assertContains(r, "المتبقي عليه الحين: 330.00")

    def test_partial_payment_requires_an_amount(self):
        self.login(self.driver)
        item = self.order.items.get()
        r = self.client.post(reverse("order_deliver", args=[self.order.pk]), {
            "pay_mode": "partial", "method": "cash", f"qty_{item.pk}": "2",
        })
        self.assertEqual(r.status_code, 200)
        self.assertContains(r, "اكتب المبلغ اللي دفعه العميل")
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.PENDING)

    def test_a_delivered_order_cannot_be_delivered_again(self):
        self.login(self.driver)
        item = self.order.items.get()
        data = {"pay_mode": "none", "method": "cash", f"qty_{item.pk}": "2"}
        self.client.post(reverse("order_deliver", args=[self.order.pk]), data)
        after_first = self.balance()
        r = self.client.post(reverse("order_deliver", args=[self.order.pk]), data)
        self.assertEqual(r.status_code, 302)
        self.assertEqual(self.balance(), after_first)

    def test_cancel_is_post_only(self):
        self.login(self.driver)
        self.assertEqual(self.client.get(reverse("order_cancel", args=[self.order.pk])).status_code, 405)
        self.client.post(reverse("order_cancel", args=[self.order.pk]))
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.CANCELLED)

    def test_admin_can_revert_a_wrong_delivery(self):
        self.login(self.driver)
        item = self.order.items.get()
        self.client.post(reverse("order_deliver", args=[self.order.pk]), {"pay_mode": "full", "method": "cash", f"qty_{item.pk}": "2"})
        self.assertEqual(self.balance(), D("200"))
        self.login(self.manager)
        r = self.client.post(reverse("order_revert", args=[self.order.pk]), {"reason": "العميل ما استلم"})
        self.assertEqual(r.status_code, 302)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.PENDING)
        self.assertEqual(self.balance(), D("200"))
        self.assertEqual(LedgerEntry.objects.filter(order=self.order, voided=True).count(), 2)

    def test_credit_limit_warning_shows_on_the_delivery_screen(self):
        self.c.credit_limit = D("250")
        self.c.save()
        self.login(self.driver)
        self.assertContains(self.client.get(reverse("order_deliver", args=[self.order.pk])), "تجاوز حد الدين")

    def test_route_groups_orders_by_area_and_flags_debt(self):
        east = Area.objects.create(name="الجرف")
        other = Customer.objects.create(name="سالم", phone="0559999999", area=east)
        s.create_order(other, self.driver, {self.p12.pk: 1}, source="phone", delivery_date=timezone.localdate() - timedelta(days=1))
        self.login(self.driver)
        page = self.client.get(reverse("route")).content.decode()
        self.assertIn("النعيمية", page)
        self.assertIn("الجرف", page)
        self.assertIn("عليه دين", page)  # Ahmed owes 200
        self.assertIn("طلب أمس", page)  # the other order is a day late


class MoneyFlowTests(ViewBase):
    def test_recording_a_payment_and_its_open_redirect_protection(self):
        self.login(self.driver)
        url = reverse("customer_payment", args=[self.c.pk])
        r = self.client.post(url + "?next=https://evil.example/x", {
            "amount": "75.50", "method": "transfer", "date": timezone.localdate().isoformat(), "note": "",
            "next": "https://evil.example/x",
        })
        self.assertRedirects(r, reverse("customer_detail", args=[self.c.pk]))
        self.assertEqual(self.balance(), D("124.50"))

    def test_double_tap_does_not_record_the_payment_twice(self):
        self.login(self.driver)
        data = {"amount": "40", "method": "cash", "date": timezone.localdate().isoformat(), "note": ""}
        url = reverse("customer_payment", args=[self.c.pk])
        self.client.post(url, data)
        r = self.client.post(url, data, follow=True)
        self.assertEqual(self.balance(), D("160"))
        self.assertContains(r, "انسجل قبل لحظات")

    def test_payment_cannot_be_dated_in_the_future(self):
        self.login(self.driver)
        r = self.client.post(reverse("customer_payment", args=[self.c.pk]), {
            "amount": "10", "method": "cash", "date": (timezone.localdate() + timedelta(days=2)).isoformat(),
        })
        self.assertEqual(r.status_code, 200)
        self.assertEqual(self.balance(), D("200"))

    def test_promise_and_dashboard_follow_up(self):
        self.login(self.manager)
        r = self.client.post(reverse("customer_promise", args=[self.c.pk]), {
            "promised_date": timezone.localdate().isoformat(), "amount": "100", "note": "بعد الراتب",
        })
        self.assertEqual(r.status_code, 302)
        page = self.client.get(reverse("home")).content.decode()
        self.assertIn("وعد بالسداد اليوم", page)
        self.assertIn("أحمد المنصوري", page)

    def test_admin_voids_an_entry_with_a_reason_and_it_stays_visible(self):
        pay = s.record_payment(self.c, self.owner, D("50"), method="cash")
        self.login(self.manager)
        self.assertEqual(self.client.post(reverse("entry_void", args=[pay.pk]), {"reason": ""}).status_code, 200)
        self.client.post(reverse("entry_void", args=[pay.pk]), {"reason": "سجلناه على العميل الغلط"})
        self.assertEqual(self.balance(), D("200"))
        page = self.client.get(reverse("customer_detail", args=[self.c.pk])).content.decode()
        self.assertIn("سجلناه على العميل الغلط", page)

    def test_new_customer_with_old_debt(self):
        self.login(self.manager)
        r = self.client.post(reverse("customer_create"), {
            "name": "فاطمة الكعبي", "phone": "055 777 1234", "area": self.area.pk, "address": "", "location_url": "",
            "credit_limit": "0", "notes": "", "is_active": "on", "opening_balance": "340", "opening_date": "2026-08-01",
        })
        fatima = Customer.objects.get(name="فاطمة الكعبي")
        self.assertRedirects(r, reverse("customer_detail", args=[fatima.pk]))
        self.assertEqual(fatima.current_balance(), D("340"))
        self.assertEqual(fatima.entries.get().kind, LedgerEntry.Kind.OPENING)

    def test_driver_adds_a_customer_but_cannot_create_debt_or_limits(self):
        self.login(self.driver)
        page = self.client.get(reverse("customer_create")).content.decode()
        self.assertNotIn("opening_balance", page)
        self.assertNotIn("credit_limit", page)
        self.client.post(reverse("customer_create"), {
            "name": "سعيد", "phone": "0561112222", "area": self.area.pk, "opening_balance": "999", "credit_limit": "5",
        })
        said = Customer.objects.get(name="سعيد")
        self.assertEqual((said.current_balance(), said.credit_limit), (D("0"), D("0")))

    def test_bad_phone_number_is_refused(self):
        self.login(self.driver)
        r = self.client.post(reverse("customer_create"), {"name": "x", "phone": "12", "area": self.area.pk})
        self.assertContains(r, "رقم الجوال غير صحيح")

    def test_new_customer_flow_continues_to_the_order(self):
        self.login(self.driver)
        r = self.client.post(reverse("customer_create") + "?then=order", {"name": "سعيد", "phone": "0561112222", "area": self.area.pk})
        said = Customer.objects.get(name="سعيد")
        self.assertRedirects(r, reverse("order_create", args=[said.pk]))


class DebtPageTests(ViewBase):
    def test_debts_page_total_matches_the_ledger(self):
        other = Customer.objects.create(name="سالم", phone="0559999999", area=self.area)
        s.add_opening_balance(other, self.owner, D("30.50"), date_=timezone.localdate() - timedelta(days=5))
        self.login(self.manager)
        page = self.client.get(reverse("debts")).content.decode()
        self.assertIn("230.50", page)
        self.assertIn("أحمد المنصوري", page)
        self.assertIn("wa.me/971501234567", page)  # one-tap reminder

    def test_age_filter_and_count_chips(self):
        other = Customer.objects.create(name="سالم", phone="0559999999", area=self.area)
        s.add_opening_balance(other, self.owner, D("30"), date_=timezone.localdate() - timedelta(days=5))
        self.login(self.manager)
        only_old = self.client.get(reverse("debts") + "?age=1").content.decode()  # 31-60 days: Ahmed only
        self.assertIn("أحمد المنصوري", only_old)
        self.assertNotIn("سالم", only_old)

    def test_csv_export_is_excel_safe(self):
        evil = Customer.objects.create(name="=HYPERLINK(\"http://x\")", phone="0559999999", area=self.area)
        s.add_opening_balance(evil, self.owner, D("10"))
        self.login(self.manager)
        r = self.client.get(reverse("debts_csv"))
        body = r.content.decode("utf-8")
        self.assertTrue(body.startswith("﻿"))
        self.assertIn("'=HYPERLINK", body)
        self.assertNotIn(",=HYPERLINK", body)
        self.assertEqual(r["Content-Type"].split(";")[0], "text/csv")

    def test_statement_lists_only_live_entries(self):
        pay = s.record_payment(self.c, self.owner, D("30"), method="cash")
        s.void_entry(pay, self.owner, "غلط")
        self.login(self.driver)
        page = self.client.get(reverse("customer_statement", args=[self.c.pk])).content.decode()
        self.assertIn("رصيد سابق", page)
        self.assertNotIn("سدد", page.split("<tbody>")[1])  # the voided payment is not in the rows


class AccountTests(ViewBase):
    def test_login_lockout_after_repeated_failures(self):
        for _ in range(8):
            r = self.client.post(reverse("login"), {"username": "drv", "password": "wrong"})
            self.assertEqual(r.status_code, 200)
        r = self.client.post(reverse("login"), {"username": "drv", "password": "pw12345"})
        self.assertEqual(r.status_code, 429)
        self.assertContains(r, "محاولات كثيرة", status_code=429)

    def test_login_works_and_lands_on_the_right_page(self):
        r = self.client.post(reverse("login"), {"username": "drv", "password": "pw12345"})
        self.assertRedirects(r, reverse("home"), fetch_redirect_response=False)
        self.assertRedirects(self.client.get(reverse("home")), reverse("route"))

    def test_manager_cannot_touch_the_owner_account(self):
        self.login(self.manager)
        self.assertEqual(self.client.get(reverse("user_edit", args=[self.owner.pk])).status_code, 403)

    def test_manager_cannot_create_an_owner(self):
        self.login(self.manager)
        r = self.client.post(reverse("user_create"), {
            "username": "boss", "first_name": "x", "role": "owner", "password": "pw12345",
        })
        self.assertEqual(r.status_code, 200)
        self.assertFalse(User.objects.filter(username="boss").exists())

    def test_creating_a_driver_account(self):
        self.login(self.owner)
        r = self.client.post(reverse("user_create"), {
            "username": "Salem2", "first_name": "سالم", "role": "driver", "password": "123456",
        })
        self.assertRedirects(r, reverse("users"))
        u = User.objects.get(username="salem2")
        self.assertEqual(u.profile.role, Role.DRIVER)
        self.assertTrue(self.client.login(username="salem2", password="123456"))

    def test_you_cannot_lock_yourself_out(self):
        self.login(self.manager)
        page = self.client.get(reverse("user_edit", args=[self.manager.pk])).content.decode()
        self.assertNotIn('name="role"', page)
        self.assertNotIn('name="is_active"', page)

    def test_user_without_a_profile_is_a_driver(self):
        stray = User.objects.create_user("stray", password="pw12345")
        self.login(stray)
        self.assertEqual(self.client.get(reverse("daily")).status_code, 403)


class DailyAndDashboardTests(ViewBase):
    def test_dashboard_numbers_come_from_the_ledger(self):
        o = self.order
        s.deliver_order(o, self.driver, {}, pay_mode="partial", paid_amount=D("30"))
        self.login(self.owner)
        page = self.client.get(reverse("home")).content.decode()
        self.assertIn("300.00", page)  # 200 old + 130 delivery - 30 paid
        daily = self.client.get(reverse("daily")).content.decode()
        self.assertIn("30.00", daily)
        self.assertIn("130.00", daily)

    def test_daily_page_accepts_a_date_and_ignores_garbage(self):
        self.login(self.owner)
        self.assertEqual(self.client.get(reverse("daily") + "?date=2026-01-01").status_code, 200)
        self.assertEqual(self.client.get(reverse("daily") + "?date=not-a-date").status_code, 200)

    def test_area_and_product_pages_create_records(self):
        self.login(self.owner)
        self.client.post(reverse("areas"), {"name": "الجرف", "delivery_days": "", "sort_order": 3, "is_active": "on"})
        self.client.post(reverse("products"), {"name": "اسطوانة 45 كجم", "price": "200.00", "sort_order": 1, "is_active": "on"})
        self.assertTrue(Area.objects.filter(name="الجرف").exists())
        self.assertTrue(Product.objects.filter(name="اسطوانة 45 كجم").exists())

    def test_changing_a_price_does_not_touch_old_orders(self):
        self.login(self.owner)
        self.client.post(reverse("product_edit", args=[self.p12.pk]), {"name": self.p12.name, "price": "99.00", "sort_order": 0, "is_active": "on"})
        self.assertEqual(self.order.total, D("130.00"))
