import { Link, useOutletContext } from 'react-router-dom';
import { productApi } from '../api/services.js';
import { HeroArt, ProductArt } from '../components/art.jsx';
import { Icon } from '../components/icons.jsx';
import ProductCard from '../components/ProductCard.jsx';
import SearchBox from '../components/SearchBox.jsx';
import { Button, ErrorState, ProductGridSkeleton, Skeleton } from '../components/ui.jsx';
import { BUSINESS } from '../config.js';
import { useAsync } from '../lib/useAsync.js';
import { useDocumentTitle } from '../lib/useDocumentTitle.js';

const BENEFITS = [
  ['boxes', 'Wide range of products', 'Everything your plant needs'],
  ['offer', 'Bulk orders, best prices', 'Save more on large quantities'],
  ['shield', 'Secure payments', 'UPI and online payment options'],
  ['refresh', 'Easy returns', 'Hassle-free returns policy'],
  ['headset', '24×7 emergency support', 'Night-shift breakdown assistance'],
];
const STEPS = [
  ['search', 'Search or browse', 'Find items by name, code or category.'],
  ['cart', 'Add to cart', 'Set quantities and review totals.'],
  ['shield', 'Pay or place order', 'UPI, online, or pay on delivery.'],
  ['truck', 'Track delivery', 'Follow status until it reaches your gate.'],
];

function SectionHead({ title, to, link, sub }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div><h2 className="font-display text-xl font-bold sm:text-2xl">{title}</h2>{sub && <p className="mt-1 text-sm text-muted">{sub}</p>}</div>
      {to && <Link to={to} className="flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold hover:text-brand-dark">{link}<Icon name="chevronRight" size={16} /></Link>}
    </div>
  );
}

export default function Home() {
  useDocumentTitle('');
  const { categories } = useOutletContext();
  const popular = useAsync(() => productApi.list({ featured: true, pageSize: 6 }), []);
  return (
    <>
      <section className="mx-auto max-w-7xl px-3 pt-4 sm:px-4 sm:pt-6">
        <div className="grid items-center gap-2 overflow-hidden rounded-3xl bg-gradient-to-br from-white via-brand-50 to-brand-100 px-5 py-5 ring-1 ring-line sm:grid-cols-[1.1fr_.9fr] sm:px-8 sm:py-6 lg:grid-cols-[1.05fr_.95fr] lg:gap-6 lg:px-10 lg:py-7">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold ring-1 ring-line"><Icon name="truck" size={14} className="text-brand-dark" />{BUSINESS.deliveryNote}</p>
            <h1 className="mt-3 font-display text-[2rem] font-bold leading-[1.1] tracking-tight sm:text-5xl">Your trusted partner for industrial supplies</h1>
            <p className="mt-2 max-w-md text-sm text-muted sm:text-lg">Quality products. Reliable supply. On-time delivery to your factory.</p>
            <div className="mt-6 hidden max-w-xl lg:block"><SearchBox /></div>
            <ul className="mt-6 flex flex-wrap lg:mt-5 gap-x-5 gap-y-2 text-sm font-medium text-muted">
              {['No minimum order quantity', 'On-site delivery', '24×7 emergency support'].map((t) => <li key={t} className="flex items-center gap-1.5"><Icon name="check" size={16} className="text-emerald-700" />{t}</li>)}
            </ul>
          </div>
          <HeroArt className="mx-auto h-32 w-full max-w-[14rem] sm:h-44 sm:max-w-none lg:h-52" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 pt-10 sm:px-4 sm:pt-14">
        <SectionHead title="Shop by category" to="/categories" link="All categories" />
        <ul className="no-scrollbar -mx-3 flex snap-x gap-3 overflow-x-auto px-3 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 md:grid-cols-5 lg:grid-cols-9">
          {categories.length === 0 && [...Array(9)].map((_, i) => <li key={i} className="w-32 shrink-0 sm:w-auto"><Skeleton className="h-36" /></li>)}
          {categories.map((c) => (
            <li key={c.slug} className="w-32 shrink-0 snap-start sm:w-auto">
              <Link to={`/category/${c.slug}`} className="flex h-full flex-col items-center gap-2 rounded-2xl border bg-white p-3 text-center transition hover:-translate-y-0.5 hover:border-brand hover:shadow-soft">
                <ProductArt art={c.art} category={c.slug} className="aspect-[5/4] w-full rounded-xl bg-brand-50 p-1" />
                <span className="line-clamp-2 text-[13px] font-semibold leading-tight">{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-3 pt-10 sm:px-4 sm:pt-14">
        <SectionHead title="Popular products" sub="Well-stocked items our customers reorder most." to="/products" link="All products" />
        {popular.loading ? <ProductGridSkeleton count={6} className="lg:grid-cols-6 xl:grid-cols-6" /> : popular.error ? <ErrorState error={popular.error} onRetry={popular.reload} /> : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">{popular.data.items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-3 pt-10 sm:px-4 sm:pt-14">
        <SectionHead title="How ordering works" />
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([icon, title, text], i) => (
            <li key={title} className="flex items-start gap-4 rounded-2xl border bg-white p-5">
              <span className="relative grid size-12 shrink-0 place-items-center rounded-xl bg-brand-100"><Icon name={icon} size={22} /><span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-navy text-xs font-bold text-white">{i + 1}</span></span>
              <span><b className="block">{title}</b><span className="text-sm text-muted">{text}</span></span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-3 pt-10 sm:px-4 sm:pt-14">
        <div className="relative overflow-hidden rounded-3xl bg-navy p-6 text-white sm:p-10">
          <ProductArt art="box" className="pointer-events-none absolute -bottom-6 -right-4 hidden w-72 opacity-20 sm:block" />
          <div className="relative max-w-xl">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Need a large quantity or a regular supply?</h2>
            <p className="mt-2 text-slate-300">Tell us what your plant uses each month. We'll confirm availability and share the best price.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button as={Link} to="/contact?subject=bulk">Send a bulk enquiry</Button>
              <Button as="a" href={`https://wa.me/${BUSINESS.whatsapp}`} target="_blank" rel="noreferrer" className="border border-white/60 bg-transparent text-white hover:bg-white/10"><Icon name="whatsapp" size={18} /> WhatsApp us</Button>
            </div>
          </div>
        </div>
        <ul className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border bg-white p-5 sm:grid-cols-2 lg:grid-cols-5">
          {BENEFITS.map(([icon, title, text]) => (
            <li key={title} className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-100"><Icon name={icon} size={20} /></span>
              <span><b className="block text-sm">{title}</b><span className="text-xs text-muted">{text}</span></span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
