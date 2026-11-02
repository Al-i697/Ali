from datetime import date, datetime
from decimal import Decimal
from urllib.parse import urlencode

from django import template
from django.utils import timezone
from django.utils.html import format_html
from django.utils.safestring import mark_safe

from .. import text as text_utils

register = template.Library()

CURRENCY = "د.إ"
MINUS = "−"


def days_ar(n: int) -> str:
    """Correct Arabic for a number of days: يوم / يومين / 3 أيام ... 11 يوم."""
    if n == 1:
        return "يوم"
    if n == 2:
        return "يومين"
    if 3 <= n <= 10:
        return f"{n} أيام"
    return f"{n} يوم"


@register.filter
def money(value, signed=False):
    if value in (None, ""):
        return "—"
    value = Decimal(value)
    body = f"{abs(value):,.2f}"
    if signed:
        return ("+" if value > 0 else MINUS if value < 0 else "") + body
    return (MINUS if value < 0 else "") + body


@register.simple_tag
def amt(value, signed=False, strong=False, unit=True, cls=""):
    """A money amount: tabular digits, the currency as a smaller grey suffix,
    a real zero printed in grey."""
    if value is None:
        return mark_safe('<span class="amt is-missing">—</span>')
    value = Decimal(value)
    classes = ["amt"]
    if value == 0:
        classes.append("is-zero")
    if strong:
        classes.append("is-strong")
    if cls:
        classes.append(cls)
    suffix = format_html('<small class="unit">{}</small>', CURRENCY) if unit else ""
    return format_html(
        '<span class="{}"><span class="n" dir="ltr">{}</span>{}</span>',
        " ".join(classes), money(value, signed), suffix,
    )


@register.filter
def absval(value):
    return abs(Decimal(value)) if value not in (None, "") else value


@register.filter
def ago(value):
    """Relative day in words: اليوم / أمس / قبل 5 أيام / غداً / بعد 3 أيام."""
    if not value:
        return "—"
    if isinstance(value, datetime):
        value = timezone.localtime(value).date() if timezone.is_aware(value) else value.date()
    delta = (timezone.localdate() - value).days
    if delta == 0:
        return "اليوم"
    if delta == 1:
        return "أمس"
    if delta == -1:
        return "غداً"
    if delta > 0:
        return f"قبل {days_ar(delta)}"
    return f"بعد {days_ar(-delta)}"


@register.filter
def days(value):
    return days_ar(int(value)) if value is not None else "—"


@register.filter
def iso(value):
    if not value:
        return "—"
    if isinstance(value, datetime):
        value = timezone.localtime(value)
    return value.strftime("%Y-%m-%d")


@register.filter
def clock(value):
    return timezone.localtime(value).strftime("%H:%M") if value else ""


@register.filter
def tel(phone):
    return text_utils.tel_url(phone)


@register.simple_tag
def wa(phone, message=""):
    return text_utils.whatsapp_url(phone, message)


@register.filter
def shortphone(phone):
    """0501234567 -> '050 123 4567' for display; other formats pass through."""
    n = text_utils.normalize_phone(phone)
    if n.startswith("971") and len(n) == 12:
        local = "0" + n[3:]
        return f"{local[:3]} {local[3:6]} {local[6:]}"
    return phone or ""


@register.simple_tag(takes_context=True)
def qs(context, **updates):
    """Current query string with some keys replaced (None/'' removes a key)."""
    params = context["request"].GET.copy()
    for key, value in updates.items():
        if value is None or value == "":
            params.pop(key, None)
        else:
            params[key] = value
    encoded = urlencode(params, doseq=True)
    return f"?{encoded}" if encoded else "?"


@register.filter
def get_item(mapping, key):
    return mapping.get(key)


_ICONS = {
    "home": '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    "truck": '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/>'
    '<path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>'
    '<circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>'
    '<path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    "user": '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    "wallet": '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2"/>'
    '<path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    "plus": '<path d="M5 12h14"/><path d="M12 5v14"/>',
    "menu": '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
    "phone": '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    "chat": '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    "pin": '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    "check": '<path d="M20 6L9 17l-5-5"/>',
    "back": '<path d="M9 18l6-6-6-6"/>',
    "next": '<path d="M15 18l-6-6 6-6"/>',
    "list": '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
    "report": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    "box": '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3.3 7L12 12l8.7-5"/><path d="M12 22V12"/>',
    "sliders": '<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M1 14h6"/><path d="M9 8h6"/><path d="M17 16h6"/>',
    "logout": '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
    "search": '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>',
    "edit": '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    "clock": '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    "more": '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
    "print": '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/>',
    "download": '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
    "x": '<path d="M18 6L6 18"/><path d="M6 6l12 12"/>',
}


@register.simple_tag
def icon(name, size=18):
    body = _ICONS.get(name, "")
    return mark_safe(
        f'<svg class="icon" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
        f'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{body}</svg>'
    )
