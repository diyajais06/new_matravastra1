"""Generate sitemap.xml, robots.txt and llms.txt into frontend/public. Usage: python scripts/generate_seo_files.py [BASE_URL]"""
import os
import sys
from datetime import date
from pathlib import Path
from dotenv import dotenv_values
from pymongo import MongoClient

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "frontend" / "public"
back = dotenv_values(ROOT / "backend" / ".env")
base = (sys.argv[1] if len(sys.argv) > 1 else dotenv_values(ROOT / "frontend" / ".env")["REACT_APP_BACKEND_URL"]).rstrip("/")
products = list(MongoClient(back["MONGO_URL"])[back["DB_NAME"]].products.find({}, {"_id": 0}))
today = date.today().isoformat()

COLLECTIONS = [
    ("kashi", "Kashi / Spiritual", "Mahadev, Ganga aarti and ghat artwork in black and antique gold."),
    ("purvanchal", "Apna Purvanchal", "Regional pride, Bhojpuri typography and folk heritage."),
    ("aspirant", "Aspirant Life", "Minimal oversized tees for students and aspirants."),
]
STATIC = [("/", "1.0", "weekly"), ("/shop", "0.9", "daily"), ("/hampers", "0.9", "weekly"), ("/about", "0.7", "monthly"),
          ("/bulk-orders", "0.7", "monthly"), ("/faq", "0.6", "monthly"), ("/contact", "0.5", "yearly"),
          ("/track-order", "0.3", "yearly"), ("/sitemap", "0.3", "monthly")]


def url(loc, pri, freq, image=None):
    img = "".join(f"<image:image><image:loc>{i}</image:loc></image:image>" for i in (image or []))
    return f"  <url><loc>{base}{loc}</loc><lastmod>{today}</lastmod><changefreq>{freq}</changefreq><priority>{pri}</priority>{img}</url>"


entries = [url(*s) for s in STATIC]
entries += [url(f"/collection/{c[0]}", "0.8", "weekly") for c in COLLECTIONS]
entries += [url(f"/product/{p['slug']}", "0.8", "weekly", [p["image_front"], p["image_back"]]) for p in products]
(PUBLIC / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
    + "\n".join(entries) + "\n</urlset>\n")

(PUBLIC / "robots.txt").write_text(f"""User-agent: *
Allow: /
Disallow: /cart
Disallow: /checkout
Disallow: /wishlist

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: {base}/sitemap.xml
""")

lines = [
    "# MATRA VASTRA",
    "",
    "> Premium culture-rooted clothing brand from Varanasi (Kashi), India. Oversized 240 GSM cotton T-shirts across three collections. Tagline: \"Wear Your Roots. Represent Your Culture.\"",
    "",
    "Key facts: based in Varanasi, Uttar Pradesh, India; prices ₹949–₹1,449; gift hampers ₹1,699–₹3,499; sizes S–XXL; free shipping over ₹999 (else ₹79); "
    "payments via Razorpay (UPI, cards, netbanking, wallets); 7-day exchange; coupon KASHI10 for 10% off; "
    "bulk/custom printing from 10 pieces; WhatsApp +91 6393707020; email hello@matravastra.com.",
    "",
    "## Pages",
    f"- [Shop All]({base}/shop): every T-shirt",
    f"- [Gift Hampers]({base}/hampers): 4 combos (T-shirt + bottle / copper jug / mug / keychain), ₹1,699–₹3,499",
    f"- [Our Story]({base}/about): the brand story, \"From the Soul of Kashi\"",
    f"- [Bulk & Custom Orders]({base}/bulk-orders): colleges, ashrams, events, corporate",
    f"- [FAQ]({base}/faq): sizes, shipping, payments, returns",
    f"- [Track Order]({base}/track-order)",
    f"- [Contact]({base}/contact)",
    "",
    "## Collections",
]
lines += [f"- [{n}]({base}/collection/{s}): {d}" for s, n, d in COLLECTIONS]
lines += ["", "## Products"]
lines += [f"- [{p['name']}]({base}/product/{p['slug']}): ₹{p['price']} · {p['collection']} · {p['tagline']}" for p in products]
(PUBLIC / "llms.txt").write_text("\n".join(lines) + "\n")
print(f"Generated for {base}: {len(entries)} sitemap URLs, {len(products)} products")
