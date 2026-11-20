from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing import List, Optional, Annotated
from datetime import datetime, timezone
from pathlib import Path
import os
import logging
import random
import string
import hmac
import hashlib
import razorpay
import io
import zipfile
from fastapi import Response
from starlette.concurrency import run_in_threadpool

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

app = FastAPI()
api = APIRouter(prefix="/api")
logger = logging.getLogger("matravastra")
logging.basicConfig(level=logging.INFO)

PyObjectId = Annotated[str, BeforeValidator(str)]
IMG = "https://static.prod-images.emergentagent.com/jobs/678a8bfa-0a7f-4579-b665-a2c1d7027eda/images/"


def rzp_keys():
    return os.environ.get("RAZORPAY_KEY_ID"), os.environ.get("RAZORPAY_KEY_SECRET")


def now_iso():
    return datetime.now(timezone.utc).isoformat()


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")
    id: Optional[PyObjectId] = Field(default=None, validation_alias="_id")

    @classmethod
    def from_mongo(cls, doc):
        return cls.model_validate(doc) if doc else None

    def to_mongo(self):
        data = self.model_dump(by_alias=True, exclude={"id"})
        data.pop("_id", None)
        return data


class Product(BaseDocument):
    slug: str
    name: str
    collection: str
    price: int
    mrp: int
    tagline: str
    description: str
    colors: List[dict]
    sizes: List[str] = ["S", "M", "L", "XL", "XXL"]
    image_front: str
    image_back: str
    fabric: str = "240 GSM Premium Combed Cotton, Oversized Fit"
    featured: bool = False
    is_new: bool = False


class CartItem(BaseModel):
    slug: str
    size: str
    color: str
    qty: int = Field(ge=1, le=50)


class Customer(BaseModel):
    name: str = Field(min_length=2)
    phone: str = Field(min_length=10)
    email: str
    address: str = Field(min_length=5)
    city: str
    state: str
    pincode: str = Field(min_length=6, max_length=6)


class OrderCreate(BaseModel):
    items: List[CartItem] = Field(min_length=1)
    customer: Customer
    coupon: Optional[str] = None


class Order(BaseDocument):
    order_number: str
    items: List[dict]
    customer: dict
    subtotal: int
    discount: int
    shipping: int
    total: int
    coupon: Optional[str] = None
    status: str = "pending_payment"
    payment_mode: str
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    timeline: List[dict] = []
    created_at: str


class VerifyPayment(BaseModel):
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    demo: bool = False


class BulkEnquiry(BaseDocument):
    name: str = Field(min_length=2)
    phone: str = Field(min_length=10)
    organization: str
    category: str = "Custom T-Shirt Printing"
    quantity: int = Field(ge=10)
    details: str
    created_at: str = Field(default_factory=now_iso)


class ContactMessage(BaseDocument):
    name: str = Field(min_length=2)
    email: str
    phone: Optional[str] = ""
    message: str = Field(min_length=5)
    created_at: str = Field(default_factory=now_iso)


def P(slug, name, col, price, tagline, desc, colors, img, featured=False, is_new=False):
    return Product(slug=slug, name=name, collection=col, price=price, mrp=price + 400, tagline=tagline,
                   description=desc, colors=colors, image_front=IMG + img[0] + ".jpeg",
                   image_back=IMG + img[1] + ".jpeg", featured=featured, is_new=is_new)


SEED = [
    P("mahadev-gold-oversized", "Mahadev Gold Oversized", "kashi", 1299, "Har Har Mahadev in antique gold",
      "A deep matte black oversized tee carrying the calm of Mahadev in hand-drawn antique gold linework. The back holds the Vishwanath shikhara with Devanagari script.",
      [{"name": "Matte Black", "hex": "#111111"}],
      ("5376e08d61011d5eb477376f8b37f34eb40cc361cd23b3830f2a58a71b83cf91", "a3f2c1620098daf111f5392113fc4f35c7e4adbce8280d5712faa450f1799135"), True),
    P("banaras-ghats-ivory", "Banaras Ghats Ivory", "kashi", 1199, "The eternal city, etched in ink",
      "Warm ivory canvas with the ghats of Banaras. Back print: KASHI — The Eternal City, with boats resting along the steps.",
      [{"name": "Warm Ivory", "hex": "#EFE6D2"}],
      ("2ddd3ee502cf8085e291ae46bbfafbf3ee579e6e9c6b1092550628104a4cfc7b", "95074db37ff6d930df96f2848fd044153ad7ecda6827cd8de618e66b74422c65"), True),
    P("har-har-gange-maroon", "Har Har Gange Maroon", "kashi", 1249, "Ganga aarti in champagne gold",
      "Deep maroon heavyweight tee with flowing Ganga waves and aarti diyas. A tribute to every evening on Dashashwamedh Ghat.",
      [{"name": "Deep Maroon", "hex": "#5A1A1E"}],
      ("987a810d666e480206a04f2b33487d72068ae46fd53a1e3f80273209b597e1b3", "183dc9f15ae7fe7aa9fecb2ade7bd87a259ffb60e5312a03a540a80ee00208de")),
    P("apna-purvanchal-terracotta", "Apna Purvanchal Terracotta", "purvanchal", 1099, "Pride of the east, worn loud",
      "Earthy terracotta tee with bold APNA PURVANCHAL typography framed by folk borders. Back: Purvanchal Pride map motif.",
      [{"name": "Terracotta", "hex": "#9A5236"}],
      ("7015849c87df34bce2b9b6e552dff46683881488859d30311437b3ac20cab526", "df2fb8749c080a7abb4abc7d6d5e3b46f0c340dda272317e785c5ca004f3f141"), True),
    P("bhojpuri-boli-olive", "Bhojpuri Boli Olive", "purvanchal", 1049, "Boli hamar pehchan",
      "Olive heavyweight tee with Devanagari Bhojpuri typography and a mustard folk mandala on the back.",
      [{"name": "Olive", "hex": "#55593A"}],
      ("597f12d970f4c671e011e21353f98d8daa0c368cc4ac5396352d883d2fa22c9c", "0845c1a428100909cbea4f3a5963d90413170e2ed00f46c17a7bcf5e072fdfee")),
    P("mitti-se-jude-charcoal", "Mitti Se Jude Charcoal", "purvanchal", 1099, "Rooted in the soil we came from",
      "Charcoal tee with a vintage MITTI SE JUDE badge; the back carries village fields, bullock cart and the rising sun.",
      [{"name": "Charcoal", "hex": "#26262A"}],
      ("e9e0fa3e7f0a2653924b3b7bd8a63dcc9dc5ed9303f76cda991a077853382e3a", "93414651d955f556d1dd69d318a7446142405ae4f1459ebc59ea5f2f4d0c5480")),
    P("silent-grind-white", "Silent Grind White", "aspirant", 999, "Work in silence. Let results speak.",
      "Clean white oversized tee for the late-night scholar. Minimal chest mark, bold back statement.",
      [{"name": "Pure White", "hex": "#F4F4F2"}],
      ("c2b590b6d75162e9e1aaa857afb7f3da7afa2c2362aa7fc51249c424b323da58", "896ef61f7ec6604bdb76a4c5f636b19f7132705f17a0f6dd7a09cdf7ebb0486e"), True),
    P("selection-loading-black", "Selection Loading Black", "aspirant", 1049, "Dream. Study. Achieve.",
      "Black oversized tee with a champagne-gold 'Selection Loading...' progress bar. For every aspirant in the Lanka lanes.",
      [{"name": "Matte Black", "hex": "#111111"}],
      ("cfbc437e973f45f7c05bde1fba589435e75619714ca0c4c6e63300d5c18bd5ba", "793c666de5d32fb054a9d757d6bf544b57530b766bbf4490da23ee99a35f3070")),
    P("padhai-repeat-slate", "Padhai Repeat Slate", "aspirant", 999, "One more chapter.",
      "Slate grey oversized tee — PADHAI. REPEAT. on the chest, ONE MORE CHAPTER on the back.",
      [{"name": "Slate Grey", "hex": "#5E6B78"}],
      ("83a9a0d151eff4ebbc360631095121061de821449e60667404e163f2b747d0eb", "42531c9e9c604d9698b431006c2e0cc9e12ea0811ab9868e80bf8436a4d0ecdc")),
    P("damru-naad-black", "Damru Naad Black", "kashi", 1349, "The first sound of the universe",
      "Matte black tee with a gold damru and sound waves on the chest. The back carries the crescent moon over the Kashi skyline with Devanagari 'Damru Naad'.",
      [{"name": "Matte Black", "hex": "#111111"}],
      ("61d62b35ea5e7d67afb039108a28ffe396434fedcaed2896399cdf0f87048de8", "eb03dc5afd61bb34dcbf6c9cc88181fc2453372bc7abaa9d9f09d98ffb58c506"), is_new=True),
    P("dashashwamedh-aarti-charcoal", "Dashashwamedh Aarti Charcoal", "kashi", 1299, "Every evening, a festival of fire",
      "Charcoal tee with a multi-tier aarti lamp in gold and saffron. The back shows priests performing the Ganga aarti on the ghat steps.",
      [{"name": "Charcoal", "hex": "#3A3A3E"}],
      ("a0afec376363fbe828d080c6b7eb87538dbb8f853179525276a23738cf4eb790", "a31b51b6d723d8dab0b63b6d79d9d4875c23ab1dbc68dc1d4d61fc3f813272f6"), is_new=True),
    P("kaal-bhairav-black", "Kaal Bhairav Black", "kashi", 1399, "Kotwal of Kashi",
      "Jet black tee with a maroon and gold trishul emblem. The back carries a fierce Bhairav-inspired mask and the words 'Kotwal of Kashi'.",
      [{"name": "Jet Black", "hex": "#0B0B0B"}],
      ("a56d02ad37b4f5c45de6124a43ab2731c91a6a72729ed19d654bbe6e46474580", "b5284e9fd737c358eccf9f57c42913113db1de3359dfe593a7a6f95e40e16119"), True, True),
    P("litti-chokha-club-mustard", "Litti Chokha Club Mustard", "purvanchal", 999, "Swaad Purvanchal ka",
      "Mustard tee with a retro Litti Chokha Club badge. The back reads 'Swaad Purvanchal Ka' with an illustrated clay chulha.",
      [{"name": "Mustard", "hex": "#D9A21B"}],
      ("f39d71c5ebf41007d75b579577c15bf8da37504d5542c922f69c997c878f5c91", "0f91204f81e5a6d57570959bfcf4abe0795904a32540adba3d9f5991f02f4671"), is_new=True),
    P("chhath-mahaparv-orange", "Chhath Mahaparv Orange", "purvanchal", 1149, "Arghya to the rising sun",
      "Burnt orange tee with a sunrise over the river and devotees offering arghya. The back shows soop baskets, sugarcane and Devanagari 'Chhath Mahaparv'.",
      [{"name": "Burnt Orange", "hex": "#C0552B"}],
      ("77153485ffefe57be0e090c1992e1cc9f64cef504dd24da71de3003e99fce9f7", "52c0cfe7db55bf13aac2cd05c51fa828bfda1b0652e8edbf0acbf4bd2a45438e"), True, True),
    P("gaon-wala-swag-green", "Gaon Wala Swag Green", "purvanchal", 1049, "Mitti ki khushboo",
      "Forest green tee with bold 'Gaon Wala Swag' type. The back shows a folk-art village of mango trees, a well and huts.",
      [{"name": "Forest Green", "hex": "#1F5130"}],
      ("7fa88bc4a45076ab2cca99dbc037b0c4201accc5abef6dd33509bcdfcb969e9b", "c9c7ef1a4aba0959b749ed315822852fd99419cc9a852742881388631f3ee9fa"), is_new=True),
    P("mains-mode-on-navy", "Mains Mode On Navy", "aspirant", 1049, "Prelims. Mains. Interview.",
      "Navy oversized tee with a minimal 'Mains Mode: On' toggle. The back lists the full journey with check marks.",
      [{"name": "Navy", "hex": "#1C2742"}],
      ("396dfde1cce28ffe219f6950c05119c4ec52ffdf4b2cb57d09884d706381ddd5", "c2127eecac49dc01f3ad5912f360851bd8a298a6bb3399589333a688c6b10c94"), is_new=True),
    P("lanka-library-sand", "Lanka Library Sand", "aspirant", 999, "Silence is the loudest preparation",
      "Sand beige tee with line art of stacked books and a desk lamp, for every BHU and Lanka library regular.",
      [{"name": "Sand Beige", "hex": "#D8CCB4"}],
      ("b9a64ff01e607553d1332461c7cd6fa6097430f70e411d07c4258ecaa1df0352", "7b9ca12b6d0c054c78ccea0935a434795c490a04ee0db20c5f2b3f099b12eb0d"), True, True),
    P("chai-and-chapters-brown", "Chai & Chapters Brown", "aspirant", 999, "One more cup. One more chapter.",
      "Coffee brown tee with a steaming kulhad on the chest, fuel for the late-night study sessions.",
      [{"name": "Coffee Brown", "hex": "#4A3022"}],
]


class Hamper(BaseDocument):
    slug: str
    name: str
    tagline: str
    description: str
    price: int
    mrp: int
    image: str
    items: List[str]
    tees: int = 1
    sizes: List[str] = ["S", "M", "L", "XL", "XXL"]
    badge: Optional[str] = None


HAMPERS = [
    Hamper(slug="kashi-starter-combo", name="Kashi Starter Combo", tagline="Your first step into Kashi",
           description="The essentials of devotion, packed in a black and gold gift box.", price=1699, mrp=2199,
           image=IMG + "af5a5b4b07f85b30721a251ddf67da2951a9a11a6c736eefd3411c7afa51d69c.jpeg",
           items=["Mahadev Gold Oversized T-Shirt", "Matte Black Steel Water Bottle (750ml)", "Gold Trishul Metal Keychain", "Black & Gold Gift Box"]),
    Hamper(slug="aspirant-study-kit", name="Aspirant Study Kit", tagline="Fuel for the long nights",
           description="Everything for the late-night scholar, from desk to library.", price=1999, mrp=2599,
           image=IMG + "5ecc396a3a192e704b89f2433d850e6ee1d37fe77ac49324787de6f518174a55.jpeg",
           items=["Silent Grind White T-Shirt", "Insulated Water Bottle (1L)", "'Chai & Chapters' Ceramic Mug", "Ruled Notebook + Pen", "Book Keychain"]),
    Hamper(slug="ganga-aarti-gift-hamper", name="Ganga Aarti Gift Hamper", tagline="A gift wrapped in Banaras",
           description="A festive maroon hamper with copper, brass and Banarasi silk.", price=2499, mrp=3199, badge="Bestseller",
           image=IMG + "53cb738246a681e6f1f20bb496e60a516141c170996c07d242ace4a8df64894e.jpeg",
           items=["Har Har Gange Maroon T-Shirt", "Hammered Copper Water Jug (1.5L)", "Brass Diya Keychain", "Banarasi Silk Potli Pouch", "Maroon Gift Box"]),
    Hamper(slug="purvanchal-royal-hamper", name="Purvanchal Royal Hamper", tagline="The grand gift of the east", tees=2,
           description="Our biggest hamper: two tees, copper and traditional gamchha in a wooden crate.", price=3499, mrp=4599, badge="Best Value",
           image=IMG + "c63018c8180675904af805d23647c64e26124898e0511c5db95483cac2bd7c2e.jpeg",
           items=["Apna Purvanchal Terracotta T-Shirt", "Gaon Wala Swag Green T-Shirt", "Copper Jug + 2 Copper Tumblers", "Steel Water Bottle (750ml)", "Traditional Gamchha", "Brass Keychain", "Wooden Gift Crate"]),
]


@app.on_event("startup")
async def seed():
    for p in SEED:
        await db.products.update_one({"slug": p.slug}, {"$set": p.to_mongo()}, upsert=True)
    for h in HAMPERS:
        await db.hampers.update_one({"slug": h.slug}, {"$set": h.to_mongo()}, upsert=True)
    await db.orders.create_index("order_number", unique=True)


@api.get("/hampers", response_model=List[Hamper])
async def list_hampers():
    docs = await db.hampers.find().sort("price", 1).to_list(50)
    return [Hamper.from_mongo(d) for d in docs]


ZIP_SKIP_DIRS = {"node_modules", ".git", "build", "__pycache__", ".emergent", "test_reports", ".venv", "venv", ".cache", ".pytest_cache"}


def build_source_zip() -> bytes:
    app_root = ROOT_DIR.parent
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for folder in ("backend", "frontend", "scripts", "memory"):
            for dirpath, dirnames, filenames in os.walk(app_root / folder):
                dirnames[:] = [d for d in dirnames if d not in ZIP_SKIP_DIRS]
                for f in filenames:
                    if f.startswith(".env") or f.endswith((".pyc", ".log")):
                        continue
                    full = Path(dirpath) / f
                    zf.write(full, Path("matravastra") / full.relative_to(app_root))
        zf.writestr("matravastra/backend/.env.example", "MONGO_URL=\nDB_NAME=\nCORS_ORIGINS=*\nRAZORPAY_KEY_ID=\nRAZORPAY_KEY_SECRET=\n")
        zf.writestr("matravastra/frontend/.env.example", "REACT_APP_BACKEND_URL=\n")
    return buf.getvalue()


@api.get("/download/source")
async def download_source():
    data = await run_in_threadpool(build_source_zip)
    return Response(data, media_type="application/zip",
                    headers={"Content-Disposition": 'attachment; filename="matravastra-source-code.zip"'})


@api.get("/")
async def root():
    return {"message": "MATRA VASTRA API"}


@api.get("/products", response_model=List[Product])
async def list_products(collection: Optional[str] = None, featured: Optional[bool] = None, is_new: Optional[bool] = None):
    q = {}
    if collection:
        q["collection"] = collection
    if featured is not None:
        q["featured"] = featured
    if is_new is not None:
        q["is_new"] = is_new
    docs = await db.products.find(q).to_list(200)
    return [Product.from_mongo(d) for d in docs]


@api.get("/products/{slug}", response_model=Product)
async def get_product(slug: str):
    doc = await db.products.find_one({"slug": slug})
    if not doc:
        raise HTTPException(404, "Product not found")
    return Product.from_mongo(doc)


@api.get("/payment/config")
async def payment_config():
    key_id, secret = rzp_keys()
    return {"demo": not (key_id and secret), "key_id": key_id if key_id and secret else None}


def compute_totals(subtotal: int, coupon: Optional[str]):
    discount = round(subtotal * 0.10) if coupon and coupon.upper() == "KASHI10" else 0
    shipping = 0 if subtotal - discount >= 999 else 79
    return discount, shipping, subtotal - discount + shipping


@api.post("/orders")
async def create_order(payload: OrderCreate):
    items, subtotal = [], 0
    for it in payload.items:
        doc = await db.products.find_one({"slug": it.slug}) or await db.hampers.find_one({"slug": it.slug})
        if not doc:
            raise HTTPException(400, f"Unknown product {it.slug}")
        if it.size not in doc["sizes"]:
            raise HTTPException(400, "Invalid size")
        subtotal += doc["price"] * it.qty
        items.append({**it.model_dump(), "name": doc["name"], "price": doc["price"], "image": doc.get("image_front") or doc["image"]})
    discount, shipping, total = compute_totals(subtotal, payload.coupon)
    order_number = "MV" + "".join(random.choices(string.digits, k=8))
    key_id, secret = rzp_keys()
    order = Order(order_number=order_number, items=items, customer=payload.customer.model_dump(),
                  subtotal=subtotal, discount=discount, shipping=shipping, total=total,
                  coupon=payload.coupon.upper() if discount else None,
                  payment_mode="razorpay" if key_id and secret else "demo", created_at=now_iso(),
                  timeline=[{"status": "pending_payment", "at": now_iso()}])
    if order.payment_mode == "razorpay":
        rz = razorpay.Client(auth=(key_id, secret)).order.create(
            {"amount": total * 100, "currency": "INR", "receipt": order_number, "payment_capture": 1})
        order.razorpay_order_id = rz["id"]
    await db.orders.insert_one(order.to_mongo())
    return {"order_number": order_number, "total": total, "amount_paise": total * 100,
            "payment_mode": order.payment_mode, "razorpay_order_id": order.razorpay_order_id,
            "key_id": key_id if order.payment_mode == "razorpay" else None}


@api.post("/orders/{order_number}/verify")
async def verify_payment(order_number: str, body: VerifyPayment):
    doc = await db.orders.find_one({"order_number": order_number})
    if not doc:
        raise HTTPException(404, "Order not found")
    order = Order.from_mongo(doc)
    if order.status != "pending_payment":
        return {"order_number": order_number, "status": order.status, "payment_id": order.razorpay_payment_id}
    if order.payment_mode == "razorpay":
        _, secret = rzp_keys()
        msg = f"{order.razorpay_order_id}|{body.razorpay_payment_id}".encode()
        expected = hmac.new(secret.encode(), msg, hashlib.sha256).hexdigest()
        if not body.razorpay_signature or not hmac.compare_digest(expected, body.razorpay_signature):
            raise HTTPException(400, "Payment verification failed")
        payment_id = body.razorpay_payment_id
    else:
        if not body.demo:
            raise HTTPException(400, "Demo confirmation required")
        payment_id = "demo_" + "".join(random.choices(string.ascii_lowercase + string.digits, k=12))
    await db.orders.update_one({"order_number": order_number}, {
        "$set": {"status": "confirmed", "razorpay_payment_id": payment_id},
        "$push": {"timeline": {"status": "confirmed", "at": now_iso()}}})
    return {"order_number": order_number, "status": "confirmed", "payment_id": payment_id}


@api.get("/orders/track")
async def track_order(order_number: str = Query(...), phone: str = Query(...)):
    doc = await db.orders.find_one({"order_number": order_number.strip().upper(), "customer.phone": phone.strip()})
    if not doc:
        raise HTTPException(404, "No order found for these details")
    o = Order.from_mongo(doc)
    return {"order_number": o.order_number, "status": o.status, "total": o.total, "items": o.items,
            "created_at": o.created_at, "timeline": o.timeline, "city": o.customer.get("city"),
            "payment_mode": o.payment_mode}


@api.post("/bulk-enquiries")
async def bulk_enquiry(body: BulkEnquiry):
    res = await db.bulk_enquiries.insert_one(body.to_mongo())
    return {"id": str(res.inserted_id), "ok": True}


@api.post("/contact")
async def contact(body: ContactMessage):
    res = await db.contact_messages.insert_one(body.to_mongo())
    return {"id": str(res.inserted_id), "ok": True}


app.add_middleware(CORSMiddleware, allow_credentials=True,
                   allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
                   allow_methods=["*"], allow_headers=["*"])


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    

# ---------------- Owner-only Admin API ----------------
import base64
import json
import time
from fastapi import Header, Depends

OWNER_EMAIL = os.environ.get("ADMIN_EMAIL", "matravastra@gmail.com").strip().lower()
ADMIN_PASSWORD_HASH = os.environ.get("ADMIN_PASSWORD_HASH", "")
ADMIN_TOKEN_SECRET = os.environ.get("ADMIN_TOKEN_SECRET", "")

class AdminLogin(BaseModel):
    email: str
    password: str

class AdminOrderUpdate(BaseModel):
    status: str

def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")

def _admin_token(email: str) -> str:
    payload = _b64(json.dumps({"sub": email, "exp": int(time.time()) + 8 * 60 * 60}, separators=(",", ":")).encode())
    signature = _b64(hmac.new(ADMIN_TOKEN_SECRET.encode(), payload.encode(), hashlib.sha256).digest())
    return payload + "." + signature

async def require_admin(authorization: Optional[str] = Header(default=None)):
    if not ADMIN_TOKEN_SECRET:
        raise HTTPException(503, "Admin authentication is not configured on the server")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Admin login required")
    token = authorization[7:].strip()
    try:
        payload_part, signature = token.split(".", 1)
        expected = _b64(hmac.new(ADMIN_TOKEN_SECRET.encode(), payload_part.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(expected, signature):
            raise ValueError("signature")
        padding = "=" * (-len(payload_part) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_part + padding))
        if payload.get("sub") != OWNER_EMAIL or int(payload.get("exp", 0)) < int(time.time()):
            raise ValueError("expiry")
        return payload["sub"]
    except Exception:
        raise HTTPException(401, "Admin session expired. Please log in again.")

@api.post("/admin/login")
async def admin_login(body: AdminLogin):
    if not ADMIN_PASSWORD_HASH or not ADMIN_TOKEN_SECRET:
        raise HTTPException(503, "Owner admin is not configured. Set ADMIN_PASSWORD_HASH and ADMIN_TOKEN_SECRET in backend environment.")
    if body.email.strip().lower() != OWNER_EMAIL:
        raise HTTPException(401, "Invalid owner credentials")
    try:
        salt_hex, digest_hex = ADMIN_PASSWORD_HASH.split(":", 1)
        actual = hashlib.pbkdf2_hmac("sha256", body.password.encode(), bytes.fromhex(salt_hex), 310000).hex()
    except Exception:
        raise HTTPException(503, "Admin password hash configuration is invalid")
    if not hmac.compare_digest(actual, digest_hex):
        raise HTTPException(401, "Invalid owner credentials")
    return {"access_token": _admin_token(OWNER_EMAIL), "token_type": "bearer", "expires_in": 28800, "email": OWNER_EMAIL}

@api.get("/admin/dashboard")
async def admin_dashboard(_owner: str = Depends(require_admin)):
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"status": {"$in": ["pending_payment", "pending", "processing"]}})
    confirmed = await db.orders.count_documents({"status": {"$in": ["confirmed", "shipped", "delivered"]}})
    revenue_result = await db.orders.aggregate([
        {"$match": {"status": {"$in": ["confirmed", "shipped", "delivered"]}}},
        {"$group": {"_id": None, "total": {"$sum": "$total"}}}
    ]).to_list(1)
    return {
        "orders": total_orders,
        "pending_orders": pending_orders,
        "products": await db.products.count_documents({}),
        "customers": len(await db.orders.distinct("customer.phone")),
        "bulk_enquiries": await db.bulk_enquiries.count_documents({}),
        "revenue": revenue_result[0]["total"] if revenue_result else 0,
        "confirmed_orders": confirmed
    }

@api.get("/admin/orders")
async def admin_orders(_owner: str = Depends(require_admin)):
    docs = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(300)
    return docs

@api.patch("/admin/orders/{order_number}")
async def admin_update_order(order_number: str, body: AdminOrderUpdate, _owner: str = Depends(require_admin)):
    allowed = {"pending_payment", "confirmed", "processing", "shipped", "delivered", "cancelled"}
    if body.status not in allowed:
        raise HTTPException(400, "Unsupported order status")
    result = await db.orders.update_one({"order_number": order_number}, {
        "$set": {"status": body.status},
        "$push": {"timeline": {"status": body.status, "at": now_iso()}}
    })
    if not result.matched_count:
        raise HTTPException(404, "Order not found")
    return {"ok": True, "order_number": order_number, "status": body.status}

@api.get("/admin/products")
async def admin_products(_owner: str = Depends(require_admin)):
    return await db.products.find({}, {"_id": 0}).sort("name", 1).to_list(300)

@api.post("/admin/products")
async def admin_create_product(body: Product, _owner: str = Depends(require_admin)):
    if await db.products.find_one({"slug": body.slug}):
        raise HTTPException(409, "A product with this slug already exists")
    await db.products.insert_one(body.to_mongo())
    return {"ok": True, "slug": body.slug}

@api.put("/admin/products/{slug}")
async def admin_update_product(slug: str, body: Product, _owner: str = Depends(require_admin)):
    if body.slug != slug and await db.products.find_one({"slug": body.slug}):
        raise HTTPException(409, "A product with this slug already exists")
    result = await db.products.replace_one({"slug": slug}, body.to_mongo())
    if not result.matched_count:
        raise HTTPException(404, "Product not found")
    return {"ok": True, "slug": body.slug}

@api.delete("/admin/products/{slug}")
async def admin_delete_product(slug: str, _owner: str = Depends(require_admin)):
    result = await db.products.delete_one({"slug": slug})
    if not result.deleted_count:
        raise HTTPException(404, "Product not found")
    return {"ok": True}

@api.get("/admin/enquiries")
async def admin_enquiries(_owner: str = Depends(require_admin)):
    docs = await db.bulk_enquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(300)
    return docs

@api.get("/admin/customers")
async def admin_customers(_owner: str = Depends(require_admin)):
    pipeline = [
        {"$sort": {"created_at": -1}},
        {"$group": {"_id": "$customer.phone", "customer": {"$first": "$customer"}, "orders": {"$sum": 1}, "spent": {"$sum": "$total"}, "last_order": {"$first": "$created_at"}}},
        {"$sort": {"last_order": -1}}
    ]
    rows = await db.orders.aggregate(pipeline).to_list(500)
    return [{"name": x.get("customer", {}).get("name", ""), "phone": x["_id"], "email": x.get("customer", {}).get("email", ""), "city": x.get("customer", {}).get("city", ""), "orders": x["orders"], "spent": x["spent"], "last_order": x["last_order"]} for x in rows if x.get("_id")]

# Register after all public and owner-only routes have been declared.
app.include_router(api)
