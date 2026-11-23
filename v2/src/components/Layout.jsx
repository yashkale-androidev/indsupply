import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { categoryApi } from '../api/services.js';
import { BUSINESS } from '../config.js';
import { useAuth, useCart } from '../context/AppContext.jsx';
import { cn, money } from '../lib/format.js';
import { useAsync } from '../lib/useAsync.js';
import { ProductArt } from './art.jsx';
import { Icon } from './icons.jsx';
import SearchBox from './SearchBox.jsx';
import { Button, Sheet } from './ui.jsx';

export function Logo({ className, light }) {
  return (
    <Link to="/" aria-label="IndSupply home" className={cn('inline-block py-2 font-display text-2xl font-bold leading-none tracking-tight sm:text-3xl', light ? 'text-white' : 'text-navy', className)}>
      Ind<span className="text-brand">Supply</span><span className="text-sm font-semibold text-brand-dark">.in</span>
    </Link>
  );
}

const telHref = `tel:${BUSINESS.phone.replace(/\s/g, '')}`;

function CategoryMenu({ categories }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', away); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)} className="flex min-h-12 items-center gap-2 bg-brand px-5 text-sm font-semibold text-navy hover:bg-brand-dark">
        <Icon name="menu" size={18} /> All Categories <Icon name="chevronDown" size={16} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="anim-sheet absolute left-0 top-full z-50 w-[min(760px,92vw)] rounded-b-2xl border bg-white p-4 shadow-lift">
          <ul className="grid grid-cols-3 gap-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link to={`/category/${c.slug}`} className="flex items-center gap-3 rounded-xl p-2.5 text-navy hover:bg-brand-50">
                  <ProductArt art={c.art} category={c.slug} className="size-14 shrink-0 rounded-lg bg-brand-50 p-1" />
                  <span><b className="block text-sm">{c.name}</b><span className="line-clamp-1 text-xs text-muted">{c.description}</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function MobileMenu({ open, onClose, categories }) {
  const { user, signOut } = useAuth();
  const row = 'flex min-h-12 items-center gap-3 rounded-lg px-3 text-[15px] font-medium hover:bg-brand-50';
  return (
    <Sheet open={open} onClose={onClose} title="Menu">
      <div className="space-y-1 p-3" onClick={(e) => e.target.closest('a') && onClose()}>
        <div className="mb-2 rounded-xl bg-brand-100 p-4">
          {user ? (
            <><p className="font-semibold">Hello, {user.name.split(' ')[0]}</p><p className="text-xs text-muted">{user.company || user.email}</p></>
          ) : (
            <><p className="font-semibold">Welcome to IndSupply</p><Button as={Link} to="/login" className="mt-3 w-full">Login / Register</Button></>
          )}
        </div>
        <Link to="/" className={row}><Icon name="home" size={20} /> Home</Link>
        <Link to="/products" className={row}><Icon name="boxes" size={20} /> All Products</Link>
        <Link to="/account/orders" className={row}><Icon name="truck" size={20} /> Track Order</Link>
        <Link to="/contact?subject=bulk" className={row}><Icon name="offer" size={20} /> Bulk Enquiry</Link>
        <Link to="/contact" className={row}><Icon name="headset" size={20} /> Contact Us</Link>
        <p className="px-3 pb-1 pt-4 text-sm font-semibold text-muted">Shop by category</p>
        {categories.map((c) => (
          <Link key={c.slug} to={`/category/${c.slug}`} className={row}>
            <ProductArt art={c.art} category={c.slug} className="size-10 shrink-0 rounded-lg bg-brand-50 p-0.5" />{c.name}
          </Link>
        ))}
        {user && <button type="button" onClick={() => { onClose(); signOut(); }} className={cn(row, 'w-full text-left text-red-800')}><Icon name="logout" size={20} /> Logout</button>}
      </div>
    </Sheet>
  );
}

function Header({ categories }) {
  const { user } = useAuth();
  const { cart } = useCart();
  const [menu, setMenu] = useState(false);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const on = () => setStuck(window.scrollY > 8);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const account = user ? (user.role === 'ADMIN' ? '/admin' : '/account/profile') : '/login';
  return (
    <>
      <header className={cn('sticky top-0 z-40 border-b bg-white transition-shadow', stuck && 'shadow-soft')}>
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:px-4 lg:gap-6 lg:py-4">
          <button type="button" aria-label="Open menu" onClick={() => setMenu(true)} className="grid size-11 place-items-center rounded-lg hover:bg-brand-100 lg:hidden"><Icon name="menu" size={24} /></button>
          <div className="flex flex-col"><Logo /><span className="mt-1 hidden text-xs text-muted lg:block">{BUSINESS.tagline}</span></div>
          <div className="mx-auto hidden w-full max-w-2xl flex-1 lg:block"><SearchBox categories={categories} withCategory /></div>
          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <Link to={account} className="flex min-h-11 items-center gap-2 rounded-lg px-2.5 text-sm font-semibold hover:bg-brand-100">
              <Icon name="user" size={24} /><span className="hidden text-left leading-tight lg:block"><span className="block text-xs font-normal text-muted">{user ? 'Account' : 'Welcome'}</span>{user ? user.name.split(' ')[0] : 'Login / Register'}</span>
              <span className="sr-only lg:hidden">{user ? 'Account' : 'Login or register'}</span>
            </Link>
            <Link to="/cart" aria-label={`Cart, ${cart.count} ${cart.count === 1 ? 'item' : 'items'}`} className="flex min-h-11 items-center gap-2 rounded-lg px-2.5 hover:bg-brand-100">
              <span className="relative"><Icon name="cart" size={26} />
                {cart.count > 0 && <span key={cart.count} className="anim-pop absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-brand text-xs font-bold text-navy">{cart.count}</span>}
              </span>
              <span className="hidden text-left text-xs leading-tight lg:block"><span className="block text-muted">My Cart</span><span className="text-sm font-semibold">{money(cart.summary.subtotal)}</span></span>
            </Link>
          </div>
        </div>
        <div className="px-3 pb-2.5 sm:px-4 lg:hidden"><SearchBox /></div>
      </header>
      <MobileMenu open={menu} onClose={() => setMenu(false)} categories={categories} />
    </>
  );
}

function DesktopNav({ categories }) {
  const link = ({ isActive }) => cn('flex min-h-12 items-center border-b-[3px] px-1 text-sm font-medium transition-colors', isActive ? 'border-brand text-brand' : 'border-transparent text-white hover:text-brand');
  return (
    <nav aria-label="Main" className="hidden bg-navy lg:block">
      <div className="mx-auto flex max-w-7xl items-center gap-8 px-4">
        <CategoryMenu categories={categories} />
        <NavLink to="/" end className={link}>Home</NavLink>
        <NavLink to="/products" className={link}>Products</NavLink>
        <NavLink to="/categories" className={link}>Categories</NavLink>
        <NavLink to="/contact?subject=bulk" className={link}>Bulk Enquiry</NavLink>
        <NavLink to="/info/about" className={link}>About Us</NavLink>
        <NavLink to="/contact" end className={link}>Contact Us</NavLink>
        <NavLink to="/account/orders" className={cn(link({ isActive: false }), 'ml-auto gap-1.5')}><Icon name="truck" size={18} /> Track Order</NavLink>
      </div>
    </nav>
  );
}

function TabBar() {
  const { cart } = useCart();
  const { user } = useAuth();
  const tab = ({ isActive }) => cn('relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold', isActive ? 'text-navy' : 'text-muted');
  const items = [['/', 'Home', 'home', true], ['/categories', 'Categories', 'grid'], ['/cart', 'Cart', 'cart'], ['/account/orders', 'Orders', 'truck'], [user ? '/account/profile' : '/login', user ? 'Account' : 'Login', 'user']];
  return (
    <nav aria-label="Quick navigation" className="pb-safe fixed inset-x-0 bottom-0 z-40 flex border-t bg-white/95 backdrop-blur lg:hidden">
      {items.map(([to, label, icon, end]) => (
        <NavLink key={label} to={to} end={end} className={tab}>
          {({ isActive }) => (
            <>
              {isActive && <span className="absolute inset-x-5 top-0 h-[3px] rounded-b bg-brand" />}
              <span className="relative"><Icon name={icon} size={22} />{icon === 'cart' && cart.count > 0 && <span className="absolute -right-2.5 -top-1.5 grid size-4 place-items-center rounded-full bg-brand text-[10px] font-bold text-navy">{cart.count}</span>}</span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function Footer() {
  const col = 'flex flex-col gap-1 text-sm text-slate-300 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a:hover]:text-brand';
  return (
    <footer className="mt-16 bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.4fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">IndSupply.in is a B2B platform for industrial hardware, tools and consumables, with dependable local delivery for small and medium manufacturers.</p>
          <a href={`https://wa.me/${BUSINESS.whatsapp}`} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-white/10 px-4 text-sm font-semibold hover:bg-white/20"><Icon name="whatsapp" size={18} /> Chat on WhatsApp</a>
        </div>
        <div className={col}><b className="mb-1 text-white">Shop</b><Link to="/products">All Products</Link><Link to="/categories">Categories</Link><Link to="/contact?subject=bulk">Bulk Enquiry</Link><Link to="/cart">My Cart</Link></div>
        <div className={col}><b className="mb-1 text-white">Information</b><Link to="/info/about">About Us</Link><Link to="/info/delivery">Delivery Information</Link><Link to="/info/returns">Returns &amp; Refunds</Link><Link to="/info/privacy">Privacy Policy</Link><Link to="/info/terms">Terms &amp; Conditions</Link></div>
        <div className={col}><b className="mb-1 text-white">My Account</b><Link to="/login">Login / Register</Link><Link to="/account/orders">My Orders</Link><Link to="/account/profile">My Profile</Link><Link to="/account/orders">Track Order</Link></div>
        <div className={col}>
          <b className="mb-1 text-white">Contact Us</b>
          <span className="py-1">{BUSINESS.address}</span>
          <a href={telHref}><Icon name="phone" size={15} className="mr-2" />{BUSINESS.phone}</a>
          <a href={`mailto:${BUSINESS.email}`}><Icon name="mail" size={15} className="mr-2" />{BUSINESS.email}</a>
          <span className="flex items-center gap-2 py-1"><Icon name="clock" size={15} />{BUSINESS.hours}</span>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-slate-300">
          <span>© {new Date().getFullYear()} IndSupply.in. All rights reserved.</span>
          <span className="flex flex-wrap gap-2">{['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net banking'].map((t) => <span key={t} className="rounded border border-white/20 px-2 py-0.5">{t}</span>)}</span>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  const { data } = useAsync(() => categoryApi.list(), []);
  const categories = data || [];
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div className="flex min-h-screen flex-col pb-16 lg:pb-0">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[90] focus:rounded focus:bg-brand focus:px-3 focus:py-2">Skip to content</a>
      <div className="hidden bg-navy text-xs text-white md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2">
          <span className="flex items-center gap-5">
            <a href={telHref} className="flex items-center gap-1.5 hover:text-brand"><Icon name="phone" size={13} />{BUSINESS.phone}</a>
            <a href={`mailto:${BUSINESS.email}`} className="flex items-center gap-1.5 hover:text-brand"><Icon name="mail" size={13} />{BUSINESS.email}</a>
          </span>
          <span className="flex items-center gap-1.5"><Icon name="truck" size={13} />{BUSINESS.deliveryNote}</span>
          <Link to="/contact?subject=bulk" className="flex items-center gap-1.5 font-medium text-brand hover:underline"><Icon name="offer" size={13} />Bulk orders? Get best prices</Link>
        </div>
      </div>
      <Header categories={categories} />
      <DesktopNav categories={categories} />
      <main id="main" className="flex-1"><Outlet context={{ categories }} /></main>
      <Footer />
      <TabBar />
    </div>
  );
}
