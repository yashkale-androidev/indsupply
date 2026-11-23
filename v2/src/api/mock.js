/**
 * In-browser mock backend so the whole app runs without a server (VITE_USE_MOCK=true).
 * Data persists in localStorage. It mirrors the REST contract in services.js, so once your real
 * backend implements those endpoints you only flip VITE_USE_MOCK=false. Delete this file when done.
 *
 * Demo logins:  demo@indsupply.in / demo123   |   admin@indsupply.in / admin123   |   OTP is always 123456
 */
import { ApiError } from './errors.js';

const KEY = 'indsupply_mock_db_v2';
const GST_RATE = 0.18;
const FREE_DELIVERY_ABOVE = 5000;
const STEPS = ['PLACED', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const iso = (d) => new Date(d).toISOString();
const round = (n) => Math.round(n * 100) / 100;
const fail = (status, message, details) => { throw new ApiError(message, status, details); };

const CATEGORIES = [
  ['fasteners', 'Fasteners', 'Bolts, nuts, screws & more', 'bolt'],
  ['bearings', 'Bearings', 'Ball bearings, roller bearings & more', 'bearing'],
  ['electrical-items', 'Electrical Items', 'Cables, switches, lights & more', 'cable'],
  ['lubricants', 'Lubricants', 'Oils, greases & coolants', 'oil'],
  ['tools', 'Tools', 'Hand tools, power tools & more', 'spanner'],
  ['safety-items', 'Safety Items', 'Gloves, helmets, shoes & more', 'helmet'],
  ['industrial-stationery', 'Industrial Stationery', 'Office & packaging supplies', 'marker'],
  ['hydraulics-pneumatics', 'Hydraulics & Pneumatics', 'Fittings, hoses, valves & more', 'fitting'],
  ['adhesives-sealants', 'Adhesives & Sealants', 'Tapes, sealants & adhesives', 'sealant'],
].map(([slug, name, description, art]) => ({ slug, name, description, art }));

const PRODUCTS = [
  ['HB-DIN933-8X30', 'Hex Bolt (DIN 933) M8 x 30mm', 'IndSupply', 'fasteners', 'piece', 2.5, 100, 5000, 'bolt', { Material: 'Carbon Steel', Finish: 'Zinc Plated', Standard: 'DIN 933' }],
  ['HB-DIN933-10X40', 'Hex Bolt (DIN 933) M10 x 40mm', 'IndSupply', 'fasteners', 'piece', 4.2, 100, 3000, 'bolt', { Material: 'Carbon Steel', Finish: 'Zinc Plated', Standard: 'DIN 933' }],
  ['SHB-M8X25', 'Socket Head Bolt M8 x 25mm', 'Unbrako', 'fasteners', 'piece', 3.8, 100, 1500, 'bolt', { Material: 'Alloy Steel', Finish: 'Black Oxide', Standard: 'DIN 912' }],
  ['HN-DIN934-M8', 'Hex Nut (DIN 934) M8', 'IndSupply', 'fasteners', 'piece', 0.8, 200, 8000, 'nut', { Material: 'Carbon Steel', Finish: 'Zinc Plated', Standard: 'DIN 934' }],
  ['HN-DIN934-M10', 'Hex Nut (DIN 934) M10', 'IndSupply', 'fasteners', 'piece', 1.2, 200, 6500, 'nut', { Material: 'Carbon Steel', Finish: 'Zinc Plated', Standard: 'DIN 934' }],
  ['SW-M8', 'Spring Washer M8', 'IndSupply', 'fasteners', 'piece', 0.3, 200, 6000, 'washer', { Material: 'Spring Steel', Standard: 'DIN 127' }],
  ['PW-M8', 'Plain Washer M8', 'IndSupply', 'fasteners', 'piece', 0.2, 500, 10000, 'washer', { Material: 'Mild Steel', Standard: 'DIN 125' }],
  ['STS-M4X16', 'Self Tapping Screw M4 x 16mm', 'IndSupply', 'fasteners', 'piece', 0.8, 200, 2000, 'screw', { Material: 'Stainless Steel', Standard: 'DIN 7981' }],
  ['BRG-6205', 'Deep Groove Ball Bearing 6205', 'TVS', 'bearings', 'piece', 120, 5, 1200, 'bearing', { Bore: '25 mm', 'Outer diameter': '52 mm', Width: '15 mm' }],
  ['BRG-6204', 'Deep Groove Ball Bearing 6204', 'TVS', 'bearings', 'piece', 95, 5, 60, 'bearing', { Bore: '20 mm', 'Outer diameter': '47 mm', Width: '14 mm' }],
  ['BRG-6305', 'Deep Groove Ball Bearing 6305', 'TVS', 'bearings', 'piece', 165, 5, 420, 'bearing', { Bore: '25 mm', 'Outer diameter': '62 mm', Width: '17 mm' }],
  ['OIL-GEAR-68-1L', 'Industrial Gear Oil ISO VG 68 (1L)', 'Servo', 'lubricants', 'piece', 350, 1, 300, 'oil', { Grade: 'ISO VG 68', Pack: '1 litre' }],
  ['GRS-EP2-500G', 'Multipurpose Grease EP2 (500g)', 'Servo', 'lubricants', 'piece', 240, 1, 90, 'oil', { Grade: 'NLGI 2', Pack: '500 g' }],
  ['OIL-HYD-46-5L', 'Hydraulic Oil ISO VG 46 (5L)', 'Servo', 'lubricants', 'can', 1150, 1, 150, 'oil', { Grade: 'ISO VG 46', Pack: '5 litre' }],
  ['SG-PU-10', 'Safety Gloves PU Coated', 'Karam', 'safety-items', 'pair', 45, 12, 1500, 'gloves', { Coating: 'PU', Size: 'Free size' }],
  ['SG-CUT-L', 'Cut Resistant Gloves (Large)', 'Karam', 'safety-items', 'pair', 140, 6, 380, 'gloves', { Level: 'Cut level 5', Size: 'Large' }],
  ['SAF-HELMET', 'Safety Helmet (Yellow)', 'Karam', 'safety-items', 'piece', 220, 1, 0, 'helmet', { Material: 'HDPE', Colour: 'Yellow' }],
  ['SPNR-12', 'Combination Spanner 12mm', 'Taparia', 'tools', 'piece', 55, 1, 800, 'spanner', { Size: '12 mm', Material: 'Chrome Vanadium' }],
  ['SPNR-17', 'Combination Spanner 17mm', 'Taparia', 'tools', 'piece', 85, 1, 640, 'spanner', { Size: '17 mm', Material: 'Chrome Vanadium' }],
  ['CBL-1.5-90', 'Copper Cable 1.5 sq mm (90 m coil)', 'Polycab', 'electrical-items', 'coil', 1450, 1, 40, 'cable', { Conductor: 'Copper', Length: '90 m' }],
  ['CBL-2.5-90', 'Copper Cable 2.5 sq mm (90 m coil)', 'Polycab', 'electrical-items', 'coil', 2350, 1, 55, 'cable', { Conductor: 'Copper', Length: '90 m' }],
  ['MRK-PERM-BLK', 'Permanent Marker, Black', 'IndSupply', 'industrial-stationery', 'piece', 18, 10, 700, 'marker', { Tip: 'Bullet', Colour: 'Black' }],
  ['TAPE-BOPP-48', 'BOPP Packing Tape 48mm x 65m', 'IndSupply', 'industrial-stationery', 'roll', 55, 6, 900, 'tape', { Width: '48 mm', Length: '65 m' }],
  ['PNE-PUSH-8', 'Pneumatic Push-in Fitting 8mm', 'IndSupply', 'hydraulics-pneumatics', 'piece', 65, 10, 450, 'fitting', { 'Tube size': '8 mm', Thread: '1/4" BSP' }],
  ['PNE-TUBE-8', 'Polyurethane Air Tube 8mm (Blue)', 'IndSupply', 'hydraulics-pneumatics', 'metre', 28, 20, 800, 'fitting', { 'Tube size': '8 mm', Material: 'Polyurethane' }],
  ['SEAL-THR-50', 'Anaerobic Thread Sealant 50ml', 'IndSupply', 'adhesives-sealants', 'piece', 310, 1, 120, 'sealant', { Volume: '50 ml', Strength: 'Medium' }],
  ['TAPE-MASK-24', 'Masking Tape 24mm x 20m', 'IndSupply', 'adhesives-sealants', 'roll', 30, 12, 1100, 'tape', { Width: '24 mm', Length: '20 m' }],
].map(([sku, name, brand, category, unit, price, moq, stock, art, specs], i) => ({
  id: `p-${i + 1}`, sku, name, brand, category, unit, price, moq, stock, art, specs, imageUrl: '', active: true,
  description: `${name} for general industrial and engineering use. Supplied by IndSupply with consistent quality and dependable availability.`,
  createdAt: iso(Date.now() - i * 86400000 * 3),
}));

const ADDRESS = { line1: 'Gut No. 42, Plot No. 22, Karodi Industrial Area, Waluj MIDC', city: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', pincode: '431136' };

const summarize = (items) => {
  const subtotal = round(items.reduce((s, i) => s + i.price * i.qty, 0));
  const gst = round(subtotal * GST_RATE);
  const delivery = subtotal === 0 ? 0 : subtotal >= FREE_DELIVERY_ABOVE ? 0 : 50;
  return { subtotal, gst, delivery, total: round(subtotal + gst + delivery), freeDeliveryAbove: FREE_DELIVERY_ABOVE };
};

function buildOrder(db, { userId, lines, address, paymentMethod, billingType = 'NON_GST', gstin = '', gstLegalName = '', deliveryType = 'BUSINESS', createdAt = new Date(), status = 'PLACED', paid = false }) {
  const items = lines.map(({ product: p, qty }) => ({ productId: p.id, name: p.name, sku: p.sku, unit: p.unit, price: p.price, qty, imageUrl: p.imageUrl, art: p.art, category: p.category }));
  const seq = ++db.seq;
  const idx = STEPS.indexOf(status);
  const timeline = status === 'CANCELLED'
    ? [{ status: 'PLACED', at: iso(createdAt) }, { status: 'CANCELLED', at: iso(+createdAt + 3600e3) }]
    : STEPS.slice(0, idx + 1).map((s, i) => ({ status: s, at: iso(+createdAt + i * 5 * 3600e3) }));
  return {
    id: `o-${seq}`, number: `IS-${createdAt.getFullYear()}-${String(seq).padStart(6, '0')}`, userId,
    createdAt: iso(createdAt), status, paymentMethod, paymentStatus: paid ? 'PAID' : 'PENDING',
    transactionId: paid ? `mock_txn_${seq}` : null, items, address, billingType, gstin, gstLegalName, deliveryType, summary: summarize(items), timeline,
  };
}

function seed() {
  const db = {
    seq: 120, products: PRODUCTS, categories: CATEGORIES, carts: {}, orders: [],
    users: [
      { id: 'u-admin', role: 'ADMIN', name: 'Store Admin', company: 'IndSupply', mobile: '9000000000', email: 'admin@indsupply.in', password: 'admin123', address: ADDRESS, createdAt: iso(Date.now() - 90 * 86400000) },
      { id: 'u-demo', role: 'CUSTOMER', name: 'Rajesh Kumar', company: 'Kumar Fabricators Pvt. Ltd.', mobile: '9876543210', email: 'demo@indsupply.in', password: 'demo123', address: ADDRESS, createdAt: iso(Date.now() - 60 * 86400000) },
    ],
  };
  const pick = (i) => db.products[i % db.products.length];
  const statuses = ['PLACED', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERED', 'CANCELLED', 'DELIVERED', 'DELIVERED', 'DELIVERED', 'DELIVERED'];
  statuses.forEach((status, i) => {
    const lines = [{ product: pick(i), qty: pick(i).moq * (1 + (i % 3)) }, { product: pick(i + 7), qty: pick(i + 7).moq }];
    db.orders.push(buildOrder(db, { userId: 'u-demo', lines, address: ADDRESS, paymentMethod: i % 2 ? 'COD' : 'UPI_ONLINE', createdAt: new Date(Date.now() - (i * 1.4 + 0.2) * 86400000), status, paid: status === 'DELIVERED' }));
  });
  return db;
}

let db = (() => { try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch { /* no storage */ } return seed(); })();
/** Test helper: restore the seed data. */
export const resetMockDb = () => { db = seed(); try { localStorage.removeItem(KEY); } catch { /* no storage */ } };
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* no storage */ } };
const out = (v) => new Promise((res) => setTimeout(() => res(v === undefined ? v : JSON.parse(JSON.stringify(v))), 120));

const publicUser = ({ password, ...u }) => u;
const tokenFor = (u) => `mock.${u.id}`;
const userFrom = (token) => db.users.find((u) => token === `mock.${u.id}`);
const needUser = (c) => c.user || fail(401, 'Please log in to continue.');
const needAdmin = (c) => { needUser(c); if (c.user.role !== 'ADMIN') fail(403, 'Admin access only.'); };
const findUser = (idf) => db.users.find((u) => u.email?.toLowerCase() === String(idf).toLowerCase() || u.mobile === String(idf));

const productView = (p) => { const { moq, ...publicProduct } = p; return { ...publicProduct, inStock: p.stock > 0 }; };
const categoryName = (slug) => db.categories.find((c) => c.slug === slug)?.name || slug;

function cartView(userId) {
  const lines = db.carts[userId] || [];
  const items = lines.map((l) => {
    const p = db.products.find((x) => x.id === l.productId);
    return { productId: p.id, name: p.name, sku: p.sku, unit: p.unit, price: p.price, moq: 1, stock: p.stock, imageUrl: p.imageUrl, art: p.art, category: p.category, qty: l.qty, subtotal: round(p.price * l.qty) };
  });
  return { items, summary: summarize(items), count: items.length };
}

function checkQty(p, qty) {
  if (!p || !p.active) fail(404, 'Product not found.');
  if (!Number.isInteger(qty) || qty < 1) fail(422, 'Enter a valid quantity.');
  if (qty > p.stock) fail(422, p.stock ? `Only ${p.stock} available in stock.` : 'This item is out of stock.');
}

const routes = [];
const route = (method, pattern, fn) => routes.push([method, new RegExp(`^${pattern}$`), fn]);

// ---- auth
const session = (u) => ({ token: tokenFor(u), user: publicUser(u) });
route('POST', '/auth/register', ({ body: b }) => {
  const errors = {};
  if (!b.name?.trim()) errors.name = 'Enter your name';
  if (!/^[6-9]\d{9}$/.test(b.mobile || '')) errors.mobile = 'Enter a valid 10-digit mobile number';
  if (b.email && !/^\S+@\S+\.\S+$/.test(b.email)) errors.email = 'Enter a valid email address';
  if (!b.password || b.password.length < 6) errors.password = 'Use at least 6 characters';
  if (Object.keys(errors).length) fail(422, 'Please fix the highlighted fields.', errors);
  if (findUser(b.mobile) || (b.email && findUser(b.email))) fail(409, 'An account with this mobile or email already exists. Try logging in.');
  const u = { id: `u-${Date.now()}`, role: 'CUSTOMER', name: b.name.trim(), company: b.company || '', mobile: b.mobile, email: b.email || '', gstin: '', gstLegalName: '', password: b.password, address: { line1: '', city: '', state: '', pincode: '' }, createdAt: iso(new Date()) };
  db.users.push(u); save();
  return session(u);
});
route('POST', '/auth/login', ({ body: b }) => {
  const u = findUser(b.identifier);
  if (!u || u.password !== b.password) fail(401, 'Mobile/email or password is incorrect.');
  return session(u);
});
route('POST', '/auth/otp/request', ({ body: b }) => {
  if (!findUser(b.identifier)) fail(404, 'No account found for this mobile/email. Register first.');
  return { sent: true, hint: 'Demo OTP: 123456' };
});
route('POST', '/auth/otp/verify', ({ body: b }) => {
  const u = findUser(b.identifier);
  if (!u || b.otp !== '123456') fail(401, 'The OTP is incorrect or expired.');
  return session(u);
});
route('POST', '/auth/forgot-password', () => ({ sent: true }));
route('POST', '/auth/logout', () => null);
route('GET', '/auth/me', (c) => publicUser(needUser(c)));

// ---- catalog
route('GET', '/categories', () => db.categories.map((c) => ({ ...c, productCount: db.products.filter((p) => p.active && p.category === c.slug).length })));
route('GET', '/products', ({ params: q }) => {
  const term = (q.q || '').toLowerCase().trim();
  let list = db.products.filter((p) => p.active);
  if (q.category) list = list.filter((p) => p.category === q.category);
  if (term) list = list.filter((p) => [p.name, p.sku, p.brand, categoryName(p.category)].some((f) => f.toLowerCase().includes(term)));
  const facets = {
    brands: Object.entries(list.reduce((m, p) => ({ ...m, [p.brand]: (m[p.brand] || 0) + 1 }), {})).map(([name, count]) => ({ name, count })),
    inStock: list.filter((p) => p.stock > 0).length, outOfStock: list.filter((p) => p.stock <= 0).length,
  };
  if (q.brand) { const bs = String(q.brand).split(','); list = list.filter((p) => bs.includes(p.brand)); }
  if (q.minPrice) list = list.filter((p) => p.price >= +q.minPrice);
  if (q.maxPrice) list = list.filter((p) => p.price <= +q.maxPrice);
  if (q.inStock === 'true') list = list.filter((p) => p.stock > 0);
  if (q.featured) { // one popular, well-stocked item per category so the home page shows variety
    const seen = new Set();
    list = [...list].sort((a, b) => b.stock - a.stock).filter((p) => p.stock > 0 && !seen.has(p.category) && seen.add(p.category));
  }
  const score = (p) => (p.name.toLowerCase().startsWith(term) ? 3 : p.sku.toLowerCase().includes(term) ? 2 : 1);
  const sorters = { price_asc: (a, b) => a.price - b.price, price_desc: (a, b) => b.price - a.price, newest: (a, b) => b.createdAt.localeCompare(a.createdAt) };
  if (sorters[q.sort]) list = [...list].sort(sorters[q.sort]); else if (term) list = [...list].sort((a, b) => score(b) - score(a));
  const pageSize = +q.pageSize || 12, page = +q.page || 1;
  return { items: list.slice((page - 1) * pageSize, page * pageSize).map((p) => ({ ...productView(p), categoryName: categoryName(p.category) })), total: list.length, page, pageSize, facets };
});
route('GET', '/products/([^/]+)', ({ args: [id] }) => {
  const p = db.products.find((x) => x.id === id && x.active) || fail(404, 'Product not found.');
  return { ...productView(p), categoryName: categoryName(p.category) };
});

// ---- cart
route('GET', '/cart', (c) => cartView(needUser(c).id));
route('POST', '/cart/items', (c) => {
  const u = needUser(c), p = db.products.find((x) => x.id === c.body.productId);
  const cart = (db.carts[u.id] ||= []);
  const line = cart.find((l) => l.productId === p?.id);
  const qty = (line?.qty || 0) + Number(c.body.qty);
  checkQty(p, qty);
  if (line) line.qty = qty; else cart.push({ productId: p.id, qty });
  save(); return cartView(u.id);
});
route('PATCH', '/cart/items/([^/]+)', (c) => {
  const u = needUser(c), line = (db.carts[u.id] || []).find((l) => l.productId === c.args[0]) || fail(404, 'Item is not in your cart.');
  checkQty(db.products.find((x) => x.id === line.productId), Number(c.body.qty));
  line.qty = Number(c.body.qty); save(); return cartView(u.id);
});
route('DELETE', '/cart/items/([^/]+)', (c) => {
  const u = needUser(c); db.carts[u.id] = (db.carts[u.id] || []).filter((l) => l.productId !== c.args[0]);
  save(); return cartView(u.id);
});

// ---- orders & payments
route('POST', '/orders', (c) => {
  const u = needUser(c), cart = db.carts[u.id] || [], a = c.body.address || {};
  if (!cart.length) fail(422, 'Your cart is empty.');
  const errors = {};
  if (!a.name?.trim()) errors.name = 'Enter the contact name';
  if (!/^[6-9]\d{9}$/.test(a.mobile || '')) errors.mobile = 'Enter a valid 10-digit mobile number';
  if (!a.line1?.trim()) errors.line1 = 'Enter the delivery address';
  if (!a.city?.trim()) errors.city = 'Enter the city';
  if (!/^\d{6}$/.test(a.pincode || '')) errors.pincode = 'Enter a 6-digit pincode';
  if (Object.keys(errors).length) fail(422, 'Please fix the delivery address.', errors);
  const lines = cart.map((l) => ({ product: db.products.find((p) => p.id === l.productId), qty: l.qty }));
  lines.forEach(({ product, qty }) => checkQty(product, qty)); // re-validate stock on the server
  const billingType = c.body.billingType === 'GST' ? 'GST' : 'NON_GST';
  const gstin = String(c.body.gstin || '').trim().toUpperCase();
  if (billingType === 'GST' && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin)) fail(422, 'Enter a valid 15-character GSTIN.', { gstin: 'Enter a valid GSTIN' });
  if (billingType === 'GST' && !String(c.body.gstLegalName || '').trim()) fail(422, 'Enter the GST registered legal name.', { gstLegalName: 'Enter the GST registered legal name' });
  lines.forEach(({ product, qty }) => { product.stock -= qty; });
  const order = buildOrder(db, { userId: u.id, lines, address: a, paymentMethod: c.body.paymentMethod || 'COD', billingType, gstin, gstLegalName: c.body.gstLegalName || '', deliveryType: c.body.deliveryType || 'BUSINESS' });
  db.orders.unshift(order); db.carts[u.id] = []; save();
  return order;
});
const ownOrder = (c, id) => db.orders.find((o) => o.id === id && (o.userId === c.user.id)) || fail(404, 'Order not found.');
route('GET', '/orders', (c) => { needUser(c); return db.orders.filter((o) => o.userId === c.user.id && (!c.params.status || o.status === c.params.status)); });
route('GET', '/orders/([^/]+)', (c) => { needUser(c); return ownOrder(c, c.args[0]); });
route('POST', '/orders/([^/]+)/cancel', (c) => {
  needUser(c); const o = ownOrder(c, c.args[0]);
  if (!['PLACED', 'CONFIRMED'].includes(o.status)) fail(409, 'This order has been packed or dispatched and can no longer be cancelled.');
  o.items.forEach((i) => { const p = db.products.find((x) => x.id === i.productId); if (p) p.stock += i.qty; });
  o.status = 'CANCELLED'; o.timeline.push({ status: 'CANCELLED', at: iso(new Date()) });
  if (o.paymentStatus === 'PAID') o.paymentStatus = 'REFUNDED';
  save(); return o;
});
route('POST', '/payments/create', (c) => {
  needUser(c); const o = ownOrder(c, c.body.orderId);
  return { orderId: o.id, gateway: 'mock', gatewayOrderId: `mock_order_${o.id}`, amount: o.summary.total, currency: 'INR' };
});
route('POST', '/payments/verify', (c) => {
  needUser(c); const o = ownOrder(c, c.body.orderId);
  o.paymentStatus = 'PAID'; o.transactionId = c.body.gatewayPaymentId; save(); return o;
});

// ---- customer & support
route('GET', '/customers/me', (c) => publicUser(needUser(c)));
route('PUT', '/customers/me', (c) => {
  const u = needUser(c), b = c.body;
  if (!b.name?.trim()) fail(422, 'Please fix the highlighted fields.', { name: 'Enter your name' });
  if (b.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(String(b.gstin).trim().toUpperCase())) fail(422, 'Enter a valid 15-character GSTIN.', { gstin: 'Enter a valid GSTIN' });
  Object.assign(u, { name: b.name.trim(), company: b.company ?? u.company, mobile: b.mobile || u.mobile, email: b.email ?? u.email, gstin: b.gstin ?? u.gstin ?? '', gstLegalName: b.gstLegalName ?? u.gstLegalName ?? '', address: { ...u.address, ...b.address } });
  save(); return publicUser(u);
});
route('POST', '/support', ({ body: b }) => {
  if (!b.message?.trim()) fail(422, 'Please fix the highlighted fields.', { message: 'Tell us how we can help' });
  return { ok: true };
});

// ---- admin
route('GET', '/admin/dashboard', (c) => {
  needAdmin(c);
  const live = db.orders.filter((o) => o.status !== 'CANCELLED');
  const days = [...Array(14)].map((_, i) => { const d = new Date(Date.now() - (13 - i) * 86400000); return d.toISOString().slice(0, 10); });
  return {
    totalOrders: db.orders.length,
    pendingOrders: db.orders.filter((o) => ['PLACED', 'CONFIRMED', 'PACKED'].includes(o.status)).length,
    salesAmount: round(live.reduce((s, o) => s + o.summary.total, 0)),
    customers: db.users.filter((u) => u.role === 'CUSTOMER').length,
    salesSeries: days.map((date) => ({ date, amount: round(live.filter((o) => o.createdAt.slice(0, 10) === date).reduce((s, o) => s + o.summary.total, 0)) })),
    recentOrders: db.orders.slice(0, 5).map((o) => ({ id: o.id, number: o.number, status: o.status, total: o.summary.total, customer: db.users.find((u) => u.id === o.userId)?.name || '' })),
    lowStock: db.products.filter((p) => p.stock <= 100).sort((a, b) => a.stock - b.stock).slice(0, 6).map((p) => ({ id: p.id, name: p.name, sku: p.sku, stock: p.stock, imageUrl: p.imageUrl, art: p.art, category: p.category })),
  };
});
route('GET', '/admin/products', (c) => {
  needAdmin(c); const t = (c.params.q || '').toLowerCase();
  return db.products.filter((p) => !t || p.name.toLowerCase().includes(t) || p.sku.toLowerCase().includes(t)).map((p) => ({ ...productView(p), categoryName: categoryName(p.category) }));
});
const readProduct = (b, existing) => {
  const errors = {};
  if (!b.name?.trim()) errors.name = 'Enter the product name';
  if (!b.sku?.trim()) errors.sku = 'Enter the item code';
  if (db.products.some((p) => p.sku === b.sku && p.id !== existing?.id)) errors.sku = 'This item code already exists';
  if (!(Number(b.price) >= 0) || b.price === '') errors.price = 'Enter a price';
  if (Object.keys(errors).length) fail(422, 'Please fix the highlighted fields.', errors);
  return { name: b.name.trim(), sku: b.sku.trim(), brand: b.brand || '', category: b.category, unit: b.unit || 'piece', price: Number(b.price), stock: Number(b.stock) || 0, description: b.description || '', imageUrl: b.imageUrl || '', active: b.active !== false, specs: b.specs || existing?.specs || {}, art: b.art ?? existing?.art ?? '' };
};
route('POST', '/admin/products', (c) => { needAdmin(c); const p = { id: `p-${Date.now()}`, createdAt: iso(new Date()), ...readProduct(c.body) }; db.products.unshift(p); save(); return productView(p); });
route('PUT', '/admin/products/([^/]+)', (c) => { needAdmin(c); const p = db.products.find((x) => x.id === c.args[0]) || fail(404, 'Product not found.'); Object.assign(p, readProduct(c.body, p)); save(); return productView(p); });
route('DELETE', '/admin/products/([^/]+)', (c) => { needAdmin(c); db.products = db.products.filter((p) => p.id !== c.args[0]); save(); return null; });
route('POST', '/admin/categories', (c) => {
  needAdmin(c); const name = c.body.name?.trim();
  if (!name) fail(422, 'Please fix the highlighted fields.', { name: 'Enter the category name' });
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (db.categories.some((x) => x.slug === slug)) fail(409, 'A category with this name already exists.');
  const cat = { slug, name, description: c.body.description || '', art: c.body.art || '' };
  db.categories.push(cat); save(); return cat;
});
route('PUT', '/admin/categories/([^/]+)', (c) => {
  needAdmin(c); const cat = db.categories.find((x) => x.slug === c.args[0]) || fail(404, 'Category not found.');
  if (!c.body.name?.trim()) fail(422, 'Please fix the highlighted fields.', { name: 'Enter the category name' });
  Object.assign(cat, { name: c.body.name.trim(), description: c.body.description ?? cat.description, art: c.body.art ?? cat.art }); save(); return cat;
});
route('DELETE', '/admin/categories/([^/]+)', (c) => {
  needAdmin(c);
  if (db.products.some((p) => p.category === c.args[0])) fail(409, 'Move or delete the products in this category first.');
  db.categories = db.categories.filter((x) => x.slug !== c.args[0]); save(); return null;
});
route('GET', '/admin/orders', (c) => { needAdmin(c); return db.orders.filter((o) => !c.params.status || o.status === c.params.status).map((o) => ({ ...o, customer: publicUser(db.users.find((u) => u.id === o.userId) || {}) })); });
route('PATCH', '/admin/orders/([^/]+)/status', (c) => {
  needAdmin(c); const o = db.orders.find((x) => x.id === c.args[0]) || fail(404, 'Order not found.');
  const s = c.body.status;
  if (![...STEPS, 'CANCELLED'].includes(s)) fail(422, 'Unknown order status.');
  o.status = s; o.timeline.push({ status: s, at: iso(new Date()) });
  if (s === 'DELIVERED' && o.paymentMethod === 'COD') o.paymentStatus = 'PAID';
  save(); return o;
});
route('GET', '/admin/customers', (c) => { needAdmin(c); return db.users.filter((u) => u.role === 'CUSTOMER').map((u) => ({ ...publicUser(u), orderCount: db.orders.filter((o) => o.userId === u.id).length })); });

export async function mockHandler(method, path, { params, body, token }) {
  for (const [m, re, fn] of routes) {
    const match = m === method && path.match(re);
    if (match) {
      const ctx = { params, body, args: match.slice(1), user: userFrom(token) };
      try { return await out(fn(ctx)); } catch (e) { await out(); throw e; }
    }
  }
  throw new ApiError(`Mock backend has no route for ${method} ${path}`, 404);
}
