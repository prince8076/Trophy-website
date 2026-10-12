# 🏆 AuraTrophy — E-Commerce Platform for Awards & Custom Laser Engraving

A modern, full-stack trophy e-commerce and award customization platform built with **Django REST Framework** (Backend) and **React + Vite + Tailwind CSS** (Frontend).

---

## ✨ Features

- **🏆 Rich Trophy Catalog**:
  - Filter by 6 categories: *Sports & Athletics*, *Corporate & Leadership*, *Crystal & Glass Artistry*, *Championship Cups*, *Medals & Medallions*, *Plaques & Custom Acrylics*.
  - Live search by keyword, material, or category.
  - Sorting by price (low to high / high to low), customer rating, or newest arrivals.
- **✨ Interactive Laser Engraving Studio**:
  - Real-time preview on simulated **Polished Gold**, **Brushed Silver**, or **Midnight Black** metal plates with corner rivets.
  - Live typography preview with **Classic Serif**, **Modern Sans**, and **Formal Script** fonts.
  - Character limit counters and live line customization (Award Header, Recipient Name, Date/Organization).
- **🛒 Complete E-Commerce Shopping Cart & Checkout**:
  - Persistent cart with localStorage.
  - Keeps individual custom engraving details for each distinct trophy in the cart.
  - Promo discount codes (e.g. `VICTORY10` or `GOLD20`).
  - Checkout form capturing contact and delivery destination.
- **📦 Order Confirmation & Real-Time Tracking**:
  - Unique order tracking reference code generated on checkout (e.g., `TRP-B41B54FC`).
  - Concierge tracking page showing live status: *Confirmed* ➔ *In Laser Engraving* ➔ *Quality Inspection* ➔ *Shipped*.
- **⚙️ Django Administration Dashboard**:
  - Manage categories, trophies, stock, prices, featured flags, orders, and engraved plate specifications.
  - Default superuser credentials pre-configured:
    - **Username**: `admin`
    - **Password**: `admin123`

---

## 🚀 Running the Application

### 1. Backend (Django REST Framework)

```powershell
cd backend
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Run migrations (already executed)
python manage.py migrate

# (Optional) Seed sample trophies again
python manage.py seed_trophies

# Start development server on port 8000
python manage.py runserver 127.0.0.1:8000
```

- **Backend API Root**: `http://127.0.0.1:8000/api/`
- **Django Admin Panel**: `http://127.0.0.1:8000/admin/`

---

### 2. Frontend (React + Vite + Tailwind CSS)

```powershell
cd frontend
# Install dependencies (already installed)
npm install

# Start Vite dev server on port 5173
npx vite --port 5173
```

- **Frontend Application**: `http://localhost:5173/`

---

## 📁 Project Structure

```
mansi/
├── backend/
│   ├── .venv/                      # Python virtual environment
│   ├── config/                     # Django project settings & URL routing
│   │   ├── settings.py             # DRF, CORS, static & media configurations
│   │   ├── urls.py                 # API router & admin routes
│   │   └── wsgi.py
│   ├── trophies/                   # Trophy store application
│   │   ├── models.py               # Category, Product, Order, OrderItem models
│   │   ├── serializers.py          # DRF serializers
│   │   ├── views.py                # List, Detail, and Order API views
│   │   ├── urls.py                 # Endpoint URLs
│   │   ├── admin.py                # Django admin configuration
│   │   └── management/commands/
│   │       └── seed_trophies.py    # Curated trophy seed command
│   ├── db.sqlite3                  # SQLite database
│   └── manage.py
│
├── frontend/
│   ├── src/
│   │   ├── api.js                  # Centralized fetch API client
│   │   ├── context/
│   │   │   └── CartContext.jsx     # Cart state management & storage
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Header navigation & search
│   │   │   ├── Footer.jsx          # Footer & trust badges
│   │   │   ├── TrophyCard.jsx      # Product card component
│   │   │   └── EngravingCustomizer.jsx # Live interactive plate simulator
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Hero, categories, best sellers, demo
│   │   │   ├── CatalogPage.jsx     # Filtering, sorting, and full grid
│   │   │   ├── ProductDetailPage.jsx # Customizer, gallery, and cart actions
│   │   │   ├── CartPage.jsx        # Shopping bag with plate previews
│   │   │   ├── CheckoutPage.jsx    # Shipping & payment form
│   │   │   ├── OrderConfirmationPage.jsx # Order receipt & pipeline stepper
│   │   │   └── OrderTrackingPage.jsx # Look up orders by ID
│   │   ├── App.jsx                 # Routing configuration
│   │   ├── main.jsx                # React DOM entry
│   │   └── index.css               # Metallic and plate styling
│   ├── index.html
│   ├── vite.config.js              # Proxy to Django on port 8000
│   └── package.json
└── README.md
```

