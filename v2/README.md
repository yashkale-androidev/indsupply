# IndSupply Frontend v2 (React + Tailwind CSS)

B2B industrial supplies storefront and admin panel for **indsupply.in**. React 18, React Router 6, Tailwind CSS 4, Vite 6. Light theme with brand amber `#f9a401` and navy `#072336`.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

It runs with **no backend** out of the box (`VITE_USE_MOCK=true`): a mock API in `src/api/mock.js` stores data in the browser's localStorage.

| Role | Login | Password |
|---|---|---|
| Customer | `demo@indsupply.in` | `demo123` |
| Admin | `admin@indsupply.in` | `admin123` |

OTP login in demo mode always accepts `123456`. To reset demo data, clear `indsupply_mock_db_v1` in localStorage.

## What's new in v2

Mobile-first redesign (sticky header, menu drawer, bottom tab bar, filter sheet, sticky buy/checkout bars), built-in product illustrations, guest cart, search suggestions, admin categories + admin login, info pages, skeleton loaders, and a test suite. See `TEST_REPORT.md` for the audit and results.

## Tests

```bash
npm test                                   # 30 unit/API/component tests
npm run build && npm run preview           # then, in another terminal:
pip install playwright && playwright install chromium
python3 qa/e2e_flows.py http://localhost:4173   # 22 real-browser checks
```

## Screens

Customer: Home, All Categories, About/Delivery/Returns/Privacy/Terms, Product Listing (`/category/:slug`, `/products`), Search Results (`/search?q=`), Product Details, Cart, Checkout (address, then review and payment), Order Confirmation, My Orders, Order Details with tracking, Profile, Login/Register (password or OTP), Contact/Support, Bulk enquiry.
Admin (`/admin`, ADMIN role only, login at `/admin/login`): Dashboard, Products, Categories, Orders, Customers.

## Connect your backend

1. Set `VITE_USE_MOCK=false` in `.env`.
2. Set `VITE_API_BASE_URL` (default `/api`). In dev, Vite proxies `/api` to `VITE_PROXY_TARGET` (default `http://localhost:8080`), so no CORS setup is needed locally. In production either serve the app behind the same domain as `/api`, or set a full URL and enable CORS.
3. Implement the endpoints below. Every call goes through `src/api/http.js` and is listed in `src/api/services.js`.
4. Delete `src/api/mock.js` and its import in `http.js` when you no longer need it.

**Conventions**
- JSON bodies. Auth header: `Authorization: Bearer <token>` (token returned by login/register).
- A `401` response logs the user out. `403` is shown as an error message.
- Errors: `{ "message": "Human readable text", "errors": { "fieldName": "Field message" } }` (`errors` optional, used to show messages under form fields). Use `422` for validation, `409` for conflicts.
- Money in rupees (number). IDs are strings. Dates are ISO-8601.
- **Totals are computed by the server.** The frontend only displays `summary`. Re-validate price, stock and quantity on the server when creating an order.

| Method & path | Request | Response |
|---|---|---|
| `POST /auth/register` | `{name, company, mobile, email, password}` | `{token, user}` |
| `POST /auth/login` | `{identifier, password}` (mobile or email) | `{token, user}` |
| `POST /auth/otp/request` | `{identifier}` | `{sent: true}` |
| `POST /auth/otp/verify` | `{identifier, otp}` | `{token, user}` |
| `POST /auth/forgot-password` | `{identifier}` | `{sent: true}` |
| `POST /auth/logout` | | `204` |
| `GET /auth/me`, `GET /customers/me` | | `user` |
| `PUT /customers/me` | `{name, company, mobile, email, gstin, gstLegalName, address:{line1,city,state,pincode}}` | `user` |
| `GET /categories` | | `[{slug, name, description, art, productCount}]` |
| `POST/PUT/DELETE /admin/categories(/:slug)` | `{name, description, art}` | `category` |
| `GET /products` | query: `q, category, brand` (comma list), `minPrice, maxPrice, inStock, sort` (`price_asc\|price_desc\|newest`), `page, pageSize, featured` | `{items:[product], total, page, pageSize, facets:{brands:[{name,count}], inStock, outOfStock}}` |
| `GET /products/:id` | | `product` |
| `GET /cart` | | `{items:[{productId,name,sku,unit,price,stock,imageUrl,category,qty,subtotal}], summary, count}` |
| `POST /cart/items` | `{productId, qty}` (adds to existing qty) | cart |
| `PATCH /cart/items/:productId` | `{qty}` | cart |
| `DELETE /cart/items/:productId` | | cart |
| `POST /orders` | `{address:{name,mobile,company,line1,city,state,pincode}, paymentMethod, billingType:'GST'|'NON_GST', gstin, gstLegalName, deliveryType:'BUSINESS'|'WORK_SITE'}` | `order` (must persist billing and delivery selections) |
| `GET /orders` | query: `status` | `[order]` |
| `GET /orders/:id` | | `order` |
| `POST /orders/:id/cancel` | | `order` (only while `PLACED` or `CONFIRMED`) |
| `POST /payments/create` | `{orderId}` | `{gatewayOrderId, amount, currency, key?}` |
| `POST /payments/verify` | `{orderId, gatewayPaymentId, signature?}` | `order` with `paymentStatus: "PAID"` |
| `POST /support` | `{name, email, mobile, message, type}` | `{ok: true}` |
| `GET /admin/dashboard` | | `{totalOrders, pendingOrders, salesAmount, customers, salesSeries:[{date,amount}], lowStock:[{id,name,sku,stock,imageUrl}]}` |
| `GET/POST /admin/products`, `PUT/DELETE /admin/products/:id` | product fields | `product` (GET list returns array, includes disabled) |
| `GET /admin/orders` | query: `status` | `[order + customer]` |
| `PATCH /admin/orders/:id/status` | `{status}` | `order` |
| `GET /admin/customers` | | `[user + orderCount]` |

**Shapes**
- `user`: `{id, role: "CUSTOMER"|"ADMIN", name, company, mobile, email, gstin, gstLegalName, address:{line1,city,state,pincode}}`
- `product`: `{id, sku, name, brand, category (slug), categoryName, unit, price, stock, specs:{}, description, imageUrl, active}`
- `order`: `{id, number, createdAt, status, paymentMethod, paymentStatus, transactionId, billingType, gstin, gstLegalName, deliveryType, items:[{productId,name,sku,unit,price,qty}], address, summary:{subtotal,gst,delivery,total}, timeline:[{status, at}]}`
- Order `status`: `PLACED, CONFIRMED, PACKED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED`. Payment: `PENDING, PAID, FAILED, REFUNDED`.

## Payments

`src/lib/payment.js` holds the gateway hook. The Razorpay example is commented in place. Never send raw card details through this app: use the gateway's hosted checkout, and have your backend verify the signature in `/payments/verify`.

## Customise

- Business details, 24×7 service hours and delivery areas: `src/config.js`
- Invoice preview opens a print-ready page; choose **Save as PDF** in the browser print dialog. The live backend must persist the GST billing type, GSTIN, legal name and work-site delivery type as part of each order.
- GST rate and tax split must be calculated by the production backend from each product's applicable HSN/tax rate; the included mock currently uses its original flat 18% demo calculation.
- Brand colours and fonts: `@theme` block in `src/index.css`
- Product photos: set `imageUrl` on products; a built-in illustration (`art` key, see `src/components/art.jsx`) is shown when it is empty
- Guest carts live in localStorage and merge into the account on login; GST and delivery are calculated by the server after login
- GST rate label ("GST (18%)") is text in `src/pages/Cart.jsx`; the amount comes from the server

## Remaining production work

Connect the production backend, configure IndSupply's own legal GSTIN and registered address, generate legally compliant tax invoices from backend tax data, and validate payment gateway signatures. Invoice PDF preview/download is available through the browser's Print → Save as PDF flow.

## Structure

```
src/
  api/          http.js (fetch wrapper), services.js (endpoints), mock.js (demo backend)
  context/      AppContext.jsx (auth, cart, toasts)
  components/   Layout, SearchBox, ProductCard, ui primitives, art (illustrations), icons, route guards
  pages/        storefront pages;  pages/admin/ admin panel
  lib/          format helpers, useAsync hook, payment hook
tests/          Vitest (api, format, components)
qa/             Playwright end-to-end + layout audit scripts
```
