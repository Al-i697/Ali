"""Template context: company name, the user's role and the navigation."""
from django.urls import reverse

from .models import CompanySettings
from .permissions import get_role, is_admin

# url name -> which navigation item is "current"
_SECTION = {
    "home": "home",
    "route": "route", "order_deliver": "route",
    "order_list": "orders", "order_detail": "orders", "order_edit": "orders",
    "order_pick": "new_order", "order_create": "new_order",
    "customer_list": "customers", "customer_create": "customers", "customer_detail": "customers",
    "customer_edit": "customers", "customer_payment": "customers", "customer_opening": "customers",
    "customer_writeoff": "customers", "customer_promise": "customers", "customer_statement": "customers",
    "entry_void": "customers",
    "debts": "debts",
    "daily": "daily", "areas": "areas", "area_edit": "areas", "products": "products", "product_edit": "products",
    "users": "users", "user_create": "users", "user_edit": "users", "settings": "settings",
    "more": "more",
}


def app(request):
    user = request.user
    if not user.is_authenticated:
        return {}
    admin = is_admin(user)
    section = _SECTION.get(getattr(request.resolver_match, "url_name", ""), "")

    def item(key, label, url_name, icon):
        return {"key": key, "label": label, "url": reverse(url_name), "icon": icon, "active": key == section}

    side_main = [item("route", "توزيع اليوم", "route", "truck")]
    if admin:
        side_main.insert(0, item("home", "الرئيسية", "home", "home"))
    side_main += [
        item("orders", "الطلبات", "order_list", "list"),
        item("customers", "العملاء", "customer_list", "users"),
        item("debts", "الديون", "debts", "wallet"),
    ]
    side_admin = []
    if admin:
        side_admin = [
            item("daily", "ملخص اليوم", "daily", "report"),
            item("areas", "المناطق", "areas", "pin"),
            item("products", "المنتجات والأسعار", "products", "box"),
            item("users", "المستخدمون", "users", "user"),
            item("settings", "الإعدادات", "settings", "sliders"),
        ]

    if admin:
        bottom = [
            item("home", "الرئيسية", "home", "home"),
            item("route", "التوزيع", "route", "truck"),
            item("new_order", "طلب جديد", "order_pick", "plus"),
            item("customers", "العملاء", "customer_list", "users"),
            item("debts", "الديون", "debts", "wallet"),
        ]
    else:
        bottom = [
            item("route", "التوزيع", "route", "truck"),
            item("new_order", "طلب جديد", "order_pick", "plus"),
            item("customers", "العملاء", "customer_list", "users"),
            item("debts", "الديون", "debts", "wallet"),
        ]
    bottom[[b["key"] for b in bottom].index("new_order")]["primary"] = True

    return {
        "company": CompanySettings.get(),
        "role": get_role(user),
        "is_admin": admin,
        "side_main": side_main,
        "side_admin": side_admin,
        "bottom_nav": bottom,
        "more_active": section == "more",
    }
