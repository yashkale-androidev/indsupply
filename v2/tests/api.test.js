// Contract tests for the mock backend. Point the same assertions at your real API when it exists.
import { beforeEach, describe, expect, it } from 'vitest';
import { adminApi, authApi, cartApi, categoryApi, orderApi, paymentApi, productApi } from '../src/api/services.js';
import { tokenStore } from '../src/api/http.js';

const ADDRESS = { name: 'Rajesh', mobile: '9876543210', line1: 'Plot 12', city: 'Pune', pincode: '411018' };
const login = async (identifier, password) => { const r = await authApi.login({ identifier, password }); tokenStore.set(r.token); return r; };

describe('auth', () => {
  it('logs in with email or mobile and rejects a wrong password', async () => {
    expect((await login('demo@indsupply.in', 'demo123')).user.role).toBe('CUSTOMER');
    expect((await login('9876543210', 'demo123')).user.email).toBe('demo@indsupply.in');
    await expect(authApi.login({ identifier: 'demo@indsupply.in', password: 'nope' })).rejects.toMatchObject({ status: 401 });
  });
  it('validates registration fields and blocks duplicates', async () => {
    await expect(authApi.register({ name: '', mobile: '123', password: '1' })).rejects.toMatchObject({ status: 422, details: { name: expect.any(String), mobile: expect.any(String), password: expect.any(String) } });
    await expect(authApi.register({ name: 'X', mobile: '9876543210', password: 'secret1' })).rejects.toMatchObject({ status: 409 });
    const ok = await authApi.register({ name: 'New Buyer', mobile: '9123456780', password: 'secret1' });
    expect(ok.token).toBeTruthy();
  });
  it('protects private endpoints', async () => {
    tokenStore.clear();
    await expect(cartApi.get()).rejects.toMatchObject({ status: 401 });
    await login('demo@indsupply.in', 'demo123');
    await expect(adminApi.dashboard()).rejects.toMatchObject({ status: 403 });
  });
});

describe('catalogue', () => {
  it('lists categories with product counts', async () => {
    const cats = await categoryApi.list();
    expect(cats.length).toBeGreaterThanOrEqual(9);
    expect(cats.every((c) => c.art && c.productCount > 0)).toBe(true);
  });
  it('searches by name, SKU and brand', async () => {
    expect((await productApi.list({ q: 'bearing' })).items.every((p) => /bearing/i.test(p.name))).toBe(true);
    expect((await productApi.list({ q: 'BRG-6205' })).items[0].sku).toBe('BRG-6205');
    expect((await productApi.list({ q: 'taparia' })).total).toBeGreaterThan(0);
  });
  it('filters, sorts and paginates', async () => {
    const r = await productApi.list({ category: 'fasteners', brand: 'Unbrako', inStock: 'true' });
    expect(r.items.every((p) => p.brand === 'Unbrako' && p.stock > 0)).toBe(true);
    const asc = (await productApi.list({ sort: 'price_asc', pageSize: 50 })).items.map((p) => p.price);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    const page2 = await productApi.list({ pageSize: 10, page: 2 });
    expect(page2.items).toHaveLength(10);
    expect(page2.total).toBeGreaterThan(20);
  });
  it('returns facets for the filter panel', async () => {
    const r = await productApi.list({ category: 'bearings' });
    expect(r.facets.brands[0]).toMatchObject({ name: expect.any(String), count: expect.any(Number) });
  });
});

describe('cart rules', () => {
  beforeEach(async () => { await login('demo@indsupply.in', 'demo123'); });
  it('allows any positive quantity without an MOQ while enforcing stock', async () => {
    const smallOrder = await cartApi.add('p-1', 1);
    expect(smallOrder.items[0].qty).toBe(1);
    await cartApi.remove('p-1');
    await expect(cartApi.add('p-17', 1)).rejects.toMatchObject({ message: expect.stringMatching(/out of stock/i) });
    await expect(cartApi.add('p-10', 500)).rejects.toMatchObject({ message: expect.stringMatching(/Only 60/) });
  });
  it('adds, updates and removes lines with server-side totals', async () => {
    let cart = await cartApi.add('p-1', 100);
    expect(cart.summary).toMatchObject({ subtotal: 250, gst: 45, delivery: 50, total: 345 });
    cart = await cartApi.update('p-1', 200);
    expect(cart.items[0].subtotal).toBe(500);
    cart = await cartApi.remove('p-1');
    expect(cart.count).toBe(0);
  });
  it('gives free delivery above the threshold', async () => {
    const cart = await cartApi.add('p-20', 4);
    expect(cart.summary.delivery).toBe(0);
    expect(cart.summary.freeDeliveryAbove).toBe(5000);
  });
});

describe('orders and payments', () => {
  beforeEach(async () => { await login('demo@indsupply.in', 'demo123'); });
  it('rejects an empty cart and a bad address', async () => {
    await expect(orderApi.create({ address: ADDRESS, paymentMethod: 'COD' })).rejects.toMatchObject({ message: /empty/i });
    await cartApi.add('p-9', 5);
    await expect(orderApi.create({ address: { ...ADDRESS, pincode: '12' }, paymentMethod: 'COD' })).rejects.toMatchObject({ status: 422, details: { pincode: expect.any(String) } });
  });
  it('places an order, reduces stock, and clears the cart', async () => {
    const before = (await productApi.get('p-9')).stock;
    await cartApi.add('p-9', 5);
    const order = await orderApi.create({ address: ADDRESS, paymentMethod: 'UPI_ONLINE' });
    expect(order).toMatchObject({ status: 'PLACED', paymentStatus: 'PENDING' });
    expect(order.number).toMatch(/^IS-\d{4}-\d{6}$/);
    expect((await productApi.get('p-9')).stock).toBe(before - 5);
    expect((await cartApi.get()).count).toBe(0);
  });
  it('persists GST billing and work-site delivery choices on an order', async () => {
    await cartApi.add('p-9', 1);
    const order = await orderApi.create({ address: ADDRESS, paymentMethod: 'COD', billingType: 'GST', gstin: '27ABCDE1234F1Z5', gstLegalName: 'Example Fabricators Pvt Ltd', deliveryType: 'WORK_SITE' });
    expect(order).toMatchObject({ billingType: 'GST', gstin: '27ABCDE1234F1Z5', gstLegalName: 'Example Fabricators Pvt Ltd', deliveryType: 'WORK_SITE' });
  });
  it('marks an online order paid after verification', async () => {
    await cartApi.add('p-9', 5);
    const order = await orderApi.create({ address: ADDRESS, paymentMethod: 'UPI_ONLINE' });
    const intent = await paymentApi.create(order.id);
    expect(intent.amount).toBe(order.summary.total);
    const paid = await paymentApi.verify({ orderId: order.id, gatewayPaymentId: 'pay_123' });
    expect(paid).toMatchObject({ paymentStatus: 'PAID', transactionId: 'pay_123' });
  });
  it('cancels only before packing and restores stock', async () => {
    await cartApi.add('p-9', 5);
    const before = (await productApi.get('p-9')).stock;
    const order = await orderApi.create({ address: ADDRESS, paymentMethod: 'COD' });
    const cancelled = await orderApi.cancel(order.id);
    expect(cancelled.status).toBe('CANCELLED');
    expect((await productApi.get('p-9')).stock).toBe(before);
    const delivered = (await orderApi.list({ status: 'DELIVERED' }))[0];
    await expect(orderApi.cancel(delivered.id)).rejects.toMatchObject({ status: 409 });
  });
  it("never shows another customer's orders", async () => {
    const mine = await orderApi.list();
    const reg = await authApi.register({ name: 'Other', mobile: '9000011111', password: 'secret1' });
    tokenStore.set(reg.token);
    expect(await orderApi.list()).toHaveLength(0);
    await expect(orderApi.get(mine[0].id)).rejects.toMatchObject({ status: 404 });
  });
});

describe('admin', () => {
  beforeEach(async () => { await login('admin@indsupply.in', 'admin123'); });
  it('shows dashboard figures and low stock', async () => {
    const d = await adminApi.dashboard();
    expect(d.totalOrders).toBeGreaterThan(0);
    expect(d.salesSeries).toHaveLength(14);
    expect(d.lowStock.every((p) => p.stock <= 100)).toBe(true);
  });
  it('validates and creates products, rejecting duplicate SKUs', async () => {
    await expect(adminApi.createProduct({ name: '', sku: '', price: '' })).rejects.toMatchObject({ status: 422 });
    const p = await adminApi.createProduct({ name: 'Test Bolt', sku: 'TST-1', category: 'fasteners', price: 9, stock: 50 });
    expect(p.inStock).toBe(true);
    await expect(adminApi.createProduct({ name: 'Dup', sku: 'TST-1', category: 'fasteners', price: 1 })).rejects.toMatchObject({ status: 422 });
    await adminApi.deleteProduct(p.id);
  });
  it('updates order status and records a timeline entry', async () => {
    const [o] = await adminApi.orders({ status: 'PLACED' });
    const next = await adminApi.updateOrderStatus(o.id, 'CONFIRMED');
    expect(next.timeline.at(-1).status).toBe('CONFIRMED');
    await expect(adminApi.updateOrderStatus(o.id, 'BOGUS')).rejects.toMatchObject({ status: 422 });
  });
  it('manages categories and blocks deleting a non-empty one', async () => {
    const c = await adminApi.createCategory({ name: 'Welding Supplies' });
    expect(c.slug).toBe('welding-supplies');
    await expect(adminApi.createCategory({ name: 'Welding Supplies' })).rejects.toMatchObject({ status: 409 });
    await expect(adminApi.deleteCategory('fasteners')).rejects.toMatchObject({ status: 409 });
    await adminApi.deleteCategory(c.slug);
  });
});
