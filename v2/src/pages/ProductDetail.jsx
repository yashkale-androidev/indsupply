import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productApi } from '../api/services.js';
import { useCart } from '../context/AppContext.jsx';
import { Icon } from '../components/icons.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { Breadcrumbs, Button, ErrorState, Skeleton, ProductImage, QtyStepper, StockBadge } from '../components/ui.jsx';
import { money } from '../lib/format.js';
import { useAsync } from '../lib/useAsync.js';
import { useDocumentTitle } from '../lib/useDocumentTitle.js';

const TRUST = [['truck', 'Local delivery', 'Straight to your factory gate'], ['shield', 'Secure payment', 'UPI, cards and net banking'], ['refresh', 'Easy returns', 'See our returns policy']];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { data: p, loading, error, reload } = useAsync(() => productApi.get(id), [id]);
  const related = useAsync(() => (p ? productApi.list({ category: p.category, pageSize: 5 }) : Promise.resolve(null)), [p?.category]);
  const [qty, setQty] = useState(1);
  useEffect(() => { if (p) setQty(1); }, [p]);
  useDocumentTitle(p?.name);

  if (loading) return (
    <div className="mx-auto grid max-w-7xl gap-8 px-3 py-8 sm:px-4 lg:grid-cols-2"><Skeleton className="aspect-[5/4] w-full" /><div className="space-y-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-5 w-1/2" /><Skeleton className="h-10 w-1/3" /><Skeleton className="h-40 w-full" /></div></div>
  );
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const out = p.stock <= 0;
  const step = 1;
  const specs = { Brand: p.brand, Unit: p.unit, ...p.specs };
  const buyNow = async () => { if (await add(p, qty)) navigate('/checkout'); };
  const related4 = related.data?.items.filter((x) => x.id !== p.id).slice(0, 4) || [];

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 pb-28 sm:px-4 sm:py-8 lg:pb-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: p.categoryName, to: `/category/${p.category}` }, { label: p.name }]} />
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductImage product={p} className="aspect-[4/3] w-full rounded-2xl border sm:aspect-[5/4]" />
          <ul className="mt-3 hidden grid-cols-3 gap-2 text-center lg:grid">
            {TRUST.map(([icon, t, s]) => <li key={t} className="rounded-xl border bg-white p-3"><Icon name={icon} size={20} className="mx-auto text-brand-dark" /><b className="mt-1 block text-xs sm:text-sm">{t}</b><span className="hidden text-xs text-muted sm:block">{s}</span></li>)}
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium text-muted">{p.brand}</p>
          <h1 className="mt-1 font-display text-2xl font-bold leading-tight sm:text-3xl">{p.name}</h1>
          <p className="mt-2 text-sm text-muted">SKU: {p.sku}</p>
          <p className="mt-5 font-display text-4xl font-bold">{money(p.price)} <span className="font-sans text-base font-normal text-muted">/ {p.unit}</span></p>
          <p className="mt-1 text-xs text-muted">No minimum order quantity. Prices exclude GST; applicable taxes and delivery are shown at checkout.</p>
          <div className="mt-4"><StockBadge stock={p.stock} /></div>
          {!out && (
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
              <span className="text-sm font-medium">Quantity</span>
              <QtyStepper value={qty} onChange={setQty} min={1} max={p.stock} step={step} />
              <span className="text-sm text-muted">Total <b className="text-navy">{money(p.price * qty)}</b></span>
            </div>
          )}
          <div className="mt-6 hidden gap-3 sm:grid sm:grid-cols-2">
            <Button disabled={out} onClick={() => add(p, qty)}><Icon name="cart" size={18} /> Add to Cart</Button>
            <Button variant="dark" disabled={out} onClick={buyNow}>Buy Now</Button>
          </div>
          {out && <p className="mt-4 rounded-xl bg-brand-50 p-4 text-sm">This item is out of stock. <Link to={`/contact?subject=${encodeURIComponent(`Availability: ${p.sku}`)}`} className="font-semibold underline">Ask when it will be back</Link>.</p>}
          <dl className="mt-7 overflow-hidden rounded-2xl border bg-white text-sm">
            {Object.entries(specs).map(([k, v]) => <div key={k} className="grid grid-cols-2 gap-3 border-b px-4 py-3 last:border-0"><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>)}
          </dl>
          <ul className="mt-5 grid grid-cols-3 gap-2 text-center lg:hidden">
            {TRUST.map(([icon, t]) => <li key={t} className="rounded-xl border bg-white p-3"><Icon name={icon} size={20} className="mx-auto text-brand-dark" /><b className="mt-1 block text-xs">{t}</b></li>)}
          </ul>
          <section className="mt-7"><h2 className="font-display text-lg font-semibold">Product description</h2><p className="mt-2 max-w-prose leading-relaxed text-muted">{p.description}</p></section>
        </div>
      </div>

      {related4.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-xl font-bold">More in {p.categoryName}</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{related4.map((x) => <ProductCard key={x.id} product={x} />)}</div>
        </section>
      )}

      {/* Phone: keep the buy actions in thumb reach */}
      <div className="fixed inset-x-0 bottom-[3.6rem] z-30 flex items-center gap-3 border-t bg-white px-3 py-2.5 shadow-lift sm:hidden">
        <div className="min-w-0"><p className="font-display text-lg font-bold leading-none">{money(p.price * qty)}</p><p className="mt-1 truncate text-xs text-muted">{out ? 'Out of stock' : `${qty} ${p.unit}`}</p></div>
        <Button className="ml-auto flex-1" disabled={out} onClick={() => add(p, qty)}><Icon name="cart" size={18} /> Add</Button>
        <Button variant="dark" className="flex-1" disabled={out} onClick={buyNow}>Buy Now</Button>
      </div>
    </div>
  );
}
