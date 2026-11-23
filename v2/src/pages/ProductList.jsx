import { useEffect, useState } from 'react';
import { useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { productApi } from '../api/services.js';
import { Icon } from '../components/icons.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { Breadcrumbs, Button, EmptyState, ErrorState, Field, Pagination, ProductGridSkeleton, Sheet } from '../components/ui.jsx';
import { cn } from '../lib/format.js';
import { useAsync } from '../lib/useAsync.js';
import { useDocumentTitle } from '../lib/useDocumentTitle.js';

const PAGE_SIZE = 12;
const SORTS = [['relevance', 'Relevance'], ['price_asc', 'Price: low to high'], ['price_desc', 'Price: high to low'], ['newest', 'Newest']];

function Filters({ facets, brands, minPrice, maxPrice, inStock, set, categories, category }) {
  const [lo, setLo] = useState(minPrice);
  const [hi, setHi] = useState(maxPrice);
  useEffect(() => { setLo(minPrice); setHi(maxPrice); }, [minPrice, maxPrice]);
  const toggleBrand = (name) => set({ brand: (brands.includes(name) ? brands.filter((b) => b !== name) : [...brands, name]).join(',') });
  const group = 'border-b py-4 last:border-0';
  const check = 'flex min-h-10 cursor-pointer items-center gap-3 text-sm';
  return (
    <div className="px-5 lg:rounded-2xl lg:border lg:bg-white">
      {categories && (
        <fieldset className={group}>
          <legend className="mb-2 text-sm font-semibold">Category</legend>
          <select aria-label="Category" value={category} onChange={(e) => set({ category: e.target.value, __goto: e.target.value })} className="min-h-11 w-full rounded-lg border border-edge bg-white px-3 text-sm">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </fieldset>
      )}
      <fieldset className={group}>
        <legend className="mb-1 text-sm font-semibold">Brand</legend>
        {facets?.brands.map((b) => (
          <label key={b.name} className={check}><input type="checkbox" className="size-5 accent-navy" checked={brands.includes(b.name)} onChange={() => toggleBrand(b.name)} />{b.name} <span className="text-muted">({b.count})</span></label>
        ))}
      </fieldset>
      <fieldset className={group}>
        <legend className="mb-2 text-sm font-semibold">Price range (₹)</legend>
        <div className="flex items-center gap-2">
          <Field name="minPrice" aria-label="Minimum price" placeholder="Min" inputMode="numeric" value={lo} onChange={(e) => setLo(e.target.value.replace(/\D/g, ''))} />
          <span>–</span>
          <Field name="maxPrice" aria-label="Maximum price" placeholder="Max" inputMode="numeric" value={hi} onChange={(e) => setHi(e.target.value.replace(/\D/g, ''))} />
        </div>
        <Button variant="outline" className="mt-3 w-full" onClick={() => set({ minPrice: lo, maxPrice: hi })}>Apply price</Button>
      </fieldset>
      <fieldset className={group}>
        <legend className="mb-1 text-sm font-semibold">Availability</legend>
        <label className={check}><input type="checkbox" className="size-5 accent-navy" checked={inStock} onChange={(e) => set({ inStock: e.target.checked })} />In stock ({facets?.inStock ?? 0})</label>
        <p className="flex min-h-10 items-center text-sm text-muted">Out of stock ({facets?.outOfStock ?? 0})</p>
      </fieldset>
    </div>
  );
}

/** One page for /products, /category/:slug and /search?q= — all driven by the URL so links are shareable. */
export default function ProductList() {
  const { slug } = useParams();
  const { categories } = useOutletContext();
  const [sp, setSp] = useSearchParams();
  const q = sp.get('q') || '';
  const category = slug || sp.get('category') || '';
  const brand = sp.get('brand') || '';
  const brands = brand ? brand.split(',') : [];
  const minPrice = sp.get('minPrice') || '';
  const maxPrice = sp.get('maxPrice') || '';
  const inStock = sp.get('inStock') === 'true';
  const sort = sp.get('sort') || 'relevance';
  const page = Number(sp.get('page')) || 1;
  const [row, setRow] = useState(false);
  const [sheet, setSheet] = useState(false);

  const { data, loading, error, reload } = useAsync(
    () => productApi.list({ q, category, brand, minPrice, maxPrice, inStock: inStock ? 'true' : '', sort: sort === 'relevance' ? '' : sort, page, pageSize: PAGE_SIZE }),
    [q, category, brand, minPrice, maxPrice, inStock, sort, page],
  );

  const set = ({ __goto, ...patch }) => {
    const next = new URLSearchParams(sp);
    if (slug && 'category' in patch) { next.delete('category'); delete patch.category; }
    Object.entries({ page: '', ...patch }).forEach(([k, v]) => (v === '' || v == null || v === false ? next.delete(k) : next.set(k, v)));
    setSp(next, { replace: true });
  };

  const catName = categories.find((c) => c.slug === category)?.name;
  const title = q ? `Search results for “${q}”` : catName || 'All Products';
  useDocumentTitle(q ? `Search: ${q}` : catName || 'All Products');
  const crumbs = [{ label: 'Home', to: '/' }, ...(catName ? [{ label: 'All Categories', to: '/categories' }, { label: catName }] : [{ label: q ? 'Search' : 'Products' }])];
  const activeCount = brands.length + (minPrice || maxPrice ? 1 : 0) + (inStock ? 1 : 0);
  const filterProps = { facets: data?.facets, brands, minPrice, maxPrice, inStock, set, categories: slug ? null : categories, category };
  const clearAll = () => setSp(q ? { q } : category && !slug ? { category } : {}, { replace: true });

  const chips = [
    ...brands.map((b) => [b, () => set({ brand: brands.filter((x) => x !== b).join(',') })]),
    ...(minPrice || maxPrice ? [[`₹${minPrice || 0} – ${maxPrice ? `₹${maxPrice}` : 'any'}`, () => set({ minPrice: '', maxPrice: '' })]] : []),
    ...(inStock ? [['In stock', () => set({ inStock: false })]] : []),
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-8">
      <Breadcrumbs items={crumbs} />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
          {data && <p className="mt-1 text-sm text-muted" aria-live="polite">{data.total} {data.total === 1 ? 'product' : 'products'} found</p>}
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none lg:hidden" onClick={() => setSheet(true)}><Icon name="filter" size={16} /> Filters{activeCount ? ` (${activeCount})` : ''}</Button>
          <label className="flex flex-1 items-center gap-2 text-sm sm:flex-none"><span className="hidden sm:inline">Sort by</span>
            <select aria-label="Sort products" value={sort} onChange={(e) => set({ sort: e.target.value === 'relevance' ? '' : e.target.value })} className="min-h-11 w-full rounded-lg border border-edge bg-white px-3 text-sm">
              {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <div className="hidden rounded-lg border border-edge bg-white sm:flex" role="group" aria-label="Layout">
            {[['grid', false, 'Grid view'], ['list', true, 'List view']].map(([icon, val, label]) => (
              <button key={icon} type="button" aria-label={label} aria-pressed={row === val} onClick={() => setRow(val)} className={cn('grid size-11 place-items-center first:rounded-l-lg last:rounded-r-lg', row === val && 'bg-brand')}><Icon name={icon} size={18} /></button>
            ))}
          </div>
        </div>
      </div>

      {chips.length > 0 && (
        <ul className="mb-4 flex flex-wrap items-center gap-2">
          {chips.map(([label, remove]) => (
            <li key={label}><button type="button" onClick={remove} aria-label={`Remove filter ${label}`} className="flex min-h-9 items-center gap-1.5 rounded-full bg-brand-100 px-3 text-xs font-semibold hover:bg-brand-200">{label}<Icon name="x" size={14} /></button></li>
          ))}
          <li><button type="button" onClick={clearAll} className="min-h-9 px-2 text-xs font-semibold underline">Clear all</button></li>
        </ul>
      )}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start" aria-label="Filters"><Filters {...filterProps} /></aside>
        <div className="min-w-0">
          {loading ? <ProductGridSkeleton count={8} /> : error ? <ErrorState error={error} onRetry={reload} /> : data.items.length === 0 ? (
            <EmptyState title="No products found" text="Try a different keyword, or clear some filters." action={<Button variant="outline" onClick={clearAll}>Clear filters</Button>} />
          ) : (
            <>
              <div className={cn('grid gap-3 sm:gap-4', row ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4')}>
                {data.items.map((p) => <ProductCard key={p.id} product={p} row={row} />)}
              </div>
              <Pagination page={page} total={data.total} pageSize={PAGE_SIZE} onChange={(n) => { set({ page: n }); window.scrollTo(0, 0); }} />
            </>
          )}
        </div>
      </div>

      <Sheet open={sheet} onClose={() => setSheet(false)} side="bottom" title="Filters"
        footer={<div className="grid grid-cols-2 gap-3"><Button variant="outline" onClick={() => { clearAll(); setSheet(false); }}>Clear all</Button><Button onClick={() => setSheet(false)}>Show {data?.total ?? ''} products</Button></div>}>
        <Filters {...filterProps} />
      </Sheet>
    </div>
  );
}
