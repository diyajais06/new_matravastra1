# MATRA VASTRA — PRD

## Original Problem
Premium cinematic 3D luxury e-commerce site for MATRA VASTRA (Kashi/Varanasi-inspired clothing). Full brief: /app/memory/product/requirements.md. Tagline: "WEAR YOUR ROOTS. REPRESENT YOUR CULTURE."

## Architecture
- Backend: FastAPI + MongoDB (products seeded on startup, orders, bulk_enquiries, contact_messages). Razorpay SDK; demo mode when RAZORPAY_KEY_ID/SECRET are absent.
- Frontend: React + R3F/three (background Kashi scene, 3D tee viewer), framer-motion, sonner. Cart and wishlist are kept in localStorage.
- Client logo: /frontend/public/assets/logo.jpeg (navbar, hero, footer, about).

## Implemented (2026-11-03)
- Cinematic 3D background: ghats, temple shikharas, Ganga shader water, gold particles, silk ribbons, floating tees, mouse/scroll parallax, WebGL fallback.
- 3D metallic typography in Cinzel, Cormorant italic and Devanagari.
- Pages: Home, Shop (filter/sort), 3 collection pages, Product detail (3D/front/back, sizes, Add to Bag, Buy Now), About, Bulk orders (form + WhatsApp), Contact, Cart, Checkout (KASHI10 coupon, Razorpay/demo), Order success, Track order, Wishlist.
- 9 AI-generated products with front and back mockups. WhatsApp float button (+91 6393707020). Mobile nav.
- Fixed: "destroy is not a function" (useEffect returned the result of scrollTo), mirrored back print, quick-add on touch screens, mobile horizontal overflow, verify idempotency.

## Round 2 (2026-11-03)
- Added 9 new AI-generated tees (is_new), 18 total, 6 per collection.
- Cinematic logo intro: loom threads weave the original logo together, once per session, with a skip button. The logo is never distorted.
- Animated logo (shine sweep, hover tilt, pulsing ring) in navbar, hero and footer.
- Home: New Drops rail with arrows, craft strip, NEW badges. Shop has a "New Drops" filter (/shop?new=1).
- Fixed: hero headline words disappeared while animating. Each word now has its own gold fill.

## Round 3 (2026-11-10): SEO + AEO + Sitemap
- Seo component (title, description, canonical, robots, OG, Twitter) on every page; cart, checkout and wishlist are noindex.
- JSON-LD: ClothingStore, WebSite, Product (offers, shipping, returns), ItemList, BreadcrumbList, FAQPage, Service, AboutPage, ContactPage.
- /faq page (12 Q&As) and a home FAQ section; HTML /sitemap page; product breadcrumb; one h1 per page.
- public/sitemap.xml (29 URLs), robots.txt (AI bots allowed), llms.txt, and a static fallback for crawlers without JS in index.html.
- scripts/generate_seo_files.py regenerates the 3 files from the DB. It was NOT run: bash was blocked, so the files were written by hand for the preview domain.

## Backlog
- P0: Add the real Razorpay keys (live payments)
- P1: Admin panel for orders/enquiries and status updates (printing/shipped), email/SMS notifications, real product photos
- P2: Size guide modal, pincode checker, shadcn Select for sort, EmailStr validation, newsletter
