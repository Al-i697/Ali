from datetime import date, timedelta
from decimal import Decimal as D

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from core import services as s
from core.models import Area, Customer, LedgerEntry, Order, PaymentPromise, Product
from core.text import normalize_arabic, normalize_phone, whatsapp_url

User = get_user_model()
TODAY = date(2026, 11, 2)


def d(days_ago):
    return TODAY - timedelta(days=days_ago)


class TextTests(TestCase):
    def test_phone_formats_all_normalise_the_same(self):
        for raw in ["0501234567", "501234567", "+971 50 123 4567", "00971501234567", "٠٥٠١٢٣٤٥٦٧", "971501234567"]:
            self.assertEqual(normalize_phone(raw), "971501234567", raw)
        self.assertEqual(normalize_phone(""), "")
        self.assertEqual(normalize_phone("abc"), "")

    def test_whatsapp_link(self):
        url = whatsapp_url("050 123 4567", "مرحبا")
        self.assertTrue(url.startswith("https://wa.me/971501234567?text="))
        self.assertEqual(whatsapp_url("", "x"), "")

    def test_arabic_spelling_variants_match(self):
        self.assertEqual(normalize_arabic("أحمد"), normalize_arabic("احمد"))
        self.assertEqual(normalize_arabic("فاطمة"), normalize_arabic("فاطمه"))
        self.assertEqual(normalize_arabic("مُحَمَّد"), "محمد")


class AgingTests(TestCase):
    def test_payments_are_applied_to_the_oldest_debt_first(self):
        # 100 owed 70 days ago, 50 owed 10 days ago, 60 paid: the old debt is
        # reduced to 40 and the recent one is untouched.
        a = s.compute_aging([(d(70), D("100")), (d(10), D("50")), (d(5), D("-60"))], TODAY)
        self.assertEqual(a.buckets, [D("50"), D("0"), D("40"), D("0")])
        self.assertEqual(a.balance, D("90"))
        self.assertEqual(a.oldest_age, 70)
        self.assertEqual(a.overdue, D("40"))

    def test_fully_paid_debts_disappear(self):
        a = s.compute_aging([(d(100), D("100")), (d(1), D("-100"))], TODAY)
        self.assertEqual(a.total_debt, D("0"))
        self.assertIsNone(a.oldest_age)

    def test_overpayment_is_kept_as_prepaid(self):
        a = s.compute_aging([(d(3), D("30")), (d(1), D("-80"))], TODAY)
        self.assertEqual(a.prepaid, D("50"))
        self.assertEqual(a.balance, D("-50"))
        self.assertEqual(a.total_debt, D("0"))

    def test_money_paid_at_delivery_settles_that_delivery_not_the_old_debt(self):
        # Old debt of 100 from 60 days ago. Two later deliveries were each paid in
        # cash on the spot. The old debt must stay exactly as old and as large.
        entries = [
            (d(60), D("100"), 1, None),
            (d(20), D("65"), 2, 7), (d(20), D("-65"), 3, 7),
            (d(5), D("65"), 4, 8), (d(5), D("-65"), 5, 8),
        ]
        a = s.compute_aging(entries, TODAY)
        self.assertEqual(a.buckets, [D("0"), D("100"), D("0"), D("0")])
        self.assertEqual(a.oldest_age, 60)

    def test_partly_paid_delivery_leaves_only_the_unpaid_part(self):
        entries = [(d(3), D("130"), 1, 9), (d(3), D("-50"), 2, 9)]
        a = s.compute_aging(entries, TODAY)
        self.assertEqual((a.buckets[0], a.balance), (D("80"), D("80")))

    def test_later_payment_goes_to_the_oldest_debt_not_the_newest(self):
        entries = [(d(60), D("100"), 1, None), (d(5), D("65"), 2, 8), (d(1), D("-70"), 3, None)]
        a = s.compute_aging(entries, TODAY)
        self.assertEqual(a.buckets, [D("65"), D("30"), D("0"), D("0")])

    def test_bucket_edges(self):
        self.assertEqual([s.bucket_index(n) for n in (0, 30, 31, 60, 61, 90, 91)], [0, 0, 1, 1, 2, 2, 3])

    def test_future_dated_debt_counts_as_new(self):
        a = s.compute_aging([(TODAY + timedelta(days=3), D("10"))], TODAY)
        self.assertEqual(a.buckets[0], D("10"))


class Base(TestCase):
    def setUp(self):
        self.user = User.objects.create_user("sami", password="x12345", first_name="سامي")
        self.area = Area.objects.create(name="الغرب")
        self.p12 = Product.objects.create(name="اسطوانة 12 كجم", price=D("65.00"))
        self.p45 = Product.objects.create(name="اسطوانة 45 كجم", price=D("180.00"))
        self.c = Customer.objects.create(name="أحمد المنصوري", phone="0501234567", area=self.area)

    def order(self, qty12=2, **kw):
        return s.create_order(
            self.c, self.user, {self.p12.pk: qty12}, source="phone",
            delivery_date=kw.get("delivery_date", timezone.localdate()),
        )

    def balance(self):
        return self.c.current_balance()


class DeliveryTests(Base):
    def test_full_payment_leaves_no_debt(self):
        o = self.order(2)
        s.deliver_order(o, self.user, {}, pay_mode="full")
        self.assertEqual(self.balance(), D("0"))
        self.assertEqual(o.entries.count(), 2)  # one charge, one payment

    def test_credit_delivery_becomes_debt(self):
        o = self.order(2)
        s.deliver_order(o, self.user, {}, pay_mode="none")
        self.assertEqual(self.balance(), D("130.00"))
        self.assertEqual(o.entries.count(), 1)

    def test_partial_payment(self):
        o = self.order(2)
        s.deliver_order(o, self.user, {}, pay_mode="partial", paid_amount=D("50"), method="transfer")
        self.assertEqual(self.balance(), D("80.00"))
        pay = o.entries.get(kind="payment")
        self.assertEqual((pay.amount, pay.method), (D("-50.00"), "transfer"))

    def test_driver_can_change_the_delivered_quantity(self):
        o = self.order(2)
        item = o.items.get()
        s.deliver_order(o, self.user, {item.pk: 3}, pay_mode="none")
        self.assertEqual(self.balance(), D("195.00"))

    def test_a_line_set_to_zero_is_removed_and_all_zero_is_refused(self):
        o = s.create_order(self.c, self.user, {self.p12.pk: 1, self.p45.pk: 1}, source="phone",
                           delivery_date=timezone.localdate())
        i12 = o.items.get(product=self.p12)
        s.deliver_order(o, self.user, {i12.pk: 0}, pay_mode="none")
        self.assertEqual(self.balance(), D("180.00"))
        o2 = self.order(1)
        with self.assertRaises(s.ServiceError):
            s.deliver_order(o2, self.user, {o2.items.get().pk: 0}, pay_mode="none")
        o2.refresh_from_db()
        self.assertEqual(o2.status, Order.Status.PENDING)

    def test_cannot_deliver_twice(self):
        o = self.order(1)
        s.deliver_order(o, self.user, {}, pay_mode="none")
        with self.assertRaises(s.ServiceError):
            s.deliver_order(o, self.user, {}, pay_mode="none")
        self.assertEqual(self.balance(), D("65.00"))

    def test_partial_amount_must_fit_the_total(self):
        o = self.order(1)
        for bad in (D("66"), D("-1")):
            with self.assertRaises(s.ServiceError):
                s.deliver_order(o, self.user, {}, pay_mode="partial", paid_amount=bad)
        self.assertEqual(self.balance(), D("0"))

    def test_price_is_frozen_when_the_order_is_taken(self):
        o = self.order(1)
        self.p12.price = D("99.00")
        self.p12.save()
        s.deliver_order(o, self.user, {}, pay_mode="none")
        self.assertEqual(self.balance(), D("65.00"))

    def test_revert_voids_the_money_and_reopens_the_order(self):
        o = self.order(2)
        s.deliver_order(o, self.user, {}, pay_mode="partial", paid_amount=D("30"))
        s.revert_delivery(o, self.user, "اخطأ السائق")
        o.refresh_from_db()
        self.assertEqual(o.status, Order.Status.PENDING)
        self.assertEqual(self.balance(), D("0"))
        self.assertEqual(o.entries.filter(voided=True).count(), 2)  # kept, not deleted
        s.deliver_order(o, self.user, {}, pay_mode="none")
        self.assertEqual(self.balance(), D("130.00"))

    def test_revert_needs_a_reason(self):
        o = self.order(1)
        s.deliver_order(o, self.user, {}, pay_mode="none")
        with self.assertRaises(s.ServiceError):
            s.revert_delivery(o, self.user, "  ")


class MoneyTests(Base):
    def test_payment_reduces_balance_and_zero_amount_is_refused(self):
        s.add_opening_balance(self.c, self.user, D("200"), date_=d(40))
        s.record_payment(self.c, self.user, D("75.50"), method="cash")
        self.assertEqual(self.balance(), D("124.50"))
        for bad in (0, -5):
            with self.assertRaises(s.ServiceError):
                s.record_payment(self.c, self.user, D(bad), method="cash")

    def test_void_removes_the_entry_from_the_balance_but_keeps_it(self):
        s.add_opening_balance(self.c, self.user, D("100"))
        pay = s.record_payment(self.c, self.user, D("100"), method="cash")
        self.assertEqual(self.balance(), D("0"))
        s.void_entry(pay, self.user, "دخل بالغلط")
        self.assertEqual(self.balance(), D("100"))
        pay.refresh_from_db()
        self.assertTrue(pay.voided)
        self.assertEqual((pay.voided_by, pay.void_reason), (self.user, "دخل بالغلط"))
        with self.assertRaises(s.ServiceError):  # not twice
            s.void_entry(pay, self.user, "مرة ثانية")

    def test_a_delivery_charge_cannot_be_voided_on_its_own(self):
        o = self.order(1)
        s.deliver_order(o, self.user, {}, pay_mode="none")
        charge = o.entries.get(kind="charge")
        with self.assertRaises(s.ServiceError):
            s.void_entry(charge, self.user, "x")
        self.assertEqual(self.balance(), D("65.00"))

    def test_void_needs_a_reason(self):
        s.add_opening_balance(self.c, self.user, D("10"))
        e = self.c.entries.get()
        with self.assertRaises(s.ServiceError):
            s.void_entry(e, self.user, "")

    def test_writeoff_needs_a_reason_and_reduces_debt(self):
        s.add_opening_balance(self.c, self.user, D("100"))
        with self.assertRaises(s.ServiceError):
            s.record_writeoff(self.c, self.user, D("10"), note="")
        s.record_writeoff(self.c, self.user, D("10"), note="خصم من المدير")
        self.assertEqual(self.balance(), D("90"))

    def test_settling_the_balance_closes_open_promises(self):
        s.add_opening_balance(self.c, self.user, D("100"))
        s.add_promise(self.c, self.user, timezone.localdate() + timedelta(days=3), D("100"))
        s.record_payment(self.c, self.user, D("40"), method="cash")
        self.assertEqual(PaymentPromise.objects.filter(done=False).count(), 1)  # still owes
        s.record_payment(self.c, self.user, D("60"), method="cash")
        self.assertEqual(PaymentPromise.objects.filter(done=False).count(), 0)

    def test_promise_cannot_be_in_the_past(self):
        with self.assertRaises(s.ServiceError):
            s.add_promise(self.c, self.user, timezone.localdate() - timedelta(days=1))

    def test_credit_limit_warning(self):
        self.c.credit_limit = D("100")
        self.c.save()
        self.assertEqual(s.credit_warning(self.c, D("90")), "")
        self.assertIn("تجاوز", s.credit_warning(self.c, D("120")))
        self.c.credit_limit = D("0")  # 0 = no limit
        self.assertEqual(s.credit_warning(self.c, D("99999")), "")


class DebtReportTests(Base):
    def test_debt_rows_age_and_last_payment(self):
        other = Customer.objects.create(name="سالم", phone="0559999999", area=self.area)
        today = timezone.localdate()
        s.add_opening_balance(self.c, self.user, D("300"), date_=today - timedelta(days=80))
        s.record_payment(self.c, self.user, D("100"), method="cash", date_=today - timedelta(days=5))
        s.add_opening_balance(other, self.user, D("20"), date_=today - timedelta(days=2))
        rows = {r.customer.name: r for r in s.debt_rows(today)}
        r = rows["أحمد المنصوري"]
        self.assertEqual((r.balance, r.oldest_age, r.last_payment), (D("200"), 80, today - timedelta(days=5)))
        self.assertEqual(rows["سالم"].oldest_age, 2)
        self.assertIsNone(rows["سالم"].last_payment)

    def test_overview_totals_add_up(self):
        today = timezone.localdate()
        other = Customer.objects.create(name="سالم", phone="0559999999", area=Area.objects.create(name="الشرق"))
        s.add_opening_balance(self.c, self.user, D("300"), date_=today - timedelta(days=80))
        s.add_opening_balance(other, self.user, D("20"), date_=today - timedelta(days=2))
        ov = s.debt_overview(today)
        self.assertEqual(ov.total, D("320"))
        self.assertEqual(ov.overdue, D("300"))
        self.assertEqual(sum(ov.buckets), ov.total)
        self.assertEqual(sum(v for _, v, _ in ov.by_area), ov.total)
        self.assertEqual(ov.debtors, 2)

    def test_customers_without_debt_are_not_listed(self):
        o = self.order(1)
        s.deliver_order(o, self.user, {}, pay_mode="full")
        self.assertEqual(s.debt_rows(), [])

    def test_ledger_running_balance(self):
        s.add_opening_balance(self.c, self.user, D("100"), date_=d(10))
        p = s.record_payment(self.c, self.user, D("30"), method="cash", date_=d(5))
        s.record_payment(self.c, self.user, D("20"), method="cash", date_=d(2))
        s.void_entry(p, self.user, "غلط")
        rows = s.ledger_with_running_balance(self.c)
        self.assertEqual([r.running for r in rows], [D("80"), None, D("100")])


class RefillTests(Base):
    def deliver_on(self, day):
        o = self.order(1)
        s.deliver_order(o, self.user, {}, pay_mode="full")
        Order.objects.filter(pk=o.pk).update(delivered_on=day)

    def test_customer_is_predicted_from_his_usual_interval(self):
        for days in (87, 57, 27):  # a delivery every 30 days, the last one 27 days ago
            self.deliver_on(TODAY - timedelta(days=days))
        refills = s.predicted_refills(TODAY)
        self.assertEqual(len(refills), 1)
        r = refills[0]
        self.assertEqual((r.every_days, r.last_delivery), (30, TODAY - timedelta(days=27)))
        self.assertEqual(r.days_until, 3)  # next one expected in 3 days
        self.assertEqual(s.predicted_refills(TODAY - timedelta(days=1)), [])  # 4 days away: too early

    def test_not_predicted_with_one_delivery_or_when_not_due(self):
        self.deliver_on(TODAY - timedelta(days=5))
        self.assertEqual(s.predicted_refills(TODAY), [])  # only one delivery: no pattern yet
        self.deliver_on(TODAY - timedelta(days=35))
        self.assertEqual(s.predicted_refills(TODAY), [])  # every 30 days, next one in 25 days

    def test_customer_with_open_order_is_skipped(self):
        for days in (90, 60, 30):
            self.deliver_on(TODAY - timedelta(days=days))
        self.assertEqual(len(s.predicted_refills(TODAY)), 1)
        self.order(1)
        self.assertEqual(s.predicted_refills(TODAY), [])

    def test_customer_who_stopped_ordering_is_left_out(self):
        for days in (400, 370, 340):
            self.deliver_on(TODAY - timedelta(days=days))
        self.assertEqual(s.predicted_refills(TODAY), [])


class DailySummaryTests(Base):
    def test_numbers_add_up(self):
        today = timezone.localdate()
        o1 = self.order(2)  # 130
        s.deliver_order(o1, self.user, {}, pay_mode="full")
        o2 = self.order(1)  # 65, pays 20 by transfer
        s.deliver_order(o2, self.user, {}, pay_mode="partial", paid_amount=D("20"), method="transfer")
        s.add_opening_balance(self.c, self.user, D("500"), date_=d(60))
        s.record_payment(self.c, self.user, D("100"), method="cash")  # old debt
        r = s.daily_summary(today)
        self.assertEqual(r["deliveries"], 2)
        self.assertEqual(r["cylinders_total"], 3)
        self.assertEqual(r["sales"], D("195"))
        self.assertEqual(r["collected_at_delivery"], D("150"))
        self.assertEqual(r["collected_old_debts"], D("100"))
        self.assertEqual(r["collected"], D("250"))
        self.assertEqual(r["new_debt"], D("45"))
        self.assertEqual(sum(v for _, v in r["by_method"]), r["collected"])
        (name, cash, other), = r["by_user"]
        self.assertEqual((name, cash, other), ("سامي", D("230"), D("20")))


class SearchTests(Base):
    def test_search_ignores_spelling_variants_and_phone_format(self):
        Customer.objects.create(name="فاطمة الكعبي", phone="055 777 1234", area=self.area)
        self.assertEqual([c.name for c in Customer.objects.search("احمد")], ["أحمد المنصوري"])
        self.assertEqual([c.name for c in Customer.objects.search("فاطمه")], ["فاطمة الكعبي"])
        self.assertEqual([c.name for c in Customer.objects.search("0557771234")], ["فاطمة الكعبي"])
        self.assertEqual([c.name for c in Customer.objects.search("777")], ["فاطمة الكعبي"])
        self.assertEqual(Customer.objects.search("").count(), 2)
