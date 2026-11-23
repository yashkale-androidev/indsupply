import { Link } from 'react-router-dom';
import { useCart } from '../context/AppContext.jsx';
import { money, cn } from '../lib/format.js';
import { Icon } from './icons.jsx';
import { Button, ProductImage, StockBadge } from './ui.jsx';

export default function ProductCard({ product: p, row }) {
  const { add } = useCart();
  const out = p.stock <= 0;
  const low = !out && p.stock <= 100;
  return (
    <article className={cn('group relative flex rounded-2xl border bg-white p-2.5 transition duration-200 hover:-translate-y-0.5 hover:border-brand/70 hover:shadow-lift sm:p-3', row ? 'flex-row gap-3 sm:gap-4' : 'flex-col')}>
      <Link to={`/products/${p.id}`} aria-label={p.name} className={cn('relative block shrink-0 overflow-hidden rounded-xl', row ? 'w-28 self-start sm:w-44' : '')}>
        <ProductImage product={p} className={cn('w-full transition-transform duration-300 group-hover:scale-[1.04]', row ? 'aspect-square' : 'aspect-[5/4]')} />
        {out && <span className="absolute left-2 top-2 rounded-md bg-navy px-2 py-0.5 text-[11px] font-semibold text-white">Sold out</span>}
        {low && <span className="absolute left-2 top-2 rounded-md bg-brand px-2 py-0.5 text-[11px] font-semibold text-navy">Low stock</span>}
      </Link>
      <div className={cn('flex min-w-0 flex-1 flex-col', row ? '' : 'mt-3')}>
        <p className="text-[11px] font-medium text-muted">{p.brand}</p>
        <Link to={`/products/${p.id}`} className="line-clamp-2 min-h-10 py-0.5 text-sm font-semibold leading-snug hover:underline">{p.name}</Link>
        <p className="mt-0.5 truncate text-xs text-muted">SKU: {p.sku}</p>
        <p className="mt-2 font-display text-lg font-bold">{money(p.price)} <span className="font-sans text-xs font-normal text-muted">/ {p.unit}</span></p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1"><StockBadge stock={p.stock} compact /><span className="text-xs text-muted">No minimum order</span></div>
        <Button className={cn('mt-3 w-full', row && 'sm:w-48')} disabled={out} onClick={() => add(p)} aria-label={`Add ${p.name} to cart`}>
          <Icon name="plus" size={16} />{out ? 'Out of stock' : 'Add to Cart'}
        </Button>
      </div>
    </article>
  );
}
