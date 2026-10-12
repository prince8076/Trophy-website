from rest_framework import serializers
from .models import Category, Product, Order, OrderItem


class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(source="products.count", read_only=True)

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "icon_name",
            "image_url",
            "order",
            "products_count",
        ]


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    slug = serializers.SlugField(required=False, allow_blank=True)
    image_url = serializers.CharField(required=False, allow_blank=True, default="/uploads/star-pillar-crystal-award.png")

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "category",
            "category_name",
            "category_slug",
            "description",
            "price",
            "original_price",
            "material",
            "dimensions",
            "weight",
            "stock",
            "image_url",
            "image",
            "secondary_images",
            "is_featured",
            "badge",
            "rating",
            "reviews_count",
            "max_engraving_lines",
            "max_chars_per_line",
            "created_at",
        ]

    def to_internal_value(self, data):
        # Allow category to be passed as an id, slug, or name
        if "category" in data and isinstance(data["category"], str) and not data["category"].isdigit():
            cat = Category.objects.filter(slug=data["category"]).first() or Category.objects.filter(name__iexact=data["category"]).first()
            if cat:
                data = data.copy()
                data["category"] = cat.id
        return super().to_internal_value(data)


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "unit_price",
            "quantity",
            "engraving_line1",
            "engraving_line2",
            "engraving_line3",
            "engraving_font",
            "plate_color",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, required=False)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "customer_name",
            "customer_email",
            "customer_phone",
            "shipping_address",
            "city",
            "postal_code",
            "total_amount",
            "status",
            "payment_method",
            "notes",
            "created_at",
            "items",
        ]
        read_only_fields = ["order_number", "created_at"]

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

