"""Small text helpers: Arabic search normalisation and UAE phone numbers."""
import re
import unicodedata
from urllib.parse import quote

_DIACRITICS = re.compile(r"[ؐ-ًؚ-ٰٟۖ-ۭـ]")
_ARABIC_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹", "01234567890123456789")


def to_western_digits(text: str) -> str:
    return (text or "").translate(_ARABIC_DIGITS)


def normalize_arabic(text: str) -> str:
    """Lower-case, strip diacritics and unify letter variants so that
    'أحمد' == 'احمد' and 'فاطمة' == 'فاطمه' when searching."""
    text = unicodedata.normalize("NFKC", to_western_digits(text or "")).lower()
    text = _DIACRITICS.sub("", text)
    text = re.sub("[أإآٱ]", "ا", text)
    text = text.replace("ى", "ي").replace("ة", "ه").replace("ؤ", "و").replace("ئ", "ي")
    return re.sub(r"\s+", " ", text).strip()


def normalize_phone(raw: str, default_country: str = "971") -> str:
    """Return digits in international form without '+', e.g. 971501234567.

    Accepts 0501234567, 501234567, +971 50 123 4567, 00971501234567 and
    Arabic-Indic digits. Returns '' when there is nothing usable.
    """
    digits = re.sub(r"\D", "", to_western_digits(raw or ""))
    if not digits:
        return ""
    if digits.startswith("00"):
        digits = digits[2:]
    if digits.startswith(default_country):
        return digits
    if digits.startswith("0"):
        return default_country + digits[1:]
    if len(digits) <= 9:  # local number typed without the leading zero
        return default_country + digits
    return digits


def tel_url(raw: str) -> str:
    n = normalize_phone(raw)
    return f"tel:+{n}" if n else ""


def whatsapp_url(raw: str, text: str = "") -> str:
    n = normalize_phone(raw)
    if not n:
        return ""
    return f"https://wa.me/{n}" + (f"?text={quote(text)}" if text else "")
