# Copy-Paste Test Commands

Run these from the `backend/` folder with the server running (`npm run dev`).

---

## 0. Email Test (one command - no app needed)

Sends a real email using the `.env` credentials and prints a preview URL.

```bash
npm run test:email
```

Expect output:
```
Order confirmation email sent to john@example.com for order ... 
Email preview: https://ethereal.email/message/...
```

Open the preview URL in a browser to see the rendered email.
If it says `SEND: FAILED` -> check `EMAIL_*` values in `.env`.

---

## 1. Email Chain Test (Bull Queue -> Worker -> Nodemailer -> Mailtrap)

### Step 1 - Get a product id
```bash
PID=$(curl -s "http://localhost:5000/api/products?pageSize=1" | node -pe "JSON.parse(require('fs').readFileSync(0)).products[0]._id")
echo "Product ID: $PID"
```

### Step 2 - Login as the seeded user and save the token
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"john@example.com","password":"john123"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).token")
echo "Token: $TOKEN"
```

### Step 3 - Place an order (COD, qty 2)
```bash
curl -s -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"orderItems\":[{\"product\":\"$PID\",\"qty\":2}],\"shippingAddress\":{\"address\":\"123 Main St\",\"city\":\"Mumbai\",\"postalCode\":\"400001\",\"country\":\"India\"},\"paymentMethod\":\"COD\"}"
```

### Step 4 - Watch the nodemon terminal for these logs
```
Enqueued order confirmation and inventory sync jobs for order ...
Order confirmation email sent to john@example.com ...
Inventory sync completed for order ... : OK
```

### Step 5 - Check Mailtrap inbox
Open your Mailtrap inbox -> the order confirmation email should be there.

---

## 2. Verify Order State

```bash
# Get the order id from Step 3 output, then:
curl -s http://localhost:5000/api/orders/myorders \
  -H "Authorization: Bearer $TOKEN"
```

```bash
# Check the product stock went down (qty 2 should be subtracted)
curl -s "http://localhost:5000/api/products?pageSize=1" | node -pe "const r=JSON.parse(require('fs').readFileSync(0)); r.products[0].name + ' - countInStock: ' + r.products[0].countInStock"
```

---

## 3. Mark Order Paid + Delivered (Admin)

```bash
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@example.com","password":"admin123"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).token")
# Auto-grab the most recent order id (no need to paste anything)
OID=$(curl -s http://localhost:5000/api/orders/myorders -H "Authorization: Bearer $TOKEN" | node -pe "JSON.parse(require('fs').readFileSync(0))[0]._id")
echo "Order ID: $OID"
```

```bash
# Pay the order
curl -s -X PUT http://localhost:5000/api/orders/$OID/pay \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"paymentResult":{"id":"test_123","status":"completed"}}'
```

```bash
# Mark delivered (admin only)
curl -s -X PUT http://localhost:5000/api/orders/$OID/deliver \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 4. Quick API Smoke Checks

```bash
curl -s http://localhost:5000/api/products | node -pe "const r=JSON.parse(require('fs').readFileSync(0)); 'products: ' + r.count + ', pages: ' + r.pages"
curl -s "http://localhost:5000/api/products?keyword=Sony" | node -pe "const r=JSON.parse(require('fs').readFileSync(0)); 'search hits: ' + r.count"
curl -s http://localhost:5000/api/products/top | node -pe "JSON.parse(require('fs').readFileSync(0)).map(p=>p.name+' ('+p.rating+')').join(' | ')"
```

---

## 5. Docker Compose Commands

```bash
docker compose up -d          # start Mongo + Redis containers
docker compose ps             # show container status
redis-cli ping                # check Redis -> PONG
docker compose logs redis     # Redis container logs
docker compose logs mongodb   # Mongo container logs
docker compose down           # stop (data kept in volume)
docker compose down -v        # stop + wipe volume (fresh start -> re-seed)
```

---

## 6. Local Mongo Switch (optional - instead of Atlas)

Edit `backend/.env`:

```
MONGO_URI=mongodb://localhost:27017/ecommerce
```

Then re-seed and restart:

```bash
npm run seed
npm run dev
```

Swap back to Atlas anytime by restoring the `mongodb+srv://...` URI.

---

## 7. Seed / Reset the Database

```bash
npm run seed    # wipes + re-inserts 2 users and 12 products
```

---

## Seeded Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | admin123 |
| Regular user | john@example.com | john123 |
