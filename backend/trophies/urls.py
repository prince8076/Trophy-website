from django.urls import path
from .views import (
    CategoryListView,
    ProductListView,
    ProductDetailView,
    ProductAdminDetailView,
    OrderCreateView,
    OrderDetailView,
    ImageUploadView,
    FeaturedStatsView,
)

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("products/", ProductListView.as_view(), name="product-list"),
    path("products/<slug:slug>/", ProductDetailView.as_view(), name="product-detail"),
    path("products/manage/<int:pk>/", ProductAdminDetailView.as_view(), name="product-admin-detail"),
    path("orders/", OrderCreateView.as_view(), name="order-create"),
    path("orders/<str:order_number>/", OrderDetailView.as_view(), name="order-detail"),
    path("upload/", ImageUploadView.as_view(), name="image-upload"),
    path("featured-overview/", FeaturedStatsView.as_view(), name="featured-overview"),
]

