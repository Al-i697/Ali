"""Recalculate the sheet in LibreOffice and compare every number with the app's own accounting.

    DJANGO_DEBUG=1 python sheets/verify_template.py [workdir]

Builds a workbook with randomised history (including debts exactly 30/31/60/61/90/91 days old,
a price change, over-payments), lets LibreOffice calculate the formulas, then checks per customer:
balance and aging buckets against core.services.compute_aging, the daily summary per driver,
the top-debtors ranking, the orders tab and the sanity checks on the start tab.
"""
from __future__ import annotations

import os
import random
import subprocess
import sys
import tempfile
from datetime import date, datetime, time, timedelta
from decimal import Decimal as D
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
sys.path.insert(0, str(HERE))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "gasdist.settings")
os.environ.setdefault("DJANGO_DEBUG", "1")

import django  # noqa: E402

django.setup()

from openpyxl import load_workbook  # noqa: E402

import build_template as bt  # noqa: E402
from core.services import compute_aging  # noqa: E402

TODAY = date.today()
DRIVERS = ["سالم", "بديل"]
BASE = date(2025, 1, 1)
PRODUCTS = [
    ("اسطوانة صغيرة", BASE, 65),
    ("اسطوانة كبيرة", BASE, 200),
    ("اسطوانة صغيرة", TODAY - timedelta(days=40), 70),  # price change 40 days ago
]
METHODS = ["نقد", "تحويل", "شيك", "بطاقة"]


def price(product: str, day: date) -> D:
    rows = [(since, p) for n, since, p in PRODUCTS if n == product and since <= day]
    return D(max(rows)[1])


def at(day: date, hour=None, minute=None) -> datetime:
    return datetime.combine(day, time(hour if hour is not None else random.randint(7, 20), minute if minute is not None else random.randint(0, 59)))


def scenario(seed: int):
    rng = random.Random(seed)
    random.seed(seed)
    customers, prev, responses, entries = [], [], [], {}
    areas = ["النعيمية", "الراشدية", "المويهات"]

    def add_customer(name):
        customers.append((name, f"05{rng.randint(10000000, 99999999)}", rng.choice(areas)))
        entries[name] = []

    oid = [0]

    def delivery(name, when: datetime, product, qty, received, driver=None, method=None):
        oid[0] += 1
        value = price(product, when.date()) * qty
        entries[name].append((when.date(), value, oid[0] * 10, oid[0]))
        if received > 0:
            entries[name].append((when.date(), -D(received), oid[0] * 10 + 1, oid[0]))
        responses.append([when, driver or rng.choice(DRIVERS), name, "توصيل", product, qty, received,
                          method or (rng.choice(METHODS) if received else "لم يدفع"), None])
        return value

    def payment(name, when: datetime, amount, driver=None, method=None):
        oid[0] += 1
        entries[name].append((when.date(), -D(amount), oid[0] * 10, None))
        responses.append([when, driver or rng.choice(DRIVERS), name, "سداد", None, None, amount, method or rng.choice(METHODS), None])

    # exact boundary cases: age 30 (not late) / 31 (late) etc., at the very start and end of the day
    for k in (30, 31, 60, 61, 90, 91, 0, 1):
        for h, m in ((0, 0), (23, 59)):
            name = f"حد {k} يوم {h:02d}:{m:02d}"
            add_customer(name)
            delivery(name, at(TODAY - timedelta(days=k), h, m), "اسطوانة كبيرة", 1, 0)

    for i in range(1, 41):
        name = f"عميل {i}"
        add_customer(name)
        day = TODAY - timedelta(days=rng.randint(100, 170))
        while day <= TODAY:
            if rng.random() < 0.5:
                product = rng.choice(["اسطوانة صغيرة", "اسطوانة كبيرة"])
                qty = rng.choice([1, 1, 2, 3])
                value = price(product, day) * qty
                received = rng.choice([0, 0, value, value, value / 2, value + rng.choice([10, 35, 100])])
                delivery(name, at(day), product, qty, float(received))
            if rng.random() < 0.12:
                payment(name, at(day), float(rng.choice([50, 65, 100, 130, 260, 400])))
            day += timedelta(days=rng.randint(3, 18))
        if rng.random() < 0.4:
            d = TODAY - timedelta(days=rng.randint(10, 220))
            amount = rng.choice([180, 340, 620])
            prev.append((d, name, amount, "رصيد سابق"))
            entries[name].append((d, D(amount), 9000 + i, None))
        if rng.random() < 0.15:
            d = TODAY - timedelta(days=rng.randint(1, 30))
            prev.append((d, name, -50, "خصم"))
            entries[name].append((d, D(-50), 9500 + i, None))

    # today's activity for the daily summary
    add_customer("عميل اليوم 1")
    add_customer("عميل اليوم 2")
    delivery("عميل اليوم 1", at(TODAY, 9, 5), "اسطوانة صغيرة", 2, 140, driver="سالم", method="نقد")
    delivery("عميل اليوم 2", at(TODAY, 10, 5), "اسطوانة كبيرة", 1, 0, driver="سالم")
    delivery("عميل اليوم 2", at(TODAY, 11, 5), "اسطوانة صغيرة", 1, 70, driver="بديل", method="تحويل")
    payment("عميل 1", at(TODAY, 12, 0), 100, driver="بديل", method="نقد")
    payment("عميل 2", at(TODAY, 13, 0), 80, driver="سالم", method="شيك")

    # rows the checks tab should flag (they must not affect any customer)
    responses.append([at(TODAY, 14, 0), "سالم", "اسم غير موجود", "سداد", None, None, 10, "نقد", None])
    responses.append([at(TODAY, 15, 0), "سالم", "عميل 3", "توصيل", "منتج غير معروف", 1, 0, "لم يدفع", None])

    orders = [(TODAY, "عميل اليوم 1", "اسطوانة صغيرة × 1"), (TODAY + timedelta(days=1), "عميل 1", "كبيرة"), (TODAY - timedelta(days=2), "عميل 5", "صغيرة")]
    return customers, prev, responses, entries, orders


def recalc(src: Path, outdir: Path) -> Path:
    outdir.mkdir(parents=True, exist_ok=True)
    profile = tempfile.mkdtemp(prefix="lo_profile_")
    cmd = ["soffice", f"-env:UserInstallation=file://{profile}", "--headless", "--convert-to", "xlsx:Calc MS Excel 2007 XML", "--outdir", str(outdir), str(src)]
    subprocess.run(cmd, check=True, timeout=900, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return outdir / src.name


def num(v):
    return D(str(round(float(v or 0), 2)))


def main() -> int:
    seed = int(os.environ.get("SEED", "11"))
    work = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(tempfile.mkdtemp(prefix="sheetcheck_"))
    work.mkdir(parents=True, exist_ok=True)
    customers, prev, responses, entries, orders = scenario(seed)
    sample = {"customers": customers, "prev": prev, "responses": responses, "drivers": DRIVERS, "products": PRODUCTS}
    src = work / "verify_input.xlsx"
    bt.build(src, sample)
    wb = load_workbook(src)
    ws_orders = wb[bt.ORDERS]
    for i, (d, name, what) in enumerate(orders, 2):
        ws_orders[f"A{i}"], ws_orders[f"B{i}"], ws_orders[f"C{i}"] = d, name, what
    wb.save(src)
    print(f"customers={len(customers)} responses={len(responses)} -> recalculating in LibreOffice ...", flush=True)
    out = recalc(src, work / "calc")
    wb = load_workbook(out, data_only=True)

    errors: list[str] = []

    def check(cond, msg):
        if not cond:
            errors.append(msg)

    # ---- per customer vs the app's own aging
    ws = wb[bt.CUST]
    seen = 0
    late_rows = []
    for r in range(2, bt.CUST_LAST + 1):
        name = ws[f"A{r}"].value
        if not name:
            continue
        seen += 1
        ref = compute_aging(entries[name], TODAY)
        got = [num(ws[f"{c}{r}"].value) for c in "DEFGH"]
        want = [ref.balance, ref.buckets[0], ref.buckets[1], ref.buckets[2], ref.buckets[3]]
        want = [D(str(w)).quantize(D("0.01")) for w in want]
        check(got == want, f"{name}: sheet {got} != app {want}")
        late = ref.overdue
        check(num(ws[f"I{r}"].value) == D(str(late)).quantize(D("0.01")), f"{name}: late {ws[f'I{r}'].value} != {late}")
        if late > 0:
            late_rows.append((late, r, name))
    check(seen == len(customers), f"customers read {seen} != {len(customers)}")

    # ---- boundary customers explicitly (age 30 never late, 31 always late)
    names = {ws[f"A{r}"].value: r for r in range(2, bt.CUST_LAST + 1)}
    for k in (0, 1, 30, 31, 60, 61, 90, 91):
        for hm in ("00:00", "23:59"):
            r = names[f"حد {k} يوم {hm}"]
            late = num(ws[f"I{r}"].value)
            want_late = D("200") if k > 30 else D("0")
            check(late == want_late, f"boundary {k}d {hm}: late {late} want {want_late}")
            bucket = {0: "E", 1: "E", 30: "E", 31: "F", 60: "F", 61: "G", 90: "G", 91: "H"}[k]
            check(num(ws[f"{bucket}{r}"].value) == D("200"), f"boundary {k}d {hm}: bucket {bucket} = {ws[f'{bucket}{r}'].value}")

    # ---- top debtors order
    top = wb[bt.TOP]
    late_rows.sort(key=lambda x: (x[0], x[1]), reverse=True)
    for i, (late, r, name) in enumerate(late_rows[: bt.RANK_ROWS], 2):
        check(top[f"B{i}"].value == name, f"top #{i - 1}: {top[f'B{i}'].value} != {name}")
        check(num(top[f"E{i}"].value) == D(str(late)).quantize(D("0.01")), f"top #{i - 1} amount {top[f'E{i}'].value} != {late}")
    if len(late_rows) < bt.RANK_ROWS:
        check(top[f"B{len(late_rows) + 2}"].value in (None, ""), "top list should end where late customers end")

    # ---- daily summary
    daily = wb[bt.DAILY]
    by = {}
    for row in responses:
        ts, driver, cust, typ, prod, qty, rec, method, _ = row
        if ts.date() != TODAY:
            continue  # note: rows with a wrong customer name still count for the driver (the cash is real)
        b = by.setdefault(driver, dict(n=0, cyl=0, sales=D(0), cash=D(0), other=D(0), credit=D(0)))
        if typ == "توصيل":
            value = price(prod, TODAY) * qty if prod in {p[0] for p in PRODUCTS} else D(0)
            b["n"] += 1
            b["cyl"] += qty
            b["sales"] += value
            b["credit"] += max(D(0), value - D(rec))
        if method == "نقد":
            b["cash"] += D(rec)
        else:
            b["other"] += D(rec)
    for r in range(5, 5 + len(DRIVERS)):
        drv = daily[f"A{r}"].value
        want = by.get(drv)
        got = [num(daily[f"{c}{r}"].value) for c in "BCDEFG"]
        w = [D(want["n"]), D(want["cyl"]), want["sales"], want["cash"], want["other"], want["credit"]]
        check(got == [x.quantize(D("0.01")) for x in w], f"daily {drv}: {got} != {w}")
    check(daily["A15"].value == "سائق غير مسجل في الإعدادات", "daily: unlisted-driver row missing")
    for c in "BCDEFG":
        check(num(daily[f"{c}15"].value) == 0, f"daily: unlisted-driver row {c} should be zero, is {daily[f'{c}15'].value}")

    # ---- start tab sanity checks
    start = wb[bt.START]
    texts = [start[f"B{r}"].value or "" for r in range(3, 9)]
    check(texts[0].endswith("✓ مربوط"), f"link status: {texts[0]}")
    check(texts[2].endswith(": 1"), f"unknown-customer count: {texts[2]}")
    check(texts[3].endswith(": 1"), f"missing-price count: {texts[3]}")
    check(texts[4].endswith(": 0"), f"unknown-type count: {texts[4]}")

    # ---- orders tab
    o = wb[bt.ORDERS]
    check(o["I2"].value == "✓ تم", f"order 1 should be delivered: {o['I2'].value!r}")
    check(not o["I3"].value, f"order 2 (tomorrow) should not be delivered: {o['I3'].value!r}")
    check(o["E2"].value and o["E2"].value != "عميل غير موجود", f"order area lookup: {o['E2'].value!r}")

    if errors:
        print(f"FAILED: {len(errors)} problem(s)")
        for e in errors[:40]:
            print(" -", e)
        return 1
    print(f"OK: {seen} customers match core.services.compute_aging; daily summary, ranking, orders and checks correct.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
