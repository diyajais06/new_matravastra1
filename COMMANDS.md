# MATRA VASTRA: Local Setup & Run Commands

Stack: **FastAPI + MongoDB** backend (`backend/`) and a **React (CRA + craco)** frontend (`frontend/`).

| Service  | URL                              |
|----------|----------------------------------|
| Website  | http://localhost:3000            |
| API      | http://localhost:8001/api        |
| API docs | http://localhost:8001/docs       |
| MongoDB  | mongodb://localhost:27017        |

---

## 1. Prerequisites (one time, macOS)

```bash
# Homebrew (skip if already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Python 3, Node.js, MongoDB
brew install python node
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB now and on every login
brew services start mongodb-community

# Check versions
python3 --version
node --version
mongosh --eval "db.runCommand({ ping: 1 })"    # should print { ok: 1 }
```

> **Yarn:** the frontend must be installed with **yarn 1.22.22** (pinned in `frontend/package.json`).
> No global install is needed: the commands below run it through `npx yarn@1.22.22`.
> If you prefer a global install, run `npm install -g yarn@1.22.22` and then use `yarn` in place of `npx yarn@1.22.22`.

---

## 2. Get the code

```bash
git clone <repo-url> new_matravastra1
cd new_matravastra1
```

---

## 3. Environment files

Git ignores both files, so you must create them on every new machine.

```bash
# Backend
cat > backend/.env <<'EOF'
MONGO_URL=mongodb://localhost:27017
DB_NAME=matravastra
CORS_ORIGINS=http://localhost:3000
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
EOF

# Frontend
cat > frontend/.env <<'EOF'
REACT_APP_BACKEND_URL=http://localhost:8001
DISABLE_EMERGENT_OVERLAY=true
EOF
```

- If `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are empty, checkout runs in **demo payment mode**. Add real keys for live payments.
- `DISABLE_EMERGENT_OVERLAY=true` turns off the Emergent.sh dev-error overlay, which is only needed on Emergent's platform.

---

## 4. Backend setup (first time)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..
```

> Use `requirements.txt`, **not** `reqirements.txt`. The misspelled file is Emergent's full environment dump.
> It contains private Emergent packages (`emergentintegrations`, a custom `litellm` wheel) that will not install
> outside their platform, and the server does not use them.

---

## 5. Frontend setup (first time)

```bash
cd frontend
npx -y yarn@1.22.22 install
cd ..
```

> **Do not use `npm install`.** npm hoists the wrong `ajv` version, and `yarn start` then crashes with
> `Cannot find module 'ajv/dist/compile/codegen'`. If that happens, run `rm -rf node_modules package-lock.json`
> and reinstall with yarn.

---

## 6. Run the project (every time)

Use two terminal tabs.

**Terminal 1: backend**
```bash
cd backend
source venv/bin/activate
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```
On startup, the backend seeds the products and hampers into MongoDB.

**Terminal 2: frontend**
```bash
cd frontend
npx yarn@1.22.22 start
```
The site opens at http://localhost:3000. The first compile takes about 30–60 seconds.

**Quick check**
```bash
curl http://localhost:8001/api/products     # JSON list of products
```

---

## 7. Stop everything

```bash
# Press Ctrl + C in each terminal, then optionally:
brew services stop mongodb-community
deactivate                                  # leave the Python venv
```

---

## 8. Optional commands

```bash
# Backend API tests (the backend must be running)
cd backend && source venv/bin/activate
pip install pytest pytest-xdist requests
REACT_APP_BACKEND_URL=http://localhost:8001 pytest -n 0
cd ..

# Production build of the frontend (output goes to frontend/build/)
cd frontend && npx yarn@1.22.22 build && cd ..

# Regenerate sitemap.xml / robots.txt / llms.txt from the DB for your real domain
backend/venv/bin/python scripts/generate_seo_files.py https://your-domain.com

# Look at the data in MongoDB
mongosh matravastra --eval "db.products.countDocuments()"
mongosh matravastra --eval "db.orders.find().pretty()"
```

---

## 9. Troubleshooting

| Problem | Fix |
|---|---|
| `KeyError: 'MONGO_URL'` | `backend/.env` is missing. See step 3. |
| `ServerSelectionTimeoutError` | MongoDB is not running. Run `brew services start mongodb-community`. |
| `Address already in use` (8001 or 3000) | Find the process with `lsof -i :8001` (or `:3000`), then `kill <PID>`. |
| `Cannot find module 'ajv/dist/compile/codegen'` | npm was used. Run `rm -rf frontend/node_modules frontend/package-lock.json` and reinstall with yarn (step 5). |
| Frontend loads but shows no products / CORS error | Make sure the backend is running and `CORS_ORIGINS` in `backend/.env` matches the frontend URL. |
| Changed a `.env` value | Restart that server. The frontend only reads `.env` at startup. |
