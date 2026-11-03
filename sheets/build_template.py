"""Builds the Google-Sheets ledger template (an .xlsx you upload to Google Drive).

    python sheets/build_template.py                 # clean template + demo copy
    from build_template import build                # used by verify_template.py

The sheet is driven by a Google Form (drivers) whose responses land in a tab of
this same spreadsheet. Everything else is formulas, so the formulas are the
product: sheets/verify_template.py recalculates them in LibreOffice and checks
the numbers against core.services.compute_aging.
"""
from __future__ import annotations

import sys
from datetime import date, datetime
from pathlib import Path

from openpyxl import Workbook
from openpyxl.formatting.rule import CellIsRule, FormulaRule
from openpyxl.styles import Alignment, Font, PatternFill, Side, Border
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

# ------------------------------------------------------------------ layout constants
MIRROR_LAST = 3001   # الحركات rows 2..3001  (= 3000 form responses)
CUST_LAST = 301      # العملاء rows 2..301   (= 300 customers)
PREV_LAST = 501      # رصيد سابق وتصحيحات rows 2..501
ORD_LAST = 301       # الطلبات rows 2..301
RANK_ROWS = 50       # أكبر المتأخرين

START, SETTINGS, CUST, TOP, DAILY, ORDERS, PREV, LOG = (
    "ابدأ من هنا", "الإعدادات", "العملاء", "أكبر المتأخرين", "ملخص اليوم", "الطلبات", "رصيد سابق وتصحيحات", "الحركات",
)


def q(name: str) -> str:
    return f"'{name}'!"


S, C, T, D, O, P, L = q(SETTINGS), q(CUST), q(TOP), q(DAILY), q(ORDERS), q(PREV), q(LOG)

# الإعدادات cells
RESP_NAME = f"{S}$B$3"
LATE_DAYS = f"{S}$B$5"
DRIVER_FIRST, DRIVER_LAST = 9, 18          # A9:A18
PRICE_FIRST, PRICE_LAST = 9, 28            # D9:F28 (product, from-date, price)
METHOD_FIRST, METHOD_LAST = 9, 13          # H9:H13

HEAD_FILL = PatternFill("solid", fgColor="1F2937")
INPUT_FILL = PatternFill("solid", fgColor="FFF7D6")
CALC_FILL = PatternFill("solid", fgColor="F3F4F6")
WARN_FILL = PatternFill("solid", fgColor="FDE2E1")
OK_FILL = PatternFill("solid", fgColor="DCFCE7")
THIN = Side(style="thin", color="D1D5DB")
BOX = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
MONEY = '#,##0.00;[Red]-#,##0.00;"-"'
DATE_FMT = "yyyy-mm-dd"
DATETIME_FMT = '[=0]"";yyyy-mm-dd hh:mm'

# ------------------------------------------------------------------ guide text
GUIDE = [
    ("h", "أول شي: وش هذا الملف؟"),
    ("p", "السائق يفتح **نموذج** على جواله ويسجل كل توصيل وكل سداد. كل تسجيل ينضاف سطر في هذا الشيت، والشيت يحسب لكل عميل الرصيد والمتأخر أكثر من 30 يوم. "
          "**السائقين يشوفون النموذج فقط، ما يفتحون الشيت** (عشان ما أحد يعدّل الأرقام). الشيت للمدير ومدير الشركة."),
    ("h", "الجزء 1: تجهيز الملف (مرة وحدة)"),
    ("n", "ارفع الملف على Google Drive (جديد ← رفع ملف)، افتحه بـ Google Sheets، ثم من القائمة: **ملف ← حفظ كـ Google Sheets**. اشتغل على النسخة الجديدة."),
    ("n", "اضبط المنطقة الزمنية: **ملف ← الإعدادات ← المنطقة الزمنية ← (GMT+04:00) دبي**. بدونها حساب التأخير والتواريخ يكون غلط."),
    ("n", "تبويب **العملاء**: اكتب الاسم، والهاتف (يبدأ بـ 05)، والمنطقة. **لا تغيّر اسم عميل بعدين**، لأن الحركات القديمة مربوطة بالاسم."),
    ("n", "تبويب **الإعدادات**: اكتب أسماء السائقين، والمنتجات وأسعارها (الخلايا الصفراء)."),
    ("n", "تبويب **رصيد سابق وتصحيحات**: اكتب الديون اللي كانت قبل النظام: التاريخ التقريبي، اسم العميل، المبلغ. التاريخ هو اللي يحدد كم صار عمر الدين."),
    ("h", "الجزء 2: نموذج السائقين (Google Forms)"),
    ("n", "افتح forms.google.com ← نموذج فارغ. سمّه مثلاً «تسجيل توصيل وسداد»."),
    ("n", "**القسم 1**، الأسئلة بهذا الترتيب بالضبط (الترتيب مهم لأن الشيت يقرأ الأعمدة بالترتيب):"),
    ("s", "1) «اسم السائق»: قائمة منسدلة، إلزامي. الخيارات = أسماء السائقين من تبويب الإعدادات."),
    ("s", "2) «العميل»: قائمة منسدلة، إلزامي. انسخ عمود الأسماء من تبويب العملاء والصقه في أول خيار (عادةً يتقسم لخيارات تلقائي)."),
    ("s", "3) «نوع الحركة»: اختيار من متعدد، إلزامي. خياران بالضبط: **توصيل** و**سداد** (نفس الكتابة)."),
    ("n", "على سؤال «نوع الحركة» اضغط النقاط الثلاث ← **الانتقال إلى قسم بناءً على الإجابة**: توصيل ← القسم 2، سداد ← القسم 3."),
    ("n", "**القسم 2** (عنوانه «بيانات التوصيل»): «المنتج» قائمة منسدلة إلزامي (الخيارات = أسماء المنتجات من الإعدادات بنفس الكتابة)، و«العدد» رقم إلزامي أكبر من صفر. "
          "إذا التوصيلة فيها نوعين، يسجل السائق مرتين."),
    ("n", "**القسم 3** (عنوانه «المبلغ»): «المبلغ المستلم» رقم إلزامي (يكتب 0 إذا ما دفع)، «طريقة الدفع» قائمة منسدلة إلزامي: نقد، تحويل، شيك، بطاقة، لم يدفع. و«ملاحظات» نص قصير اختياري."),
    ("n", "في إعدادات النموذج: **لا** تفعّل «السماح بتعديل الإجابة بعد الإرسال»، ولا «تحديد إجابة واحدة»، ولا «جمع عناوين البريد» (ينضاف عمود ويخرب ترتيب الأعمدة). اترك «إظهار رابط لإرسال إجابة أخرى» مفعّل."),
    ("n", "تبويب **الردود** في النموذج ← أيقونة الشيت ← **تحديد جدول بيانات موجود** ← اختر هذا الملف. بيطلع تبويب جديد باسم مثل «ردود النموذج 1» أو «Form Responses 1»."),
    ("n", "انسخ اسم هذا التبويب **بالضبط** والصقه في تبويب الإعدادات، الخلية B3. إذا ظهر عندك **✓ مربوط** في الخلية B4 فالربط شغال."),
    ("n", "جرّب: سجّل توصيلة تجريبية من النموذج، وتأكد إنها طلعت في تبويب «الحركات» وإن رصيد العميل تغيّر. بعدها امسح **محتويات** السطر التجريبي في تبويب الردود (حدد السطر واضغط Delete، **بدون حذف السطر نفسه**)."),
    ("n", "أرسل **رابط النموذج فقط** للسائقين على واتساب. على الجوال: افتح الرابط ← إضافة إلى الشاشة الرئيسية. **لا ترسل رابط الشيت** لأحد غير المدير ومدير الشركة."),
    ("h", "كل يوم"),
    ("p", "افتح **ملخص اليوم** (كل سائق كم وصّل وكم نقد بيده)، و**أكبر المتأخرين** (فيه زر تذكير واتساب)، و**العملاء** (فلتر على المنطقة أو على المتأخر). "
          "في تبويب **الطلبات** اكتب الطلبات اللي تجي بالاتصال أو الواتساب، وفلتر بالتاريخ والمنطقة عشان تعطي السائق قائمة اليوم."),
    ("h", "انتبه"),
    ("b", "لا تحذف ولا ترتّب ولا تعدّل في تبويب الردود. الشيت يقرأ كل سطر بمكانه."),
    ("b", "تغيّر السعر: لا تعدّل السعر القديم. **أضف سطر جديد** للمنتج بتاريخ بداية السعر الجديد، وإلا تتغير فواتير القديمة."),
    ("b", "سجّلت غلط؟ لا تمسح. أضف **تصحيح** في تبويب «رصيد سابق وتصحيحات»: مبلغ سالب يقلل الدين، وموجب يزيده، ومعه السبب."),
    ("b", "عميل جديد: أضفه في تبويب العملاء **وأيضاً** في قائمة العملاء في النموذج. وإلا السائق ما يلقاه."),
    ("b", "الملف يتسع لـ 3000 تسجيل. إذا قربت يظهر لك تنبيه في أول تبويب. وقتها كلم اللي سوّا لك الملف."),
    ("b", "السائق في النموذج يختار اسمه بنفسه، والنموذج ما يتأكد إنه هو. وأي أحد معه الرابط يقدر يسجل، فلا تنشر الرابط."),
    ("b", "الفرق عن البرنامج الكامل: ما في منع حذف، وما في تتبع من ألغى شي، والسائق ما يشوف رصيد العميل."),
]


# ------------------------------------------------------------------ helpers
def style_header(ws, row: int, columns: int, height: int = 30) -> None:
    for col in range(1, columns + 1):
        cell = ws.cell(row=row, column=col)
        cell.fill = HEAD_FILL
        cell.font = Font(bold=True, color="FFFFFF")
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = BOX
    ws.row_dimensions[row].height = height


def widths(ws, mapping: dict[str, float]) -> None:
    for letter, w in mapping.items():
        ws.column_dimensions[letter].width = w


def rtl(ws, tab_color: str | None = None) -> None:
    ws.sheet_view.rightToLeft = True
    if tab_color:
        ws.sheet_properties.tabColor = tab_color


def fill_range(ws, cols: str, first: int, last: int, fill) -> None:
    for row in range(first, last + 1):
        for letter in cols:
            ws[f"{letter}{row}"].fill = fill


def indirect(letter: str) -> str:
    return f"INDIRECT(\"'\"&{RESP_NAME}&\"'!{letter}\"&ROW())"


# ------------------------------------------------------------------ sheets
def build_start(ws) -> None:
    rtl(ws, "16A34A")
    ws.sheet_view.showGridLines = False
    widths(ws, {"A": 4, "B": 120})
    ws["B1"] = "نظام الديون والتوصيل (شيت + نموذج)"
    ws["B1"].font = Font(bold=True, size=16)
    ws["B2"] = "حالة الملف الآن"
    ws["B2"].font = Font(bold=True, size=12)

    checks = [
        ("ربط النموذج", f"={S}B4"),
        ("عدد التسجيلات", f'=COUNTIF({L}$A$2:$A${MIRROR_LAST},">0")&" من "&{MIRROR_LAST - 1}'),
        ("تسجيلات اسم عميلها مو موجود في تبويب العملاء", f'=COUNTIF({L}$M$2:$M${MIRROR_LAST},"اسم غير موجود")'),
        ("توصيلات سعرها ناقص (المنتج أو تاريخ السعر)", f'=COUNTIF({L}$M$2:$M${MIRROR_LAST},"سعر ناقص")'),
        ("تسجيلات نوعها غير معروف", f'=COUNTIF({L}$M$2:$M${MIRROR_LAST},"نوع غير معروف")'),
        ("تنبيه السعة", f'=IF(COUNTIF({L}$A$2:$A${MIRROR_LAST},">0")>{MIRROR_LAST - 1 - 300},"⚠ قربت تمتلئ، كلم اللي سوّا لك الملف","✓ فيه مجال")'),
    ]
    row = 3
    for label, formula in checks:
        ws.cell(row=row, column=2, value=f'="{label}: "&{formula[1:]}')
        row += 1
    # red when a count check is not zero
    for r in (5, 6, 7):
        ws.conditional_formatting.add(f"B{r}", FormulaRule(formula=[f'RIGHT(B{r},3)<>": 0"'], fill=WARN_FILL))
    ws.conditional_formatting.add("B3", FormulaRule(formula=['ISNUMBER(SEARCH("✗",B3))'], fill=WARN_FILL))
    ws.conditional_formatting.add("B3", FormulaRule(formula=['ISNUMBER(SEARCH("✓",B3))'], fill=OK_FILL))
    ws.conditional_formatting.add("B8", FormulaRule(formula=['ISNUMBER(SEARCH("⚠",B8))'], fill=WARN_FILL))

    row = 10
    step = 0
    for kind, text in GUIDE:
        text = text.replace("**", "")
        cell = ws.cell(row=row, column=2)
        if kind == "h":
            cell.value = text
            cell.font = Font(bold=True, size=13)
            cell.fill = CALC_FILL
            row += 1
            step = 0
            continue
        if kind == "n":
            step += 1
            cell.value = f"{step}. {text}"
        elif kind == "s":
            cell.value = f"      {text}"
        elif kind == "b":
            cell.value = f"• {text}"
        else:
            cell.value = text
        cell.alignment = Alignment(wrap_text=True, vertical="top")
        ws.row_dimensions[row].height = max(18, 17 * (1 + len(text) // 95))
        row += 1


def build_settings(ws) -> None:
    rtl(ws, "F59E0B")
    widths(ws, {"A": 34, "B": 28, "C": 4, "D": 28, "E": 16, "F": 12, "G": 4, "H": 18})
    ws["A1"] = "الإعدادات"
    ws["A1"].font = Font(bold=True, size=14)
    ws["A3"] = "اسم تبويب ردود النموذج"
    ws["B3"] = "Form Responses 1"
    ws["A4"] = "حالة الربط"
    ws["B4"] = f'=IF(ISERROR(INDIRECT("\'"&B3&"\'!A1")),"✗ ما لقيت تبويب بهذا الاسم","✓ مربوط")'
    ws["A5"] = "بعد كم يوم يعتبر الدين متأخر"
    ws["B5"] = 30
    ws["B3"].fill = INPUT_FILL
    ws["B5"].fill = INPUT_FILL
    ws["A6"] = "(الاسم يظهر أسفل الشيت بعد ربط النموذج. انسخه بالضبط.)"
    ws["A6"].font = Font(italic=True, color="6B7280")
    ws.conditional_formatting.add("B4", FormulaRule(formula=['LEFT(B4,1)="✗"'], fill=WARN_FILL))
    ws.conditional_formatting.add("B4", FormulaRule(formula=['LEFT(B4,1)="✓"'], fill=OK_FILL))

    ws["A8"] = "السائقين"
    ws["D8"] = "المنتج"
    ws["E8"] = "السعر ينطبق من"
    ws["F8"] = "السعر (د.إ)"
    ws["H8"] = "طرق الدفع"
    for letters in ("A", "DEF", "H"):
        for letter in letters:
            c = ws[f"{letter}8"]
            c.fill = HEAD_FILL
            c.font = Font(bold=True, color="FFFFFF")
            c.alignment = Alignment(horizontal="center")
    fill_range(ws, "A", DRIVER_FIRST, DRIVER_LAST, INPUT_FILL)
    fill_range(ws, "DEF", PRICE_FIRST, PRICE_LAST, INPUT_FILL)
    for row, name in zip(range(METHOD_FIRST, METHOD_LAST + 1), ["نقد", "تحويل", "شيك", "بطاقة", "لم يدفع"]):
        ws[f"H{row}"] = name
        ws[f"H{row}"].fill = CALC_FILL
    for row in range(PRICE_FIRST, PRICE_LAST + 1):
        ws[f"E{row}"].number_format = DATE_FMT
        ws[f"F{row}"].number_format = MONEY
    ws["D30"] = "غيّرت السعر؟ أضف سطر جديد لنفس المنتج بتاريخ بداية السعر الجديد. لا تعدّل السعر القديم."
    ws["D30"].font = Font(italic=True, color="6B7280")


def build_customers(ws) -> None:
    rtl(ws, "F59E0B")
    heads = ["العميل", "الهاتف", "المنطقة", "الرصيد", "غير متأخر", "متأخر 31–60", "متأخر 61–90", "متأخر +90",
             "إجمالي المتأخر", "آخر توصيل", "أيام من آخر توصيل", "تذكير واتساب",
             "إجمالي الدين", "إجمالي السداد", "دين آخر 30", "دين آخر 60", "دين آخر 90", "ترتيب"]
    for i, h in enumerate(heads, 1):
        ws.cell(row=1, column=i, value=h)
    style_header(ws, 1, len(heads), 34)
    widths(ws, {"A": 26, "B": 14, "C": 16, "D": 13, "E": 13, "F": 13, "G": 13, "H": 13, "I": 14, "J": 13, "K": 12, "L": 14,
                "M": 12, "N": 12, "O": 12, "P": 12, "Q": 12, "R": 12})
    ws.freeze_panes = "B2"
    ws.auto_filter.ref = f"A1:L{CUST_LAST}"

    mc, mj, mk, ma = (f"{L}$C$2:$C${MIRROR_LAST}", f"{L}$J$2:$J${MIRROR_LAST}", f"{L}$K$2:$K${MIRROR_LAST}", f"{L}$A$2:$A${MIRROR_LAST}")
    md = f"{L}$D$2:$D${MIRROR_LAST}"
    pa, pb, pc = (f"{P}$A$2:$A${PREV_LAST}", f"{P}$B$2:$B${PREV_LAST}", f"{P}$C$2:$C${PREV_LAST}")

    for r in range(2, CUST_LAST + 1):
        a = f"$A{r}"
        phone = f'SUBSTITUTE(SUBSTITUTE($B{r}," ",""),"+","")'

        def since(days_expr: str) -> str:
            cutoff = f'">="&(TODAY()-{days_expr})'
            return (f"=IF({a}=\"\",\"\",SUMIFS({mj},{mc},{a},{ma},{cutoff})"
                    f"+SUMIFS({pc},{pb},{a},{pc},\">0\",{pa},{cutoff}))")

        ws[f"M{r}"] = f'=IF({a}="","",SUMIFS({mj},{mc},{a})+SUMIFS({pc},{pb},{a},{pc},">0"))'
        ws[f"N{r}"] = f'=IF({a}="","",SUMIFS({mk},{mc},{a})-SUMIFS({pc},{pb},{a},{pc},"<0"))'
        ws[f"D{r}"] = f'=IF({a}="","",ROUND(M{r}-N{r},2))'
        ws[f"O{r}"] = since(f"{LATE_DAYS}")
        ws[f"P{r}"] = since(f"2*{LATE_DAYS}")
        ws[f"Q{r}"] = since(f"3*{LATE_DAYS}")
        ws[f"E{r}"] = f'=IF({a}="","",ROUND(MAX(0,MIN(D{r},O{r})),2))'
        ws[f"F{r}"] = f'=IF({a}="","",ROUND(MAX(0,D{r}-O{r})-MAX(0,D{r}-P{r}),2))'
        ws[f"G{r}"] = f'=IF({a}="","",ROUND(MAX(0,D{r}-P{r})-MAX(0,D{r}-Q{r}),2))'
        ws[f"H{r}"] = f'=IF({a}="","",ROUND(MAX(0,D{r}-Q{r}),2))'
        ws[f"I{r}"] = f'=IF({a}="","",F{r}+G{r}+H{r})'
        ws[f"J{r}"] = (f'=IF({a}="","",IF(COUNTIFS({mc},{a},{md},"توصيل")=0,"",'
                       f'INT(_xlfn.MAXIFS({ma},{mc},{a},{md},"توصيل"))))')
        ws[f"K{r}"] = f'=IF(OR({a}="",J{r}=""),"",TODAY()-J{r})'
        ws[f"L{r}"] = (f'=IF(OR({a}="",$B{r}="",N(I{r})<=0),"",HYPERLINK("https://wa.me/"&'
                       f'IF(LEFT({phone},1)="0","971"&MID({phone},2,20),{phone})&"?text="&'
                       f'_xlfn.ENCODEURL("السلام عليكم "&{a}&"، نذكّرك بوجود مبلغ "&TEXT(I{r},"#,##0.00")&'
                       f'" درهم متأخر عندك. نرجو التسديد. شكراً"),"أرسل تذكير"))')
        ws[f"R{r}"] = f'=IF(OR({a}="",N(I{r})<=0),"",I{r}+ROW()/1000000)'
        for letter in "DEFGHI":
            ws[f"{letter}{r}"].number_format = MONEY
        for letter in "MNOPQ":
            ws[f"{letter}{r}"].number_format = MONEY
        ws[f"J{r}"].number_format = DATE_FMT
        ws[f"B{r}"].number_format = "@"
    fill_range(ws, "ABC", 2, CUST_LAST, INPUT_FILL)
    fill_range(ws, "DEFGHIJKL", 2, CUST_LAST, CALC_FILL)
    for letter in "MNOPQR":
        ws.column_dimensions[letter].outlineLevel = 1
        ws.column_dimensions[letter].hidden = True
        for r in range(2, CUST_LAST + 1):
            ws[f"{letter}{r}"].font = Font(color="9CA3AF")
    ws.conditional_formatting.add(f"I2:I{CUST_LAST}", CellIsRule(operator="greaterThan", formula=["0"], fill=WARN_FILL, font=Font(bold=True, color="991B1B")))
    ws.conditional_formatting.add(f"H2:H{CUST_LAST}", CellIsRule(operator="greaterThan", formula=["0"], font=Font(bold=True, color="991B1B")))


def build_top(ws) -> None:
    rtl(ws, "6B7280")
    heads = ["#", "العميل", "المنطقة", "الرصيد", "إجمالي المتأخر", "منه أكثر من 90", "الهاتف", "تذكير واتساب", "آخر توصيل", "ترتيب"]
    for i, h in enumerate(heads, 1):
        ws.cell(row=1, column=i, value=h)
    style_header(ws, 1, len(heads), 30)
    widths(ws, {"A": 5, "B": 26, "C": 16, "D": 14, "E": 15, "F": 15, "G": 14, "H": 14, "I": 13, "J": 12})
    ws.freeze_panes = "A2"
    key = f"{C}$R$2:$R${CUST_LAST}"
    for r in range(2, RANK_ROWS + 2):
        ws[f"A{r}"] = r - 1
        ws[f"J{r}"] = f'=IFERROR(LARGE({key},A{r}),"")'

        def pick(col: str) -> str:
            return f'=IF($J{r}="","",INDEX({C}${col}$2:${col}${CUST_LAST},MATCH($J{r},{key},0)))'

        ws[f"B{r}"] = pick("A")
        ws[f"C{r}"] = pick("C")
        ws[f"D{r}"] = pick("D")
        ws[f"E{r}"] = pick("I")
        ws[f"F{r}"] = pick("H")
        ws[f"G{r}"] = pick("B")
        ws[f"H{r}"] = pick("L")
        ws[f"I{r}"] = pick("J")
        for letter in "DEF":
            ws[f"{letter}{r}"].number_format = MONEY
        ws[f"I{r}"].number_format = DATE_FMT
        ws[f"J{r}"].font = Font(color="9CA3AF")
        for letter in "ABCDEFGHI":
            ws[f"{letter}{r}"].fill = CALC_FILL
    ws.column_dimensions["J"].outlineLevel = 1
    ws.column_dimensions["J"].hidden = True
    # rank numbers without a customer next to them are noise: paint them like the background
    ws.conditional_formatting.add(f"A2:A{RANK_ROWS + 1}", FormulaRule(formula=['$B2=""'], font=Font(color="F3F4F6")))


def build_daily(ws) -> None:
    rtl(ws, "6B7280")
    widths(ws, {"A": 26, "B": 14, "C": 14, "D": 14, "E": 16, "F": 16, "G": 14})
    ws["A1"] = "ملخص اليوم"
    ws["A1"].font = Font(bold=True, size=14)
    ws["A2"] = "التاريخ (غيّره لأي يوم)"
    ws["B2"] = "=TODAY()"
    ws["B2"].number_format = DATE_FMT
    ws["B2"].fill = INPUT_FILL
    heads = ["السائق", "عدد التوصيلات", "اسطوانات", "المبيعات", "نقد بيده", "تحويل وغيره", "آجل (دين جديد)"]
    for i, h in enumerate(heads, 1):
        ws.cell(row=4, column=i, value=h)
    style_header(ws, 4, len(heads), 30)

    def day(col_driver: bool = True) -> str:
        crit = f'{L}$A$2:$A${MIRROR_LAST},">="&$B$2,{L}$A$2:$A${MIRROR_LAST},"<"&($B$2+1)'
        return crit

    first, last = 5, 5 + (DRIVER_LAST - DRIVER_FIRST)
    for i, r in enumerate(range(first, last + 1)):
        src = DRIVER_FIRST + i
        ws[f"A{r}"] = f'=IF({S}A{src}="","",{S}A{src})'
        drv = f'{L}$B$2:$B${MIRROR_LAST},$A{r}'
        ws[f"B{r}"] = f'=IF($A{r}="","",COUNTIFS({drv},{L}$D$2:$D${MIRROR_LAST},"توصيل",{day()}))'
        ws[f"C{r}"] = f'=IF($A{r}="","",SUMIFS({L}$F$2:$F${MIRROR_LAST},{drv},{L}$D$2:$D${MIRROR_LAST},"توصيل",{day()}))'
        ws[f"D{r}"] = f'=IF($A{r}="","",SUMIFS({L}$I$2:$I${MIRROR_LAST},{drv},{day()}))'
        ws[f"E{r}"] = f'=IF($A{r}="","",SUMIFS({L}$G$2:$G${MIRROR_LAST},{drv},{L}$H$2:$H${MIRROR_LAST},"نقد",{day()}))'
        ws[f"F{r}"] = f'=IF($A{r}="","",SUMIFS({L}$G$2:$G${MIRROR_LAST},{drv},{day()})-E{r})'
        ws[f"G{r}"] = f'=IF($A{r}="","",SUMIFS({L}$J$2:$J${MIRROR_LAST},{drv},{day()}))'
    other, total = last + 1, last + 2
    all_day = day()
    ws[f"A{other}"] = "سائق غير مسجل في الإعدادات"
    ws[f"A{total}"] = "المجموع"
    ws[f"B{total}"] = f'=COUNTIFS({L}$D$2:$D${MIRROR_LAST},"توصيل",{all_day})'
    ws[f"C{total}"] = f'=SUMIFS({L}$F$2:$F${MIRROR_LAST},{L}$D$2:$D${MIRROR_LAST},"توصيل",{all_day})'
    ws[f"D{total}"] = f'=SUMIFS({L}$I$2:$I${MIRROR_LAST},{all_day})'
    ws[f"E{total}"] = f'=SUMIFS({L}$G$2:$G${MIRROR_LAST},{L}$H$2:$H${MIRROR_LAST},"نقد",{all_day})'
    ws[f"F{total}"] = f'=SUMIFS({L}$G$2:$G${MIRROR_LAST},{all_day})-E{total}'
    ws[f"G{total}"] = f'=SUMIFS({L}$J$2:$J${MIRROR_LAST},{all_day})'
    for letter in "BCDEFG":
        ws[f"{letter}{other}"] = f"={letter}{total}-SUM({letter}{first}:{letter}{last})"
        ws[f"{letter}{other}"].font = Font(color="9CA3AF")
    for r in range(first, total + 1):
        for letter in "DEFG":
            ws[f"{letter}{r}"].number_format = MONEY
        for letter in "ABCDEFG":
            ws[f"{letter}{r}"].border = BOX
    for letter in "ABCDEFG":
        ws[f"{letter}{total}"].font = Font(bold=True)
        ws[f"{letter}{total}"].fill = CALC_FILL
    ws["A20"] = "الديون الآن (كل العملاء)"
    ws["A20"].font = Font(bold=True, size=12)
    ws["A21"], ws["B21"] = "إجمالي الديون", f"=SUM({C}$D$2:$D${CUST_LAST})"
    ws["A22"], ws["B22"] = "منها متأخر أكثر من المدة", f"=SUM({C}$I$2:$I${CUST_LAST})"
    ws["A23"], ws["B23"] = "عدد العملاء المتأخرين", f'=COUNTIF({C}$I$2:$I${CUST_LAST},">0")'
    ws["B21"].number_format = MONEY
    ws["B22"].number_format = MONEY


def build_orders(ws) -> None:
    rtl(ws, "F59E0B")
    heads = ["تاريخ التوصيل", "العميل", "الطلب (المنتج والعدد)", "ملاحظة", "المنطقة", "الهاتف", "الرصيد الحالي", "تنبيه", "تم التوصيل؟"]
    for i, h in enumerate(heads, 1):
        ws.cell(row=1, column=i, value=h)
    style_header(ws, 1, len(heads), 30)
    widths(ws, {"A": 14, "B": 26, "C": 24, "D": 22, "E": 16, "F": 14, "G": 14, "H": 22, "I": 14})
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = f"A1:I{ORD_LAST}"
    names = f"{C}$A$2:$A${CUST_LAST}"
    dv = DataValidation(type="list", formula1=f"={names}", allow_blank=True, showErrorMessage=True,
                        errorTitle="عميل غير موجود", error="اختر العميل من القائمة. إذا جديد أضفه أول في تبويب العملاء.")
    ws.add_data_validation(dv)
    dv.add(f"B2:B{ORD_LAST}")
    for r in range(2, ORD_LAST + 1):
        def look(col: str) -> str:
            return f'INDEX({C}${col}$2:${col}${CUST_LAST},MATCH($B{r},{names},0))'

        ws[f"E{r}"] = f'=IF($B{r}="","",IFERROR({look("C")},"عميل غير موجود"))'
        ws[f"F{r}"] = f'=IF($B{r}="","",IFERROR({look("B")},""))'
        ws[f"G{r}"] = f'=IF($B{r}="","",IFERROR({look("D")},""))'
        ws[f"H{r}"] = f'=IF($B{r}="","",IF(IFERROR({look("I")},0)>0,"عليه متأخر "&TEXT({look("I")},"#,##0"),""))'
        ws[f"I{r}"] = (f'=IF(OR($B{r}="",$A{r}=""),"",IF(COUNTIFS({L}$C$2:$C${MIRROR_LAST},$B{r},'
                       f'{L}$D$2:$D${MIRROR_LAST},"توصيل",{L}$A$2:$A${MIRROR_LAST},">="&$A{r})>0,"✓ تم",""))')
        ws[f"A{r}"].number_format = DATE_FMT
        ws[f"G{r}"].number_format = MONEY
    fill_range(ws, "ABCD", 2, ORD_LAST, INPUT_FILL)
    fill_range(ws, "EFGHI", 2, ORD_LAST, CALC_FILL)
    ws.conditional_formatting.add(f"H2:H{ORD_LAST}", FormulaRule(formula=['LEN(H2)>0'], fill=WARN_FILL, font=Font(bold=True, color="991B1B")))


def build_prev(ws) -> None:
    rtl(ws, "F59E0B")
    for i, h in enumerate(["التاريخ", "العميل", "المبلغ (موجب = دين، سالب = تخفيض)", "السبب"], 1):
        ws.cell(row=1, column=i, value=h)
    style_header(ws, 1, 4, 40)
    widths(ws, {"A": 14, "B": 26, "C": 22, "D": 40})
    ws.freeze_panes = "A2"
    names = f"{C}$A$2:$A${CUST_LAST}"
    dv = DataValidation(type="list", formula1=f"={names}", allow_blank=True, showErrorMessage=True,
                        errorTitle="عميل غير موجود", error="اختر العميل من القائمة.")
    ws.add_data_validation(dv)
    dv.add(f"B2:B{PREV_LAST}")
    fill_range(ws, "ABCD", 2, PREV_LAST, INPUT_FILL)
    for r in range(2, PREV_LAST + 1):
        ws[f"A{r}"].number_format = DATE_FMT
        ws[f"C{r}"].number_format = MONEY


def build_log(ws) -> None:
    rtl(ws, "9CA3AF")
    heads = ["الوقت", "السائق", "العميل", "النوع", "المنتج", "العدد", "المستلم", "طريقة الدفع",
             "قيمة التوصيل", "دين جديد", "سداد", "", "تنبيه"]
    for i, h in enumerate(heads, 1):
        ws.cell(row=1, column=i, value=h)
    style_header(ws, 1, len(heads), 28)
    widths(ws, {"A": 17, "B": 16, "C": 24, "D": 10, "E": 20, "F": 8, "G": 11, "H": 12, "I": 13, "J": 12, "K": 12, "L": 2, "M": 18})
    ws.freeze_panes = "A2"
    prod = f"{S}$D${PRICE_FIRST}:$D${PRICE_LAST}"
    frm = f"{S}$E${PRICE_FIRST}:$E${PRICE_LAST}"
    prc = f"{S}$F${PRICE_FIRST}:$F${PRICE_LAST}"
    for r in range(2, MIRROR_LAST + 1):
        ws[f"A{r}"] = f"=IFERROR(N({indirect('A')}),0)"
        ws[f"B{r}"] = f'=IFERROR({indirect("B")}&"","")'
        ws[f"C{r}"] = f'=IFERROR({indirect("C")}&"","")'
        ws[f"D{r}"] = f'=IFERROR({indirect("D")}&"","")'
        ws[f"E{r}"] = f'=IFERROR({indirect("E")}&"","")'
        ws[f"F{r}"] = f"=IFERROR(N({indirect('F')}),0)"
        ws[f"G{r}"] = f"=IFERROR(N({indirect('G')}),0)"
        ws[f"H{r}"] = f'=IFERROR({indirect("H")}&"","")'
        price = (f"SUMIFS({prc},{prod},E{r},{frm},_xlfn.MAXIFS({frm},{prod},E{r},{frm},\"<=\"&INT(A{r})))")
        ws[f"I{r}"] = f'=IF(D{r}="توصيل",ROUND(F{r}*{price},2),0)'
        ws[f"J{r}"] = f'=IF(D{r}="توصيل",MAX(0,I{r}-G{r}),0)'
        ws[f"K{r}"] = f'=IF(D{r}="توصيل",MAX(0,G{r}-I{r}),IF(D{r}="سداد",G{r},0))'
        ws[f"M{r}"] = (f'=IF(A{r}=0,"",IF(AND(D{r}<>"توصيل",D{r}<>"سداد"),"نوع غير معروف",'
                       f'IF(COUNTIF({C}$A$2:$A${CUST_LAST},C{r})=0,"اسم غير موجود",'
                       f'IF(AND(D{r}="توصيل",I{r}=0),"سعر ناقص",""))))')
        ws[f"A{r}"].number_format = DATETIME_FMT
        for letter in "GIJK":
            ws[f"{letter}{r}"].number_format = MONEY
    ws.conditional_formatting.add(f"M2:M{MIRROR_LAST}", FormulaRule(formula=['LEN(M2)>0'], fill=WARN_FILL))


def add_sample(wb: Workbook, sample: dict) -> None:
    """Fill a copy with test/demo data. sample keys: customers, prev, responses, drivers, products."""
    ws = wb[CUST]
    for i, (name, phone, area) in enumerate(sample["customers"], 2):
        ws[f"A{i}"], ws[f"B{i}"], ws[f"C{i}"] = name, phone, area
    ws = wb[PREV]
    for i, (d, name, amount, why) in enumerate(sample["prev"], 2):
        ws[f"A{i}"], ws[f"B{i}"], ws[f"C{i}"], ws[f"D{i}"] = d, name, amount, why
    ws = wb[SETTINGS]
    for i, name in enumerate(sample["drivers"], DRIVER_FIRST):
        ws[f"A{i}"] = name
    for i, (name, since, price) in enumerate(sample["products"], PRICE_FIRST):
        ws[f"D{i}"], ws[f"E{i}"], ws[f"F{i}"] = name, since, price
    resp = wb.create_sheet(sample.get("response_tab", "Form Responses 1"))
    resp.sheet_view.rightToLeft = True
    for i, h in enumerate(["Timestamp", "اسم السائق", "العميل", "نوع الحركة", "المنتج", "العدد", "المبلغ المستلم", "طريقة الدفع", "ملاحظات"], 1):
        resp.cell(row=1, column=i, value=h)
    for r, row in enumerate(sample["responses"], 2):
        for c, value in enumerate(row, 1):
            if value is not None:
                resp.cell(row=r, column=c, value=value)
        resp[f"A{r}"].number_format = "yyyy-mm-dd hh:mm:ss"
    widths(resp, {"A": 20, "B": 16, "C": 24, "D": 12, "E": 20, "F": 8, "G": 14, "H": 12, "I": 24})


def build(path: Path, sample: dict | None = None) -> Path:
    wb = Workbook()
    start = wb.active
    start.title = START
    sheets = {name: wb.create_sheet(name) for name in (SETTINGS, CUST, TOP, DAILY, ORDERS, PREV, LOG)}
    build_start(start)
    build_settings(sheets[SETTINGS])
    build_customers(sheets[CUST])
    build_top(sheets[TOP])
    build_daily(sheets[DAILY])
    build_orders(sheets[ORDERS])
    build_prev(sheets[PREV])
    build_log(sheets[LOG])
    # order the tabs the way a manager reads them
    order = [START, DAILY, TOP, CUST, ORDERS, PREV, SETTINGS, LOG]
    wb._sheets = [wb[n] for n in order]
    if sample:
        add_sample(wb, sample)
    wb.calculation.fullCalcOnLoad = True  # the file has no stored results: make Excel/Sheets calculate on open
    wb.save(path)
    return path


def guide_markdown() -> str:
    out = ["# دليل الشيت + النموذج", ""]
    step = 0
    for kind, text in GUIDE:
        if kind == "h":
            out += ["", f"## {text}", ""]
            step = 0
        elif kind == "n":
            step += 1
            out.append(f"{step}. {text}")
        elif kind == "s":
            out.append(f"    - {text}")
        elif kind == "b":
            out.append(f"- {text}")
        else:
            out += [text, ""]
    return "\n".join(out) + "\n"


if __name__ == "__main__":
    here = Path(__file__).resolve().parent
    build(here / "gas-ledger-template.xlsx")
    (here / "GUIDE.md").write_text(guide_markdown(), encoding="utf-8")
    print("built", here / "gas-ledger-template.xlsx")
