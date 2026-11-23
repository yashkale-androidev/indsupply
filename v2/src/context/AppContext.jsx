import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi, cartApi } from '../api/services.js';
import { tokenStore } from '../api/http.js';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);
export const useAuth = () => { const { user, authReady, signIn, signOut, setUser } = useApp(); return { user, authReady, signIn, signOut, setUser }; };
export const useCart = () => { const { cart, cartAction, reloadCart } = useApp(); return { cart, ...cartAction, reload: reloadCart }; };
export const useToast = () => useApp().toast;

const EMPTY_CART = { items: [], summary: { subtotal: 0, gst: 0, delivery: 0, total: 0 }, count: 0 };
const GUEST_KEY = 'indsupply_guest_cart';
const readGuest = () => { try { return JSON.parse(localStorage.getItem(GUEST_KEY)) || []; } catch { return []; } };

/** Guests can build a cart before logging in. Totals (GST, delivery) are only calculated by the server after login. */
const guestView = (lines) => {
  const items = lines.map((l) => ({ ...l, subtotal: l.price * l.qty }));
  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  return { items, count: items.length, guest: true, summary: { subtotal, gst: null, delivery: null, total: null } };
};

export function AppProviders({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(!tokenStore.get());
  const [serverCart, setServerCart] = useState(EMPTY_CART);
  const [guestLines, setGuestLines] = useState(readGuest);
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const toast = useCallback((message, tone = 'info', action) => {
    const id = nextId.current++;
    setToasts((t) => [...t.slice(-2), { id, message, tone, action }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  useEffect(() => {
    if (!tokenStore.get()) return;
    authApi.me().then(setUser).catch(() => tokenStore.clear()).finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    const onExpired = () => { setUser(null); setServerCart(EMPTY_CART); toast('Your session expired. Please log in again.', 'error'); };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [toast]);

  useEffect(() => { try { localStorage.setItem(GUEST_KEY, JSON.stringify(guestLines)); } catch { /* ignore */ } }, [guestLines]);

  const reloadCart = useCallback(async () => {
    try { setServerCart(await cartApi.get()); } catch { setServerCart(EMPTY_CART); }
  }, []);

  // On login: move the guest cart into the customer's server cart, then load it.
  useEffect(() => {
    if (!user) { setServerCart(EMPTY_CART); return; }
    (async () => {
      const lines = readGuest();
      if (lines.length) {
        let moved = 0;
        for (const l of lines) { try { await cartApi.add(l.productId, l.qty); moved += 1; } catch { /* item may be out of stock now */ } }
        setGuestLines([]);
        if (moved) toast('Your cart items were added to your account.', 'success');
      }
      await reloadCart();
    })();
  }, [user, reloadCart, toast]);

  const signIn = useCallback(({ token, user: u }) => { tokenStore.set(token); setUser(u); }, []);
  const signOut = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    tokenStore.clear(); setUser(null); setServerCart(EMPTY_CART); navigate('/');
  }, [navigate]);

  const runServer = useCallback(async (fn, okMsg) => {
    try { setServerCart(await fn()); if (okMsg) toast(okMsg, 'success', { label: 'View cart', to: '/cart' }); return true; }
    catch (e) { toast(e.message, 'error'); return false; }
  }, [toast]);

  const guestAdd = useCallback((p, qty) => {
    const existing = guestLines.find((l) => l.productId === p.id);
    const next = (existing?.qty || 0) + qty;
    if (p.stock != null && next > p.stock) { toast(p.stock ? `Only ${p.stock} available in stock.` : 'This item is out of stock.', 'error'); return false; }
    const line = { productId: p.id, name: p.name, sku: p.sku, unit: p.unit, price: p.price, moq: 1, stock: p.stock, imageUrl: p.imageUrl, art: p.art, category: p.category, qty: next };
    setGuestLines((ls) => (existing ? ls.map((l) => (l.productId === p.id ? line : l)) : [...ls, line]));
    toast(`${p.name} added to cart`, 'success', { label: 'View cart', to: '/cart' });
    return true;
  }, [guestLines, toast]);

  const cart = useMemo(() => (user ? serverCart : guestView(guestLines)), [user, serverCart, guestLines]);

  const cartAction = useMemo(() => ({
    add: async (product, qty) => {
      const q = qty ?? 1;
      return user ? runServer(() => cartApi.add(product.id, q), `${product.name} added to cart`) : guestAdd(product, q);
    },
    update: async (productId, qty) => {
      if (user) return runServer(() => cartApi.update(productId, qty));
      setGuestLines((ls) => ls.map((l) => (l.productId === productId ? { ...l, qty } : l)));
      return true;
    },
    remove: async (productId) => {
      if (user) return runServer(() => cartApi.remove(productId), 'Item removed');
      setGuestLines((ls) => ls.filter((l) => l.productId !== productId));
      toast('Item removed');
      return true;
    },
  }), [user, runServer, guestAdd, toast]);

  const value = useMemo(() => ({ user, authReady, signIn, signOut, setUser, cart, cartAction, reloadCart, toast }), [user, authReady, signIn, signOut, cart, cartAction, reloadCart, toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-3 bottom-[4.75rem] z-[80] flex flex-col items-center gap-2 md:inset-x-auto md:bottom-5 md:right-5 md:items-end">
        {toasts.map((t) => (
          <div key={t.id} role="status" className={`anim-sheet pointer-events-auto flex max-w-md items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium shadow-lift ${t.tone === 'error' ? 'bg-red-800 text-white' : t.tone === 'success' ? 'bg-navy text-white' : 'bg-white text-navy ring-1 ring-edge'}`}>
            <span>{t.message}</span>
            {t.action && <Link to={t.action.to} className="shrink-0 font-bold text-brand underline-offset-2 hover:underline">{t.action.label}</Link>}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
