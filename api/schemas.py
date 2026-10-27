"""Request/response shapes. Field max_lengths are a
security control, not just validation: before them, a 100 KB
quote or a 2 MB enquiry was accepted and stored (tested
2026-10-27). Limits are far above any real enquiry/feedback. These match the frontend's existing
data shapes exactly (see motion-studio/src/data/feedback.ts and
the catalogue product list), so swapping the frontend from its
hardcoded lists to this API needs no layout change."""
from datetime import datetime

from pydantic import BaseModel, Field


class ProductOut(BaseModel):
    id: int
    name: str
    material: str
    category: str
    badge: str = ""
    image_url: str = ""

    class Config:
        from_attributes = True


class ProductIn(BaseModel):
    name: str = Field(max_length=120)
    material: str = Field(max_length=60)
    category: str = Field(max_length=60)
    badge: str = Field(default="", max_length=60)
    image_url: str = Field(default="", max_length=300)


class FeedbackOut(BaseModel):
    id: int
    name: str
    role: str = ""
    sector: str = ""
    quote: str
    rating: int = 5
    approved: bool = False

    class Config:
        from_attributes = True


class FeedbackIn(BaseModel):
    name: str = Field(max_length=120)
    role: str = Field(default="", max_length=120)
    sector: str = Field(default="", max_length=120)
    quote: str = Field(max_length=2000)
    rating: int = Field(default=5, ge=1, le=5)


class EnquiryIn(BaseModel):
    name: str = Field(default="", max_length=120)
    contact: str = Field(max_length=200)
    product_name: str = Field(default="", max_length=120)
    message: str = Field(max_length=5000)
    source: str = Field(default="website", max_length=60)


class EnquiryOut(BaseModel):
    id: int
    name: str = ""
    contact: str
    product_name: str = ""
    message: str
    source: str = "website"
    created_at: datetime | None = None

    class Config:
        from_attributes = True
