from django.contrib import admin

from .models import (
    Area,
    CompanySettings,
    Customer,
    LedgerEntry,
    Order,
    OrderItem,
    PaymentPromise,
    Product,
    Profile,
)

admin.site.site_header = "إدارة النظام"
admin.site.site_title = "إدارة النظام"


@admin.register(Area, Product, CompanySettings, Profile)
class PlainAdmin(admin.ModelAdmin):
    pass


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "area", "is_active")
    list_filter = ("area", "is_active")
    search_fields = ("name", "phone", "address")


class ItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "status", "delivery_date")
    list_filter = ("status",)
    inlines = [ItemInline]
    # Money is only changed through the app, which keeps the audit trail.
    readonly_fields = ("status", "delivered_at", "delivered_on", "delivered_by")


@admin.register(LedgerEntry)
class LedgerEntryAdmin(admin.ModelAdmin):
    """Read-only on purpose: debts and payments are never edited or deleted.
    Wrong entries are cancelled from the customer's page, which records who and why."""

    list_display = ("id", "customer", "kind", "amount", "date", "voided")
    list_filter = ("kind", "voided")
    search_fields = ("customer__name",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


admin.site.register(PaymentPromise)
