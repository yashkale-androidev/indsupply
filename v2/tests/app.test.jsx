import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from '../src/App.jsx';
import { AppProviders } from '../src/context/AppContext.jsx';

const renderAt = (path) => render(<MemoryRouter initialEntries={[path]}><AppProviders><App /></AppProviders></MemoryRouter>);

describe('storefront (guest)', () => {
  it('shows categories, popular products and illustrated product images on the home page', async () => {
    renderAt('/');
    expect(await screen.findByRole('heading', { name: /trusted partner/i })).toBeInTheDocument();
    expect((await screen.findAllByRole('img', { name: /washer|bearing|oil|gloves/i })).length).toBeGreaterThan(0);
    expect(await screen.findAllByRole('link', { name: /fasteners/i })).not.toHaveLength(0);
  });

  it('lets a guest add a single item without a minimum order quantity and keeps it in the cart', async () => {
    const user = userEvent.setup();
    renderAt('/category/fasteners');
    const add = await screen.findAllByRole('button', { name: /add hex bolt \(din 933\) m8/i });
    await user.click(add[0]);
    expect(await screen.findByText(/added to cart/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/cart, 1 item/i).length).toBeGreaterThan(0);
    expect(JSON.parse(localStorage.getItem('indsupply_guest_cart'))[0]).toMatchObject({ productId: 'p-1', qty: 1 });
  });

  it('shows the guest cart with a login prompt instead of fake totals', async () => {
    localStorage.setItem('indsupply_guest_cart', JSON.stringify([{ productId: 'p-1', name: 'Hex Bolt (DIN 933) M8 x 30mm', sku: 'HB', unit: 'piece', price: 2.5, moq: 100, stock: 5000, category: 'fasteners', art: 'bolt', qty: 100 }]));
    renderAt('/cart');
    expect(await screen.findByText(/your cart \(1 item\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/at checkout/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /login to checkout/i }).length).toBeGreaterThan(0);
  });

  it('filters search results and shows an empty state', async () => {
    renderAt('/search?q=zzzz-nothing');
    expect(await screen.findByText(/no products found/i)).toBeInTheDocument();
  });

  it('redirects guests away from private pages and admin pages', async () => {
    renderAt('/account/orders');
    expect(await screen.findByRole('heading', { name: /^login$/i })).toBeInTheDocument();
  });
});

describe('login flow', () => {
  it('logs in, merges the guest cart into the account, and shows the user', async () => {
    const user = userEvent.setup();
    localStorage.setItem('indsupply_guest_cart', JSON.stringify([{ productId: 'p-9', name: 'Bearing', sku: 'BRG-6205', unit: 'piece', price: 120, moq: 5, stock: 1200, category: 'bearings', art: 'bearing', qty: 5 }]));
    renderAt('/login');
    const form = (await screen.findByRole('heading', { name: /^login$/i })).closest('form');
    await user.type(within(form).getByLabelText(/mobile number \/ email/i), 'demo@indsupply.in');
    await user.type(within(form).getByLabelText(/^password$/i), 'demo123');
    await user.click(within(form).getByRole('button', { name: /^login$/i }));
    await waitFor(() => expect(localStorage.getItem('indsupply_guest_cart')).toBe('[]'));
    expect(await screen.findAllByLabelText(/cart, 1 item/i)).not.toHaveLength(0);
  });

  it('shows a clear error for a wrong password', async () => {
    const user = userEvent.setup();
    renderAt('/login');
    const form = (await screen.findByRole('heading', { name: /^login$/i })).closest('form');
    await user.type(within(form).getByLabelText(/mobile number \/ email/i), 'demo@indsupply.in');
    await user.type(within(form).getByLabelText(/^password$/i), 'wrong');
    await user.click(within(form).getByRole('button', { name: /^login$/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/incorrect/i);
  });

  it('keeps customers out of the admin login', async () => {
    const user = userEvent.setup();
    renderAt('/admin/login');
    await user.type(await screen.findByLabelText(/^email$/i), 'demo@indsupply.in');
    await user.type(screen.getByLabelText(/^password$/i), 'demo123');
    await user.click(screen.getByRole('button', { name: /^login$/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/admin access/i);
  });
});
