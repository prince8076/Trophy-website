from django.contrib import admin
from .models import Category, Product, Order, OrderItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "order"]
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ["name"]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "price", "stock", "is_featured", "rating"]
    list_filter = ["category", "is_featured", "badge"]
    search_fields = ["name", "description", "material"]
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ["price", "stock", "is_featured"]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["product_name", "unit_price", "quantity", "engraving_line1", "engraving_line2", "engraving_line3", "engraving_font", "plate_color"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["order_number", "customer_name", "customer_email", "total_amount", "status", "created_at"]
    list_filter = ["status", "created_at"]
    search_fields = ["order_number", "customer_name", "customer_email", "customer_phone"]
    inlines = [OrderItemInline]
    readonly_fields = ["order_number", "created_at"]
