"""Shreeji Corporates backend — FastAPI, landing-page size.

Run it:
  cd api
  pip install -r requirements.txt
  python seed.py          # first run only, fills products + placeholder feedback
  uvicorn main:app --reload --port 8000

Frontend: set VITE_API_URL=http://localhost:8000 in the frontend
(or leave it unset — the frontend falls back to its hardcoded
sample catalogue and mock feedback when this API is not running,
so the site never breaks because the backend is down).

Docs: http://localhost:8000/docs

Admin: write operations (add product, approve/delete feedback,
list enquiries) need header X-Admin-Key matching the ADMIN_KEY
env var. If ADMIN_KEY is not set, those endpoints return 503 —
there is deliberately no default key in this code.
"""
import os
import secrets

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Enquiry, Feedback, Product
from schemas import EnquiryIn, EnquiryOut, FeedbackIn, FeedbackOut, ProductIn, ProductOut

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Shreeji Corporates API")

origins = [o.strip() for o in os.environ.get(
    "FRONTEND_ORIGINS",
    "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173",
).split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)


def require_admin(x_admin_key: str | None = Header(default=None)):
    expected = os.environ.get("ADMIN_KEY")
    if not expected:
        raise HTTPException(status_code=503, detail="Admin key not configured (set ADMIN_KEY)")
    if not x_admin_key or not secrets.compare_digest(x_admin_key, expected):
        raise HTTPException(status_code=401, detail="Invalid admin key")
    return True


@app.get("/health")
def health():
    return {"status": "ok"}


# --- Products -------------------------------------------------

@app.get("/api/products", response_model=list[ProductOut])
def list_products(material: str | None = None, category: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Product)
    if material:
        q = q.filter(Product.material == material)
    if category:
        q = q.filter(Product.category == category)
    return q.order_by(Product.id).all()


@app.get("/api/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).get(product_id)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p


@app.post("/api/products", response_model=ProductOut, status_code=201)
def create_product(data: ProductIn, db: Session = Depends(get_db), _admin: bool = Depends(require_admin)):
    p = Product(**data.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@app.delete("/api/products/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db), _admin: bool = Depends(require_admin)):
    p = db.query(Product).get(product_id)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(p)
    db.commit()
    return None


# --- Feedback -------------------------------------------------
# Public list shows approved rows only. With an admin key and
# ?include_unapproved=true, it also shows pending submissions
# waiting for approval.

@app.get("/api/feedback", response_model=list[FeedbackOut])
def list_feedback(include_unapproved: bool = False, db: Session = Depends(get_db),
                 x_admin_key: str | None = Header(default=None)):
    q = db.query(Feedback)
    if include_unapproved:
        require_admin(x_admin_key)
    else:
        q = q.filter(Feedback.approved.is_(True))
    return q.order_by(Feedback.id).all()


@app.post("/api/feedback", response_model=FeedbackOut, status_code=201)
def submit_feedback(data: FeedbackIn, db: Session = Depends(get_db)):
    # Starts unapproved on purpose — see models.Feedback.
    f = Feedback(**data.model_dump(), approved=False)
    db.add(f)
    db.commit()
    db.refresh(f)
    return f


@app.post("/api/feedback/{feedback_id}/approve", response_model=FeedbackOut)
def approve_feedback(feedback_id: int, db: Session = Depends(get_db), _admin: bool = Depends(require_admin)):
    f = db.query(Feedback).get(feedback_id)
    if not f:
        raise HTTPException(status_code=404, detail="Feedback not found")
    f.approved = True
    db.commit()
    db.refresh(f)
    return f


@app.delete("/api/feedback/{feedback_id}", status_code=204)
def delete_feedback(feedback_id: int, db: Session = Depends(get_db), _admin: bool = Depends(require_admin)):
    f = db.query(Feedback).get(feedback_id)
    if not f:
        raise HTTPException(status_code=404, detail="Feedback not found")
    db.delete(f)
    db.commit()
    return None


# --- Enquiries ------------------------------------------------
# A record of "someone asked about a product". This does NOT
# send WhatsApp or email — ordering on this landing page still
# goes through WhatsApp/email links on the frontend. This just
# gives you a list to follow up from.

@app.post("/api/enquiries", response_model=EnquiryOut, status_code=201)
def create_enquiry(data: EnquiryIn, db: Session = Depends(get_db)):
    e = Enquiry(**data.model_dump())
    db.add(e)
    db.commit()
    db.refresh(e)
    return e


@app.get("/api/enquiries", response_model=list[EnquiryOut])
def list_enquiries(db: Session = Depends(get_db), _admin: bool = Depends(require_admin)):
    return db.query(Enquiry).order_by(Enquiry.id.desc()).all()
