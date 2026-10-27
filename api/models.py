"""Tables. Kept deliberately small for a landing page:
no cart, no checkout, no user accounts — orders go through
WhatsApp and email, this backend only serves content and
records enquiries.

Product.image_url is a frontend path like
/trophies/trophy-featured.jpg, not an upload — product photos
live in the frontend's public/ folder and are pushed with git.
"""
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from database import Base


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    material = Column(String(60), nullable=False)
    category = Column(String(60), nullable=False)
    badge = Column(String(60), default="")
    image_url = Column(String(300), default="")
    created_at = Column(DateTime, server_default=func.now())


class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    role = Column(String(120), default="")
    sector = Column(String(120), default="")
    quote = Column(Text, nullable=False)
    rating = Column(Integer, default=5)
    # Public submissions start unapproved. Only approved rows are
    # shown on the site, so nothing fake or spammy appears live
    # until you approve it.
    approved = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())


class Enquiry(Base):
    __tablename__ = "enquiries"
    id = Column(Integer, primary_key=True)
    name = Column(String(120), default="")
    # Phone or email — whichever the customer gave.
    contact = Column(String(200), nullable=False)
    product_name = Column(String(120), default="")
    message = Column(Text, nullable=False)
    # Where it came from: website, whatsapp, email.
    source = Column(String(60), default="website")
    created_at = Column(DateTime, server_default=func.now())
