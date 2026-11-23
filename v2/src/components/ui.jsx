import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { cn, ORDER_STATUS, PAYMENT_STATUS } from '../lib/format.js';
import { Icon } from './icons.jsx';
import { ProductArt } from './art.jsx';

const VARIANTS = {
  primary: 'bg-brand text-navy hover:bg-brand-dark active:scale-[.98]',
  dark: 'bg-navy text-white hover:bg-navy-800 active:scale-[.98]',
  outline: 'border border-navy/80 bg-white text-navy hover:bg-brand-50',
  ghost: 'text-navy hover:bg-brand-100',
  danger: 'border border-red-700 bg-white text-red-800 hover:bg-red-50',
};
export function Button({ variant = 'primary', className, as: As = 'button', ...p }) {
  return (
    <As
      className={cn('inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50', VARIANTS[variant], className)}
      {...(As === 'button' ? { type: 'button' } : {})}
      {...p}
    />
  );
}

export function Field({ label, error, hint, className, as: As = 'input', children, ...p }) {
  const id = p.id || p.name;
  return (
    <div className={className}>
      {label && <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>}
      <As id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined}
        className={cn('min-h-11 w-full rounded-lg border border-edge bg-white px-3.5 py-2.5 text-sm placeholder:text-slate-500 focus:border-navy focus:ring-2 focus:ring-brand/40 focus:outline-none', error && 'border-red-600')} {...p}>
        {children}
      </As>
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p id={`${id}-err`} className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}

const TONES = {
  green: 'bg-emerald-50 text-emerald-800', red: 'bg-red-50 text-red-800', amber: 'bg-brand-100 text-[#6b4400]',
  blue: 'bg-sky-50 text-sky-900', gray: 'bg-slate-100 text-slate-700',
};
const STATUS_TONE = { PLACED: 'blue', CONFIRMED: 'amber', PACKED: 'amber', OUT_FOR_DELIVERY: 'blue', DELIVERED: 'green', CANCELLED: 'red', PENDING: 'amber', PAID: 'green', FAILED: 'red', REFUNDED: 'gray' };
export const Badge = ({ tone = 'gray', children, className }) => (
  <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', TONES[tone], className)}>{children}</span>
);
export const StatusBadge = ({ status, payment }) => (
  <Badge tone={STATUS_TONE[status]}>{(payment ? PAYMENT_STATUS : ORDER_STATUS)[status] || status}</Badge>
);
export const StockBadge = ({ stock, compact }) =>
  stock > 0
    ? <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800"><span className="size-2 rounded-full bg-emerald-600" />{compact ? 'In stock' : `In stock${stock > 99 ? ` (${stock.toLocaleString('en-IN')}+)` : ''}`}</span>
    : <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-800"><span className="size-2 rounded-full bg-red-600" />Out of stock</span>;

export const Spinner = ({ className }) => (
  <span role="status" aria-label="Loading" className={cn('inline-block size-5 animate-spin rounded-full border-2 border-navy border-t-transparent', className)} />
);
export const Loading = ({ label = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-3 py-20 text-muted"><Spinner /> {label}</div>
);
export const Skeleton = ({ className }) => <div aria-hidden="true" className={cn('skeleton rounded-lg', className)} />;
export function ProductGridSkeleton({ count = 8, className }) {
  return (
    <div role="status" aria-label="Loading products" className={cn('grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4', className)}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-2xl border bg-white p-3"><Skeleton className="aspect-[5/4] w-full" /><Skeleton className="mt-3 h-4 w-4/5" /><Skeleton className="mt-2 h-3 w-1/2" /><Skeleton className="mt-3 h-5 w-1/3" /><Skeleton className="mt-3 h-10 w-full" /></div>
      ))}
    </div>
  );
}
export function ErrorState({ error, onRetry }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-red-50 text-red-700"><Icon name="alert" size={28} /></span>
      <p className="mt-4 font-display text-xl font-semibold">Something went wrong</p>
      <p className="mt-2 text-sm text-muted">{error?.message || 'Please try again.'}</p>
      {onRetry && <Button className="mt-5" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
export function EmptyState({ title, text, action, art = 'box' }) {
  return (
    <div className="mx-auto max-w-md px-4 py-14 text-center">
      <ProductArt art={art} className="mx-auto h-32 w-40" />
      <p className="mt-2 font-display text-xl font-semibold">{title}</p>
      {text && <p className="mt-2 text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="no-scrollbar mb-4 flex items-center gap-1 overflow-x-auto whitespace-nowrap text-sm text-muted">
      {items.map((it, i) => (
        <span key={i} className="flex shrink-0 items-center gap-1">
          {i > 0 && <Icon name="chevronRight" size={14} />}
          {it.to ? <Link to={it.to} className="py-2.5 hover:text-navy hover:underline">{it.label}</Link> : <span aria-current="page" className="max-w-[60vw] truncate py-2.5 text-navy">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function QtyStepper({ value, onChange, min = 1, max = 999999, step = 1, disabled, size = 'md' }) {
  const set = (v) => onChange(Math.min(max, Math.max(min, Number.isFinite(v) ? v : min)));
  const btn = size === 'sm' ? 'size-9' : 'size-11';
  return (
    <div className="inline-flex items-center rounded-lg border border-edge bg-white">
      <button type="button" aria-label="Decrease quantity" disabled={disabled || value <= min} onClick={() => set(value - step)} className={cn(btn, 'grid place-items-center rounded-l-lg hover:bg-brand-50 disabled:opacity-40')}><Icon name="minus" size={16} /></button>
      <input aria-label="Quantity" inputMode="numeric" value={value} disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, '')) || 0)} onBlur={() => set(value)}
        className={cn('border-x border-edge bg-transparent text-center text-sm font-semibold', size === 'sm' ? 'h-9 w-14' : 'h-11 w-16')} />
      <button type="button" aria-label="Increase quantity" disabled={disabled || value >= max} onClick={() => set(value + step)} className={cn(btn, 'grid place-items-center rounded-r-lg hover:bg-brand-50 disabled:opacity-40')}><Icon name="plus" size={16} /></button>
    </div>
  );
}

function useEscape(open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
}

/** Centered dialog on desktop, bottom sheet on phones. */
export function Modal({ open, onClose, title, children, wide }) {
  const ref = useRef(null);
  useEscape(open, onClose);
  useEffect(() => { if (open) ref.current?.focus(); }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-navy/55 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className={cn('anim-sheet max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6', wide ? 'sm:max-w-2xl' : 'sm:max-w-md')}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="grid size-10 place-items-center rounded-lg hover:bg-brand-100"><Icon name="x" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Slide-in panel from the left (mobile menu) or a bottom sheet (mobile filters). */
export function Sheet({ open, onClose, title, side = 'left', children, footer }) {
  useEscape(open, onClose);
  if (!open) return null;
  const left = side === 'left';
  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-navy/55" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label={title}
        className={cn('absolute flex flex-col bg-white shadow-xl', left ? 'anim-drawer inset-y-0 left-0 w-[88%] max-w-sm' : 'anim-sheet inset-x-0 bottom-0 max-h-[88vh] rounded-t-3xl')}>
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="grid size-10 place-items-center rounded-lg hover:bg-brand-100"><Icon name="x" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="pb-safe border-t bg-white p-4">{footer}</div>}
      </div>
    </div>
  );
}

export function Pagination({ page, total, pageSize, onChange }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const nums = [...Array(pages)].map((_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
      <Button variant="outline" className="px-3" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><Icon name="chevronLeft" size={16} /><span className="hidden sm:inline">Previous</span></Button>
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && n - nums[i - 1] > 1 && <span className="text-muted">…</span>}
          <button type="button" aria-label={`Page ${n}`} aria-current={n === page ? 'page' : undefined} onClick={() => onChange(n)}
            className={cn('size-11 rounded-lg text-sm font-semibold', n === page ? 'bg-brand text-navy' : 'hover:bg-brand-100')}>{n}</button>
        </span>
      ))}
      <Button variant="outline" className="px-3" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><span className="hidden sm:inline">Next</span><Icon name="chevronRight" size={16} /></Button>
    </nav>
  );
}

/** Shows the product photo when `imageUrl` exists, otherwise the built-in illustration. */
export function ProductImage({ product, className, fit = 'contain', ...rest }) {
  if (product?.imageUrl) return <img src={product.imageUrl} alt={product.name} loading="lazy" decoding="async" className={cn(fit === 'cover' ? 'object-cover' : 'object-contain', 'bg-brand-50', className)} {...rest} />;
  return (
    <div role="img" aria-label={product?.name} className={cn('grid place-items-center overflow-hidden bg-brand-50', className)} {...rest}>
      <ProductArt art={product?.art} category={product?.category} className="h-full w-full p-[6%]" />
    </div>
  );
}

export const Card = ({ className, ...p }) => <div className={cn('relative rounded-2xl border bg-white', className)} {...p} />;
export const PageTitle = ({ children, right, sub }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div><h1 className="font-display text-2xl font-bold sm:text-3xl">{children}</h1>{sub && <p className="mt-1 text-sm text-muted">{sub}</p>}</div>{right}
  </div>
);
