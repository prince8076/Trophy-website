# Project Session Memory & Transformation Log

> **Document:** Memory Ledger & Decision History  
> **Repository:** `prince8076/Trophy-website`  
> **Last Synced:** October 2026  

---

## 1. Project Genesis & Initial Architecture

### Original State
The application began as an electronic commerce retail prototype with standard shopping cart paradigms:
- Fixed product retail prices (`₹ 4,850`, `₹ 3,400`, etc.)
- "Add to Bag", "Instant Checkout", and cart slide-outs
- Standard e-commerce checkout page with dummy credit card inputs
- 4 basic categories (Crystal, Wooden, Metal, Acrylic)

---

## 2. Major Directives & Pivot History

### Directive 1: The B2B Artisan Trophy Pivot
**Inspiration Sites:**
- `https://www.bensontrophy.com/` (Benson Trophy — premier custom manufacturer)
- `https://talismanindia.com/customized-trophies` (Talisman India — bespoke corporate awards)
- `https://www.trophyindia.in/` (Trophy India — catalog & inquiry model)

**User Instructions:**
> *"rate bhi remove kar dena"* (Remove all rates/prices)  
> *"remove purchase option because he can send his deatils"*  
> *"add all the catory"*  
> *"add review section as well"*  

**Changes Executed:**
1. **Complete Price Elimination:**
   - Stripped all currency figures (`₹`) and rate sorting (`Price: Low to High`) from catalog cards, search palettes, product pages, and hero banners.
   - Replaced with **`BESPOKE QUOTE • Bulk Tiered • Free Proof`** badges.
2. **Eliminated Cart / Retail Checkout:**
   - Deprecated shopping cart actions.
   - Built [`RequestQuoteModal.jsx`](file:///c:/Users/rahul/Downloads/mansi/frontend/src/components/RequestQuoteModal.jsx) and [`RequestQuotePage.jsx`](file:///c:/Users/rahul/Downloads/mansi/frontend/src/pages/RequestQuotePage.jsx) allowing clients to send their name, corporate credentials, required date, and 3-line laser plate engraving text.
   - Routed `/cart` and `/checkout` to the custom quote submission page.
3. **11 Industry Categories Populated:**
   - `customized-bespoke` (Customized & Bespoke Awards)
   - `crystal-glass` (Crystal & Glass Trophies)
   - `wooden-trophies` (Wooden Trophies & Plaques)
   - `metal-brass` (Metal & Brass Trophies)
   - `acrylic-plaques` (Acrylic Awards & Plaques)
   - `sports-championship` (Sports & Championship Cups)
   - `corporate-leadership` (Corporate & Leadership Awards)
   - `milestone-honors` (Milestone & Service Honors)
   - `medals-lanyards` (Medals, Coins & Lanyards)
   - `mementos-souvenirs` (Mementos, Shields & Souvenirs)
   - `resin-3d-sculptures` (Resin & 3D Figurines)
4. **Corporate Client Review System ("Wall of Trust"):**
   - Created `Review` model in Django backend.
   - Seeded 6 verified corporate reviews (*Tata Consultancy Services*, *Delhi University Convocations*, *Armed Forces Officers Club*, *HDFC Bank*, *Rotary International*, *All-India Corporate Invitational*).
   - Built [`ReviewSection.jsx`](file:///c:/Users/rahul/Downloads/mansi/frontend/src/components/ReviewSection.jsx) with category tabs and an interactive "Write A Client Review" modal.

---

### Directive 2: Quote Modal Viewport Clipping Bugfix
**Reported Issue:**
When clicking "Request Quote" in the top navbar, the modal header, close button, and top input fields were cut off above the viewport.

**Root Causes Diagnosed:**
1. **Stacking Context & Containing Block Trap:**
   `<header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl ...">` contains `backdrop-blur-xl`. In modern browser CSS, `backdrop-filter` creates a new containing block for all children, confining `position: fixed` elements to the header rather than the viewport.
2. **Flexbox Centering Negative-Scroll Clipping:**
   Using `flex items-center justify-center` on an `overflow-y-auto` container caused tall modals to position their top in negative coordinates (`top < 0`). Browsers cannot scroll upwards into negative coordinates.

**Solution Applied:**
- Mounted modal into `document.body` via `createPortal`.
- Redesigned dialog architecture: pinned header (`flex-shrink-0`) and scrollable interior form (`flex-1 min-h-0 overflow-y-auto`).
- Added body scroll lock (`document.body.style.overflow = 'hidden'`) and `Escape` key listener.
- Applied identical portal architecture to `CommandPalette` and `ReviewSection`.

---

### Directive 3: Contact Updating & Email Notification Engine
**User Instructions:**
> *"now change the whatsapp no where i get the all enquires details 8796977707 and i get the email as well in my mail id we have another mail as well madhu@shreejicorporates.com add that as well i should recived inqurires here as well"*

**Changes Executed:**
1. **WhatsApp Contact Updated:**
   - Switched all WhatsApp direct endpoints and display links from `9266944393` to **`8796977707`** (`https://wa.me/918796977707`).
   - Updated across `RequestQuoteModal`, `ProductDetailPage`, `RequestQuotePage`, `Navbar`, and `Footer`.
2. **Django Multi-Recipient Email Notification System:**
   - Configured `backend/config/settings.py` with SMTP and fallback console backend.
   - Created `send_enquiry_notification_email(enquiry)` in `backend/trophies/views.py`.
   - Sends both plain text and rich HTML emails to:
     - `madhu@shreejicorporates.com`
     - `rahulsingh00c@gmail.com`
     - `shreejicorporates@gmail.com`
     - `shreejicorporatesadmin@gmail.com`
   - Verified via end-to-end test dispatch.

---

### Directive 4: Installed Ponytail Senior Developer Mode
**Repository:** `https://github.com/dietrichgebert/ponytail`

**Installed Artifacts:**
- Installed 6 agent skills in [`.agents/skills/`](file:///c:/Users/rahul/Downloads/mansi/.agents/skills): `ponytail`, `ponytail-review`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help`.
- Added always-on rule in [`.agents/rules/ponytail.md`](file:///c:/Users/rahul/Downloads/mansi/.agents/rules/ponytail.md).
- Placed [`AGENTS.md`](file:///c:/Users/rahul/Downloads/mansi/AGENTS.md) in repository root for senior-engineer paired programming standards.

---

### Directive 5: Blank Screen on Client Enquiries Tab
**Reported Issue:**
Clicking "Client Enquiries" tab inside the Admin Studio resulted in an unhandled crash (black page).

**Root Cause:**
`ReferenceError: Crown is not defined` inside `AdminPanelPage.jsx` on line 1158 (`<Crown className="w-3.5 h-3.5" />`). The `Crown` icon was used in JSX but omitted from the `lucide-react` import statement.

**Solution:**
Imported `Crown` in `AdminPanelPage.jsx`. Tested with Playwright headless browser and verified zero console or page errors.

---

## 3. Persistent System Context
- **Active Git Remote:** `git@github.com:prince8076/Trophy-website.git` on branch `main`.
- **Backend Host:** `http://127.0.0.1:8000/` (Django REST Framework).
- **Frontend Host:** `http://localhost:5173/` (Vite + React 19).
- **Manufacturing Studio Lead:** Ms. Madhu Sharma (`madhu@shreejicorporates.com`, `+91 87969 77707`).
