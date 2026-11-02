from django.contrib.auth.views import LogoutView
from django.urls import path

from . import views as v

urlpatterns = [
    path("login/", v.ThrottledLoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("", v.home, name="home"),
    path("more/", v.more, name="more"),
    path("route/", v.route, name="route"),
    # orders
    path("orders/", v.order_list, name="order_list"),
    path("orders/new/", v.order_pick, name="order_pick"),
    path("orders/new/<int:customer_id>/", v.order_create, name="order_create"),
    path("orders/<int:pk>/", v.order_detail, name="order_detail"),
    path("orders/<int:pk>/edit/", v.order_edit, name="order_edit"),
    path("orders/<int:pk>/deliver/", v.order_deliver, name="order_deliver"),
    path("orders/<int:pk>/cancel/", v.order_cancel, name="order_cancel"),
    path("orders/<int:pk>/revert/", v.order_revert, name="order_revert"),
    # customers
    path("customers/", v.customer_list, name="customer_list"),
    path("customers/new/", v.customer_create, name="customer_create"),
    path("customers/<int:pk>/", v.customer_detail, name="customer_detail"),
    path("customers/<int:pk>/edit/", v.customer_edit, name="customer_edit"),
    path("customers/<int:pk>/payment/", v.customer_payment, name="customer_payment"),
    path("customers/<int:pk>/opening/", v.customer_opening, name="customer_opening"),
    path("customers/<int:pk>/writeoff/", v.customer_writeoff, name="customer_writeoff"),
    path("customers/<int:pk>/promise/", v.customer_promise, name="customer_promise"),
    path("customers/<int:pk>/statement/", v.customer_statement, name="customer_statement"),
    path("entries/<int:pk>/void/", v.entry_void, name="entry_void"),
    path("promises/<int:pk>/done/", v.promise_done, name="promise_done"),
    # debts & reports
    path("debts/", v.debts, name="debts"),
    path("debts/export.csv", v.debts_csv, name="debts_csv"),
    path("daily/", v.daily, name="daily"),
    # setup
    path("areas/", v.areas, name="areas"),
    path("areas/<int:pk>/", v.area_edit, name="area_edit"),
    path("products/", v.products, name="products"),
    path("products/<int:pk>/", v.product_edit, name="product_edit"),
    path("users/", v.users, name="users"),
    path("users/new/", v.user_create, name="user_create"),
    path("users/<int:pk>/", v.user_edit, name="user_edit"),
    path("settings/", v.settings_view, name="settings"),
]
