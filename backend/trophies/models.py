import uuid
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    icon_name = models.CharField(max_length=50, blank=True, help_text="Lucide icon name")
    image_url = models.URLField(max_length=500, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["order", "name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(Category, related_name="products", on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    material = models.CharField(max_length=100, default="Crystal & Brass")
    dimensions = models.CharField(max_length=100, default="10\" H x 4.5\" W")
    weight = models.CharField(max_length=50, default="2.2 lbs (1.0 kg)")
    stock = models.PositiveIntegerField(default=40)
    image_url = models.URLField(max_length=500)
    secondary_images = models.JSONField(default=list, blank=True)
    is_featured = models.BooleanField(default=False)
    badge = models.CharField(max_length=50, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.9)
    reviews_count = models.PositiveIntegerField(default=18)
    max_engraving_lines = models.PositiveIntegerField(default=3)
    max_chars_per_line = models.PositiveIntegerField(default=35)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_featured", "-created_at"]

    def __str__(self):
        return self.name


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("in_engraving", "In Engraving"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
    ]

    order_number = models.CharField(max_length=50, unique=True, editable=False)
    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=50)
    shipping_address = models.TextField()
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=30)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="confirmed")
    payment_method = models.CharField(max_length=50, default="Credit Card / Demo")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"TRP-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order #{self.order_number} - {self.customer_name}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=200)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    engraving_line1 = models.CharField(max_length=100, blank=True)
    engraving_line2 = models.CharField(max_length=100, blank=True)
    engraving_line3 = models.CharField(max_length=100, blank=True)
    engraving_font = models.CharField(max_length=50, default="Classic Serif")
    plate_color = models.CharField(max_length=50, default="Gold")

    def __str__(self):
        return f"{self.quantity}x {self.product_name} (Order {self.order.order_number})"
