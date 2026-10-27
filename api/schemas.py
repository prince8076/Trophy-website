"""Request/response shapes. These match the frontend's existing
data shapes exactly (see motion-studio/src/data/feedback.ts and
the catalogue product list), so swapping the frontend from its
hardcoded lists to this API needs no layout change."""
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
    name: str
    material: str
    category: str
    badge: str = ""
    image_url: str = ""


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
    name: str
    role: str = ""
    sector: str = ""
    quote: str
    rating: int = Field(default=5, ge=1, le=5)


class EnquiryIn(BaseModel):
    name: str = ""
    contact: str
    product_name: str = ""
    message: str
    source: str = "website"


class EnquiryOut(BaseModel):
    id: int
    name: str = ""
    contact: str
    product_name: str = ""
    message: str
    source: str = "website"

    class Config:
        from_attributes = True
