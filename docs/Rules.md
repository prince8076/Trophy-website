# Engineering & Domain Rules: Shreeji Corporates

> **Document:** Project Rules & Development Guidelines  
> **Philosophy:** Ponytail Senior Developer Standards + B2B Domain Constraints  
> **Target Audience:** All Developers & Autonomous Agents  

---

## 1. The Ponytail Senior Developer Principles

This repository strictly enforces the **Ponytail Senior Developer Ruleset** (defined in [`AGENTS.md`](file:///c:/Users/rahul/Downloads/mansi/AGENTS.md) and [`.agents/rules/ponytail.md`](file:///c:/Users/rahul/Downloads/mansi/.agents/rules/ponytail.md)):

```text
The best code is the code never written. Solve the whole problem with the least new code.
```

1. **Before You Write:** Read the task and the code it touches. Map callers, tests, fixtures, and state. Check what your change could break. Extra features nobody asked for are strictly forbidden.
2. **The Smallest Working Change:**
   - Does it need to exist? Skip features and complexity nobody asked for.
   - Already in this codebase? Reuse existing helpers, contexts, and styles.
   - Standard library or platform feature? Prefer native platform capabilities over heavy external dependencies.
   - Can it be one line a reader gets at a glance? Keep it one line.
   - Shortest working diff wins once callers and edge cases are handled.
3. **Never Cut:** Validation at trust boundaries, data integrity, security, accessibility, and real hardware/browser compatibility.
4. **End Every Reply With:** A clear summary of what was completed, what was skipped, and any risks the user must know.

---

## 2. B2B Trophy Domain Business Rules

### Rule 1: No Public Retail Prices ("Rate bhi remove kar dena")
- **Mandate:** Real bespoke trophy houses do not publish fixed retail prices.
- **Rule:** Never render fixed currency prices (`₹ 4,850`, etc.) on public catalog cards, search palettes, or product viewports.
- **Enforcement:** All trophy cards display `BESPOKE QUOTE • Bulk Tiered • Free Proof` with an `Enquire` CTA.

### Rule 2: No Retail Shopping Cart or "Buy Now" Carts
- **Mandate:** Trophies require custom laser engraving plates, vector crest proofs, and tiered batch discounts.
- **Rule:** Never build or restore a retail cart or instant credit-card checkout.
- **Enforcement:** Every purchase-like action routes to [`RequestQuoteModal.jsx`](file:///c:/Users/rahul/Downloads/mansi/frontend/src/components/RequestQuoteModal.jsx), [`RequestQuotePage.jsx`](file:///c:/Users/rahul/Downloads/mansi/frontend/src/pages/RequestQuotePage.jsx), or WhatsApp.

### Rule 3: Official WhatsApp Helpline Is `+91 87969 77707`
- **Mandate:** All customer chat endpoints must reach the workshop direct line.
- **Rule:** The primary WhatsApp link must strictly format as `https://wa.me/918796977707?text=...`.
- **Enforcement:** Helpline display is `+91 87969 77707 / +91 92669 44393`.

### Rule 4: Mandatory Lead Notification to `madhu@shreejicorporates.com`
- **Mandate:** Every inbound quote must be dispatched immediately via email.
- **Rule:** The Django notification engine MUST include `madhu@shreejicorporates.com` and `rahulsingh00c@gmail.com` in all dispatch recipients.
- **Enforcement:** Configured in `backend/config/settings.py` under `ENQUIRY_NOTIFICATION_EMAILS`.

---

## 3. Frontend Architecture & React Rules

### Rule 5: Modals Must Use React Portals (`createPortal`)
- **Reason:** Ancestors with `backdrop-filter: blur(...)` or `transform` establish isolated CSS containing blocks. Placing fixed modals inside such containers traps them, cutting off headers.
- **Rule:** Every modal dialog MUST be rendered via:
  ```jsx
  createPortal(<AnimatePresence>...</AnimatePresence>, document.body)
  ```
- **Rule:** Outer wrapper must use `fixed inset-0 z-[9999] overflow-y-auto`. Inner wrapper must use `min-h-full flex items-center justify-center p-4 text-center` to prevent negative-coordinate scroll clipping.
- **Rule:** Dialog header must be pinned with `flex-shrink-0`, and the form body must scroll internally with `flex-1 min-h-0 overflow-y-auto`.
- **Rule:** Body scroll must be locked (`document.body.style.overflow = 'hidden'`) when modal is open.

### Rule 6: Complete Icon & Dependency Auditing
- **Reason:** Referencing an unimported Lucide icon causes a runtime `ReferenceError` that blanks the entire page.
- **Rule:** Every Lucide icon (`Crown`, `Sparkles`, `CheckCircle2`, etc.) used in JSX must be explicitly declared in the import block.

### Rule 7: Build Verification Before Git Commit
- **Rule:** Before any git commit, `npm run build` must be executed inside `frontend/` to guarantee zero syntax or bundling errors.

---

## 4. Backend & API Rules

### Rule 8: Graceful Notification Handling
- **Rule:** Email dispatch within `views.py` must use `fail_silently=True` or `try/except` wrapping so an unconfigured SMTP server never crashes the customer's quote submission.

### Rule 9: Unique Reference Numbering
- **Rule:** All enquiries must receive an auto-generated unique identifier in the format `ENQ-XXXXXXXX` upon creation.

### Rule 10: Model Migrations & Consistency
- **Rule:** Whenever modifying `models.py`, `python manage.py makemigrations` and `python manage.py migrate` must be executed immediately.
