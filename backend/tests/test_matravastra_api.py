# MATRA VASTRA backend API regression tests
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
SLUG = "mahadev-gold-oversized"  # price 1299
CUST = {"name": "TEST_User", "phone": "9999900001", "email": "t@x.com", "address": "12 Ghat Road",
        "city": "Varanasi", "state": "UP", "pincode": "221001"}


@pytest.fixture(scope="module")
def s():
    x = requests.Session()
    x.headers.update({"Content-Type": "application/json"})
    return x


# Products
def test_list_products(s):
    r = s.get(f"{BASE_URL}/api/products")
    assert r.status_code == 200
    d = r.json()
    assert len(d) == 18
    assert all("_id" not in p for p in d)
    assert {p["collection"] for p in d} == {"kashi", "purvanchal", "aspirant"}


@pytest.mark.parametrize("c", ["kashi", "purvanchal", "aspirant"])
def test_products_by_collection(s, c):
    d = s.get(f"{BASE_URL}/api/products", params={"collection": c}).json()
    assert len(d) == 6 and all(p["collection"] == c for p in d)


def test_is_new(s):
    d = s.get(f"{BASE_URL}/api/products", params={"is_new": "true"}).json()
    assert len(d) == 9 and all(p["is_new"] for p in d)
    assert len(s.get(f"{BASE_URL}/api/products", params={"is_new": "false"}).json()) == 9


@pytest.mark.parametrize("slug", ["kaal-bhairav-black", "chai-and-chapters-brown"])
def test_new_products_exist(s, slug):
    r = s.get(f"{BASE_URL}/api/products/{slug}")
    assert r.status_code == 200 and r.json()["slug"] == slug and r.json()["image_back"]


def test_featured(s):
    d = s.get(f"{BASE_URL}/api/products", params={"featured": "true"}).json()
    assert len(d) >= 1 and all(p["featured"] for p in d)


def test_get_product(s):
    r = s.get(f"{BASE_URL}/api/products/{SLUG}")
    assert r.status_code == 200
    assert r.json()["price"] == 1299 and r.json()["mrp"] == 1699


def test_get_product_404(s):
    assert s.get(f"{BASE_URL}/api/products/nope-xyz").status_code == 404


# Payment config
def test_payment_config(s):
    d = s.get(f"{BASE_URL}/api/payment/config").json()
    assert d["demo"] is True and d["key_id"] is None


# Orders
def _order(s, items, coupon=None, cust=CUST):
    return s.post(f"{BASE_URL}/api/orders", json={"items": items, "customer": cust, "coupon": coupon})


def test_order_totals_coupon_free_ship(s):
    r = _order(s, [{"slug": SLUG, "size": "L", "color": "Matte Black", "qty": 2}], "kashi10")
    assert r.status_code == 200, r.text
    d = r.json()
    # 2598 - 260 = 2338, free ship
    assert d["total"] == 2338 and d["payment_mode"] == "demo" and d["amount_paise"] == 233800


def test_order_shipping_charged(s):
    r = _order(s, [{"slug": "silent-grind-white", "size": "M", "color": "Pure White", "qty": 1}], "KASHI10")
    # 999 - 100 = 899 + 79 = 978
    assert r.json()["total"] == 978


def test_order_invalid_coupon_ignored(s):
    r = _order(s, [{"slug": "silent-grind-white", "size": "M", "color": "Pure White", "qty": 1}], "BAD")
    assert r.json()["total"] == 999


def test_order_validation(s):
    assert _order(s, [{"slug": "nope", "size": "L", "color": "x", "qty": 1}]).status_code == 400
    assert _order(s, [{"slug": SLUG, "size": "XS", "color": "x", "qty": 1}]).status_code == 400
    assert _order(s, []).status_code == 422
    assert _order(s, [{"slug": SLUG, "size": "L", "color": "x", "qty": 0}]).status_code == 422
    assert _order(s, [{"slug": SLUG, "size": "L", "color": "x", "qty": 1}], cust={**CUST, "pincode": "123"}).status_code == 422


def test_verify_and_track(s):
    on = _order(s, [{"slug": SLUG, "size": "S", "color": "Matte Black", "qty": 1}]).json()["order_number"]
    t = s.get(f"{BASE_URL}/api/orders/track", params={"order_number": on, "phone": CUST["phone"]}).json()
    assert t["status"] == "pending_payment"
    assert s.post(f"{BASE_URL}/api/orders/{on}/verify", json={}).status_code == 400
    v = s.post(f"{BASE_URL}/api/orders/{on}/verify", json={"demo": True})
    assert v.status_code == 200 and v.json()["status"] == "confirmed"
    t = s.get(f"{BASE_URL}/api/orders/track", params={"order_number": on.lower(), "phone": CUST["phone"]}).json()
    assert t["status"] == "confirmed" and t["total"] == 1299 and len(t["timeline"]) == 2
    assert s.get(f"{BASE_URL}/api/orders/track", params={"order_number": on, "phone": "0000000000"}).status_code == 404
    # idempotent verify: second call must not add timeline entry
    v2 = s.post(f"{BASE_URL}/api/orders/{on}/verify", json={"demo": True})
    assert v2.status_code == 200 and v2.json()["status"] == "confirmed"
    t = s.get(f"{BASE_URL}/api/orders/track", params={"order_number": on, "phone": CUST["phone"]}).json()
    assert len(t["timeline"]) == 2


def test_verify_404(s):
    assert s.post(f"{BASE_URL}/api/orders/MV00000000X/verify", json={"demo": True}).status_code == 404


# Bulk + contact
def test_bulk(s):
    b = {"name": "TEST_Org", "phone": "9999900002", "organization": "BHU", "category": "College Events",
         "quantity": 50, "details": "fest"}
    r = s.post(f"{BASE_URL}/api/bulk-enquiries", json=b)
    assert r.status_code == 200 and r.json()["ok"] is True
    assert s.post(f"{BASE_URL}/api/bulk-enquiries", json={**b, "quantity": 5}).status_code == 422


def test_contact(s):
    r = s.post(f"{BASE_URL}/api/contact", json={"name": "TEST_C", "email": "a@b.com", "message": "Hello there"})
    assert r.status_code == 200 and r.json()["ok"] is True
    assert s.post(f"{BASE_URL}/api/contact", json={"name": "T", "email": "a@b.com", "message": "hi"}).status_code == 422
