"""Seed the database on first run. Safe to re-run: it only
inserts when the table is empty.

Products match the frontend catalogue on main exactly
(all currently use /trophies/trophy-featured.jpg, the real
photo the user supplied — change image_url here AND in the
frontend when a product gets its own photo).

Feedback seeds are the SAME 6 placeholder entries the
frontend mock used. They are marked approved so the site
keeps showing feedback after switching to the API, but
they are placeholders, not verified reviews — replace them
with real approved feedback before presenting them as real.
"""
from database import Base, SessionLocal, engine
from models import Feedback, Product

Base.metadata.create_all(bind=engine)

PRODUCTS = [
    {"name": "Championship Cup", "material": "Metal", "category": "Metal", "badge": "Bestseller", "image_url": "/trophies/championship-cup-prince.jpg"},
    {"name": "Crystal Tower", "material": "Crystal", "category": "Crystal", "badge": "", "image_url": "/trophies/crystal-tower-prince.jpg"},
    {"name": "Wooden Shield", "material": "Wood", "category": "Wood", "badge": "", "image_url": "/trophies/wooden-shield-prince.jpg"},
    {"name": "Acrylic Star", "material": "Acrylic", "category": "Acrylic", "badge": "New", "image_url": "/trophies/acrylic-star-prince.jpg"},
    {"name": "Silver Salver", "material": "Metal", "category": "Metal", "badge": "", "image_url": "/trophies/silver-salver-prince.jpeg"},
    {"name": "Crystal Globe", "material": "Crystal", "category": "Crystal", "badge": "", "image_url": "/trophies/crystal-globe-prince.jpg"},
]

# Placeholder feedback, copied from the frontend mock.
FEEDBACK = [
    {"name": "Priya S.", "role": "Event Organiser", "sector": "Event Management", "quote": "The trophies arrived exactly as we designed them, engraving and all, and on time for our event. Ordering on WhatsApp was the easiest part.", "rating": 5},
    {"name": "Rahul K.", "role": "Sports Coordinator", "sector": "Sports Association", "quote": "We needed medals for a full tournament. Quality was consistent across every piece, and the team helped us pick the right design quickly.", "rating": 5},
    {"name": "Anjali M.", "role": "Administrator", "sector": "Educational Institution", "quote": "Elegant trophies for our academic awards, with our logo engraved precisely. The students and parents both noticed the finish.", "rating": 5},
    {"name": "Vikram T.", "role": "HR Manager", "sector": "Corporate Organisation", "quote": "Employee recognition gifts that actually feel premium. Branding was clean, packaging was secure, and delivery was dependable.", "rating": 5},
    {"name": "Sana A.", "role": "Programme Lead", "sector": "Social Organisation", "quote": "Mementos for our community programme, customised to our theme. Good value, and the team listened to what we actually needed.", "rating": 5},
    {"name": "Arjun D.", "role": "Festival Coordinator", "sector": "Government Body", "quote": "Formal mementos for an official function, delivered with care and on schedule. Professional from first message to delivery.", "rating": 5},
]


def main():
    db = SessionLocal()
    if db.query(Product).count() == 0:
        db.add_all([Product(**p) for p in PRODUCTS])
        print(f"Seeded {len(PRODUCTS)} products")
    if db.query(Feedback).count() == 0:
        db.add_all([Feedback(**f, approved=True) for f in FEEDBACK])
        print(f"Seeded {len(FEEDBACK)} feedback entries (placeholders, approved)")
    db.commit()
    db.close()


if __name__ == "__main__":
    main()
