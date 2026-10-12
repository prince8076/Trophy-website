from django.db.models import Q
from rest_framework import generics, status, views
from rest_framework.response import Response
from .models import Category, Product, Order
from .serializers import CategorySerializer, ProductSerializer, OrderSerializer


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.select_related("category").all()

        category = self.request.query_params.get("category")
        if category and category != "all":
            queryset = queryset.filter(category__slug=category)

        featured = self.request.query_params.get("featured")
        if featured and featured.lower() == "true":
            queryset = queryset.filter(is_featured=True)

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(material__icontains=search)
            )

        sort_by = self.request.query_params.get("sort", "featured")
        if sort_by == "price_low":
            queryset = queryset.order_by("price")
        elif sort_by == "price_high":
            queryset = queryset.order_by("-price")
        elif sort_by == "rating":
            queryset = queryset.order_by("-rating")
        elif sort_by == "newest":
            queryset = queryset.order_by("-created_at")
        else:
            queryset = queryset.order_by("-is_featured", "-created_at")

        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = "slug"


class OrderCreateView(generics.CreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer


class OrderDetailView(generics.RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    lookup_field = "order_number"


class FeaturedStatsView(views.APIView):
    def get(self, request):
        featured_products = Product.objects.filter(is_featured=True)[:6]
        categories = Category.objects.all()
        return Response({
            "categories": CategorySerializer(categories, many=True).data,
            "featured_products": ProductSerializer(featured_products, many=True).data,
            "total_products": Product.objects.count(),
            "guarantees": [
                {
                    "title": "Free Custom Engraving",
                    "description": "High precision laser etching on gold, silver, or black plates at zero extra charge.",
                    "icon": "Sparkles"
                },
                {
                    "title": "Turnaround Guarantee",
                    "description": "Fast 48-hour rush production available for corporate and championship events.",
                    "icon": "Zap"
                },
                {
                    "title": "Handcrafted Luxury",
                    "description": "Premium optical crystal, hand-polished marble, and heavy spun metals.",
                    "icon": "Award"
                },
                {
                    "title": "Safe Delivery Insured",
                    "description": "Custom molded velvet-lined presentation packaging to ensure pristine delivery.",
                    "icon": "ShieldCheck"
                }
            ]
        })
