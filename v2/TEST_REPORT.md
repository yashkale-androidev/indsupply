# IndSupply Frontend: QA Report (v1 + Zip B reviewed, v2 delivered)

Tested in headless Chromium (Playwright) at phone (375/390 px), tablet (768 px) and desktop (1366 px), plus Vitest in jsdom.
Not tested: real devices, Safari/Firefox, screen readers, a real backend, a real payment gateway.

## 1. What was reviewed

| | Zip A (`indsupply-frontend`, v1) | Zip B (`IndSupply-React-Tailwind-Frontend`) |
|---|---|---|
| Stack | React 18, Router 6, Tailwind 4, Vite | React, Router, Tailwind 3, lucide-react |
| Structure | 40 files: pages, context, API layer, mock backend | 1 file `App.jsx` (about 40 KB, 63 very long lines) + data |
| Backend-ready | Yes: fetch wrapper, endpoint contract, mock server | Partial: helper and wrappers exist but screens use local state |
| Cart | Login required | Guest cart in localStorage |
| Images | None (icon placeholders) | Remote Unsplash photos |
| Admin | Dashboard, products, orders, customers | + categories, + separate admin login |
| Auth | Real flow against mock API, route guards | UI demo only, no guards |

**Kept from A:** architecture, API contract, mock backend, route guards, server-side totals, filters in URL, tests-friendly structure.
**Taken from B:** guest cart, admin categories, admin login screen, recent orders on dashboard, info pages (About, Delivery, Returns, Privacy), lucide icons, enquiry type + company on contact form, sticky header, mobile menu, free-delivery messaging, 9-category home row.
**Not taken from B:** remote Unsplash photos (hotlinks can break, wrong subject, blocked by corporate networks), client-side total calculation, `window.location.href` navigation (full page reloads), 63-line monolith.

## 2. Defects found in v1 (zip A) and fixed in v2

| # | Severity | Defect | How it was found | Fix |
|---|---|---|---|---|
| 1 | High | Home page scrolled sideways on phones; hero heading and search were cut off | Browser audit: scrollWidth 375 vs page width, screenshot | `min-w-0` on hero grid items, constrained art, global `overflow-x: clip` safety net |
| 2 | High | Login page scrolled sideways on phones | Same audit | Mobile tabs instead of two stacked panels |
| 3 | High | "All Categories" dropdown opened but could not be clicked (hit-test landed on the hero) because it sat inside a scrolling container | `elementFromPoint` test | New popover outside any overflow container |
| 4 | High | Guests tapping Add to Cart were sent to the login page | Click test | Guest cart (localStorage), merged into the account on login |
| 5 | High | No images anywhere (51/51 page views had none) | Audit | Built-in illustrated SVG artwork for 14 product types + `imageUrl` override |
| 6 | Medium | About 23 touch targets under 40 px per mobile page | Audit | 44 px minimum on buttons, steppers, tabs, pagination, footer links (avg now 6.5/page, mostly inline text links) |
| 7 | Medium | No sticky header, no mobile menu, category row scrolled off-screen on phones | Visual review | Sticky header, drawer menu, bottom tab bar |
| 8 | Medium | Product grid was 1 column on phones (very long scroll) | Visual review | 2-column compact cards on phones |
| 9 | Medium | Filters pushed above results on phones | Visual review | Bottom-sheet filters with active-filter chips |
| 10 | Medium | Admin orders table made the whole page scroll sideways on phones (a hidden label escaped its scroll container) | Overflow trace | Table cards are `relative` |
| 11 | Low | Spinner-only loading, no page titles, no suggestions in search | Review | Skeleton loaders, per-page titles, live search suggestions |
| 12 | Low | No cart help for free delivery, no sticky buy/checkout bars on phones | Review | Free-delivery progress bar, sticky bars |

**Found while testing v2 and fixed:** `/cart` was still behind the login guard after adding guest carts (caught by a component test).

## 3. Automated tests included

- `npm test`: **30 Vitest tests** (3 files, all passing): formatting, API contract (auth, search, filters, MOQ and stock rules, server totals, order placement, stock reduction and restore, payment verify, ownership isolation, admin CRUD) and component flows (guest cart, login merge, wrong password, admin gate).
- `python3 qa/e2e_flows.py`: **22 real-browser checks, all passing**: desktop shopping flow end to end, cancel order, order tabs, profile, admin (login, status, add product, add category), and 8 phone checks (no sideways scroll on 9 pages, tab bar, drawer, filter sheet, sticky buy bar, cart bar, tabs, tap sizes).
- `python3 qa/audit.py <url> <tag>`: layout audit across 17 routes x 3 screen sizes (overflow, console errors, tap targets).

Before / after (same audit): pages scrolling sideways 3 -> 0; mobile tap targets under 40 px 23.1 -> 6.5 per page; broken images 0 -> 0. The only console errors in the sandbox were blocked Google Fonts requests (no internet there).

## 4. Known gaps / recommended next tests

1. **Real backend:** run `tests/api.test.js` assertions against your API, especially price/stock re-validation, ownership checks, and 401/403 behaviour.
2. **Payments:** the gateway step is a stub (`src/lib/payment.js`); test success, failure, cancel and signature verification on a real gateway sandbox.
3. **Real devices:** Safari iOS (input zoom, safe areas, 100vh), low-end Android, slow 3G.
4. **Accessibility:** keyboard and focus work and labels exist, but a screen-reader pass and contrast audit with real fonts have not been done.
5. **Product photos:** artwork is illustrative. Add `imageUrl` per product for real photos.
6. **Policy text** in `/info/*` and `src/config.js` are placeholders in [BRACKETS].
7. Not built: GST invoice PDF, multiple saved addresses, change password, order-level returns, wishlist.
