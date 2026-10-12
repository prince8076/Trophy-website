import os
import uuid
import shutil
import logging
import re
from django.conf import settings
from django.db.models import Q
from django.core.mail import EmailMultiAlternatives
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


logger = logging.getLogger(__name__)


def send_enquiry_notification_email(enquiry):
    """
    Sends rich HTML and plain text email notifications to admin and workshop heads
    (e.g. madhu@shreejicorporates.com, shreejicorporates@gmail.com, etc.)
    """
    recipients = getattr(settings, 'ENQUIRY_NOTIFICATION_EMAILS', [
        'madhu@shreejicorporates.com',
        'rahulsingh00c@gmail.com',
        'shreejicorporates@gmail.com',
    ])
    subject = f"🏆 New Trophy Quote Enquiry [{enquiry.enquiry_number}]: {enquiry.customer_name} ({enquiry.company_name or 'Individual'})"

    lines = []
    if enquiry.engraving_line1:
        lines.append(f"  Line 1: {enquiry.engraving_line1}")
    if enquiry.engraving_line2:
        lines.append(f"  Line 2: {enquiry.engraving_line2}")
    if enquiry.engraving_line3:
        lines.append(f"  Line 3: {enquiry.engraving_line3}")
    engraving_text = "\n".join(lines) if lines else "  None specified"

    # Clean phone digits for WhatsApp link
    raw_phone = re.sub(r"[^\d]", "", enquiry.customer_phone or "")
    clean_phone = raw_phone if raw_phone.startswith("91") else f"91{raw_phone}"

    text_content = f"""NEW TROPHY QUOTE ENQUIRY RECEIVED
======================================
Enquiry ID: {enquiry.enquiry_number}
Received At: {enquiry.created_at}

CLIENT INFORMATION:
-------------------
Customer Name: {enquiry.customer_name}
Phone / WhatsApp: {enquiry.customer_phone}
Email: {enquiry.customer_email}
Organization / Company: {enquiry.company_name or 'N/A'}
City / Location: {enquiry.city or 'N/A'}

TROPHY & QUANTITY SPECIFICATIONS:
---------------------------------
Product: {enquiry.product_name or 'General Custom Portfolio'}
Quantity Needed: {enquiry.quantity}
Target Delivery Date: {enquiry.required_date or 'Standard Delivery'}
Plate Color / Finish: {enquiry.plate_color}

LASER ENGRAVING SPECIFICATIONS:
-------------------------------
{engraving_text}

CUSTOM NOTES / LOGO DETAILS:
----------------------------
{enquiry.notes or 'None provided'}

ACTION REQUIRED:
Please review and reply via WhatsApp (+91 87969 77707) or email with digital vector proof and quotation within 2 hours.
"""

    notes_html = f'<p style="margin-top:10px;font-size:12px;color:#cbd5e1;"><strong>Client Notes:</strong> {enquiry.notes}</p>' if enquiry.notes else ''

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 20px; margin: 0; }}
        .card {{ max-width: 650px; margin: 0 auto; background: #0f172a; border: 1px solid #d97706; border-radius: 16px; overflow: hidden; }}
        .header {{ background: linear-gradient(135deg, #1e293b, #0f172a); border-bottom: 2px solid #f59e0b; padding: 24px; text-align: center; }}
        .header h1 {{ color: #f59e0b; margin: 0 0 6px 0; font-size: 22px; font-family: Georgia, serif; }}
        .badge {{ display: inline-block; background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-family: monospace; font-size: 12px; margin-top: 8px; }}
        .section {{ padding: 18px 24px; border-bottom: 1px solid #1e293b; }}
        .section-title {{ font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.2px; color: #f59e0b; margin-bottom: 10px; }}
        .table {{ width: 100%; border-collapse: collapse; }}
        .table td {{ padding: 6px 0; font-size: 13px; vertical-align: top; }}
        .table .lbl {{ color: #94a3b8; width: 38%; }}
        .table .val {{ color: #ffffff; font-weight: 600; }}
        .engraving-box {{ background: #020617; border: 1px dashed #d97706; border-radius: 10px; padding: 12px 16px; font-family: Georgia, serif; color: #fef08a; font-size: 13px; line-height: 1.6; }}
        .footer {{ background: #020617; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; }}
        .btn {{ display: inline-block; background: #059669; color: #ffffff; text-decoration: none; padding: 10px 22px; border-radius: 8px; font-weight: bold; font-size: 13px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>🏆 New Trophy Quote Enquiry</h1>
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">Shreeji Corporates Lead Dispatch System</p>
          <span class="badge">Reference ID: {enquiry.enquiry_number}</span>
        </div>
        
        <div class="section">
          <div class="section-title">Client Details</div>
          <table class="table">
            <tr><td class="lbl">Client Name:</td><td class="val">{enquiry.customer_name}</td></tr>
            <tr><td class="lbl">Phone / WhatsApp:</td><td class="val"><a href="tel:{enquiry.customer_phone}" style="color:#38bdf8;">{enquiry.customer_phone}</a></td></tr>
            <tr><td class="lbl">Email:</td><td class="val">{enquiry.customer_email}</td></tr>
            <tr><td class="lbl">Company / Organization:</td><td class="val">{enquiry.company_name or 'N/A'}</td></tr>
            <tr><td class="lbl">City / Location:</td><td class="val">{enquiry.city or 'N/A'}</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Product & Quantity Specs</div>
          <table class="table">
            <tr><td class="lbl">Requested Award:</td><td class="val">{enquiry.product_name or 'General Portfolio'}</td></tr>
            <tr><td class="lbl">Estimated Quantity:</td><td class="val">{enquiry.quantity}</td></tr>
            <tr><td class="lbl">Needed By Date:</td><td class="val">{enquiry.required_date or 'Standard Delivery'}</td></tr>
            <tr><td class="lbl">Plate Finish:</td><td class="val">{enquiry.plate_color}</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Laser Engraving Specifications</div>
          <div class="engraving-box">
            <div><strong>Line 1:</strong> {enquiry.engraving_line1 or '—'}</div>
            <div><strong>Line 2:</strong> {enquiry.engraving_line2 or '—'}</div>
            <div><strong>Line 3:</strong> {enquiry.engraving_line3 or '—'}</div>
          </div>
          {notes_html}
        </div>

        <div class="section" style="text-align: center;">
          <a class="btn" href="https://wa.me/{clean_phone}?text=Hello%20{enquiry.customer_name}%2C%20thank%20you%20for%20your%20enquiry%20{enquiry.enquiry_number}%20at%20Shreeji%20Corporates.">
            💬 Reply to Client on WhatsApp
          </a>
        </div>

        <div class="footer">
          Auto-dispatched to Ms. Madhu Sharma (+91 87969 77707) & Shreeji Corporates Admin Team
        </div>
      </div>
    </body>
    </html>
    """

    try:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'shreejicorporates@gmail.com')
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=recipients,
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=True)
        logger.info(f"Notification email dispatched for enquiry {enquiry.enquiry_number} to {recipients}")
    except Exception as e:
        logger.warning(f"Could not send email for enquiry {enquiry.enquiry_number}: {e}")


class EnquiryListView(generics.ListCreateAPIView):
    queryset = Enquiry.objects.all()
    serializer_class = EnquirySerializer

    def perform_create(self, serializer):
        enquiry = serializer.save()
        send_enquiry_notification_email(enquiry)


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

