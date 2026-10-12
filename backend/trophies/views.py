import os
import uuid
import shutil
from django.conf import settings
from django.db.models import Q
from rest_framework import generics, status, views
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from .models import Category, Product, Order, Enquiry, Review
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    OrderSerializer,
    EnquirySerializer,
    ReviewSerializer,
)


class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductListView(generics.ListCreateAPIView):
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


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = "slug"


class ProductAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = "pk"


class OrderCreateView(generics.ListCreateAPIView):
    queryset = Order.objects.prefetch_related("items").all()
    serializer_class = OrderSerializer


class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.prefetch_related("items").all()
    serializer_class = OrderSerializer
    lookup_field = "order_number"


class ImageUploadView(views.APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get("image") or request.FILES.get("file")
        if not file_obj:
            return Response({"error": "No image file provided in request."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Save in MEDIA_ROOT / trophies
        trophies_dir = os.path.join(settings.MEDIA_ROOT, "trophies")
        os.makedirs(trophies_dir, exist_ok=True)

        ext = os.path.splitext(file_obj.name)[1].lower()
        if not ext:
            ext = ".png"

        clean_base = os.path.splitext(file_obj.name)[0].replace(" ", "-").lower()
        clean_base = "".join(c for c in clean_base if c.isalnum() or c in "-_")
        if not clean_base:
            clean_base = "trophy-award"

        filename = f"{clean_base}-{uuid.uuid4().hex[:6]}{ext}"
        filepath = os.path.join(trophies_dir, filename)

        with open(filepath, "wb+") as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)

        # 2. Also replicate in frontend/public/uploads if exists
        try:
            frontend_uploads = os.path.abspath(os.path.join(settings.BASE_DIR, "..", "frontend", "public", "uploads"))
            if os.path.exists(frontend_uploads):
                dest_frontend = os.path.join(frontend_uploads, filename)
                shutil.copyfile(filepath, dest_frontend)
        except Exception:
            pass

        # Return /media/trophies/ relative URL
        image_url = f"/media/trophies/{filename}"
        return Response({
            "image_url": image_url,
            "filename": filename,
            "message": "Image uploaded successfully",
        }, status=status.HTTP_201_CREATED)


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


class EnquiryListView(generics.ListCreateAPIView):
    queryset = Enquiry.objects.all()
    serializer_class = EnquirySerializer


class EnquiryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Enquiry.objects.all()
    serializer_class = EnquirySerializer
    lookup_field = "enquiry_number"


class ReviewListView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        queryset = Review.objects.all()
        product_slug = self.request.query_params.get("product")
        if product_slug:
            queryset = queryset.filter(Q(product__slug=product_slug) | Q(product__isnull=True))
        return queryset

