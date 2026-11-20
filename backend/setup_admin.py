"""One-time local setup for the MatraVastra owner admin credentials.
Run from the backend folder: python setup_admin.py
This writes secrets only to backend/.env (never commit that file).
"""
from getpass import getpass
from pathlib import Path
import hashlib
import secrets

env_path = Path(__file__).parent / ".env"
existing = env_path.read_text(encoding="utf-8").splitlines() if env_path.exists() else []
values = {}
for line in existing:
    if "=" in line and not line.lstrip().startswith("#"):
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip()

email = input("Owner email [matravastra@gmail.com]: ").strip() or "matravastra@gmail.com"
password = getpass("Create a strong admin password (input hidden): ")
confirm = getpass("Confirm password: ")
if len(password) < 12:
    raise SystemExit("Use at least 12 characters for the admin password.")
if password != confirm:
    raise SystemExit("Passwords do not match. No changes were made.")

salt = secrets.token_bytes(16)
digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310000).hex()
values["ADMIN_EMAIL"] = email.lower()
values["ADMIN_PASSWORD_HASH"] = salt.hex() + ":" + digest
values["ADMIN_TOKEN_SECRET"] = secrets.token_urlsafe(48)

keys = ["MONGO_URL", "DB_NAME", "CORS_ORIGINS", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"]
ordered = [f"{key}={values.pop(key, '')}" for key in keys if key in values or key in {"MONGO_URL", "DB_NAME"}]
ordered += [f"{key}={value}" for key, value in values.items()]
env_path.write_text("\n".join(ordered) + "\n", encoding="utf-8")
print(f"Owner admin credentials configured for {email.lower()}.")
print("Keep backend/.env private. Do not upload or share it.")
