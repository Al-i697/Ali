"""Builds sheets/gas-ledger-DEMO.xlsx: the template filled with FAKE data so you can see how it looks.

    DJANGO_DEBUG=1 python sheets/build_demo.py

The workbook is recalculated by LibreOffice so the numbers are already stored in the file (it also
opens correctly in viewers that do not calculate formulas). The dates are relative to the day it is
built, so after a few weeks every debt in it will look old: it is only for looking at.
"""
from __future__ import annotations

import sys
import tempfile
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import verify_template as vt  # noqa: E402  (sets up Django, defines the scenario)
import build_template as bt  # noqa: E402
from openpyxl import load_workbook  # noqa: E402


def main() -> None:
    customers, prev, responses, entries, orders = vt.scenario(11)
    keep = {c[0] for c in customers if not c[0].startswith("حد ")}
    customers = [c for c in customers if c[0] in keep]
    known = {p[0] for p in vt.PRODUCTS}
    # drops the boundary customers and the deliberately wrong rows (unknown customer / unknown product)
    responses = [r for r in responses if r[2] in keep and (r[4] is None or r[4] in known)]
    sample = {"customers": customers, "prev": prev, "responses": responses, "drivers": vt.DRIVERS, "products": vt.PRODUCTS}
    work = Path(tempfile.mkdtemp(prefix="demo_"))
    src = work / "gas-ledger-DEMO.xlsx"
    bt.build(src, sample)
    wb = load_workbook(src)
    o = wb[bt.ORDERS]
    for i, (d, name, what) in enumerate(orders, 2):
        o[f"A{i}"], o[f"B{i}"], o[f"C{i}"] = d, name, what
    wb[bt.START]["B1"] = f"نسخة تجريبية ببيانات وهمية (بتاريخ {date.today():%Y-%m-%d}). للمعاينة فقط. للشغل الحقيقي استخدم gas-ledger-template.xlsx"
    wb.save(src)
    out = vt.recalc(src, work / "calc")
    target = HERE / "gas-ledger-DEMO.xlsx"
    target.write_bytes(out.read_bytes())
    print("built", target)


if __name__ == "__main__":
    main()
