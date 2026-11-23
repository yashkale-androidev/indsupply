import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productApi } from '../api/services.js';
import { money } from '../lib/format.js';
import { Icon } from './icons.jsx';
import { ProductImage } from './ui.jsx';

/** Search with live suggestions (name, SKU, brand). Works with mouse, touch and keyboard. */
export default function SearchBox({ categories = [], withCategory = false, className = '' }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const listId = useId();
  const wrap = useRef(null);
  const [q, setQ] = useState(params.get('q') || '');
  const [cat, setCat] = useState('');
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setItems([]); return undefined; }
    let live = true;
    const t = setTimeout(() => {
      productApi.list({ q: term, category: cat, pageSize: 5 }).then((r) => live && setItems(r.items)).catch(() => live && setItems([]));
    }, 220);
    return () => { live = false; clearTimeout(t); };
  }, [q, cat]);

  useEffect(() => {
    const away = (e) => !wrap.current?.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, []);

  const go = (path) => { setOpen(false); setActive(-1); navigate(path); };
  const submit = (e) => {
    e.preventDefault();
    if (active >= 0 && items[active]) return go(`/products/${items[active].id}`);
    const sp = new URLSearchParams();
    if (q.trim()) sp.set('q', q.trim());
    if (cat) sp.set('category', cat);
    go(`/search?${sp}`);
  };
  const onKey = (e) => {
    if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, -1)); }
  };
  const showList = open && q.trim().length >= 2;

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <form onSubmit={submit} role="search" className="flex w-full rounded-xl border border-edge bg-white focus-within:border-navy focus-within:ring-2 focus-within:ring-brand/40">
        {withCategory && (
          <>
            <label className="sr-only" htmlFor={`${listId}-cat`}>Category</label>
            <select id={`${listId}-cat`} value={cat} onChange={(e) => setCat(e.target.value)} className="w-40 shrink-0 rounded-l-xl border-r border-edge bg-brand-50 px-3 text-sm font-medium">
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </>
        )}
        <label className="sr-only" htmlFor={`${listId}-q`}>Search products</label>
        <input id={`${listId}-q`} type="search" role="combobox" aria-expanded={showList} aria-controls={listId} aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined} autoComplete="off" enterKeyHint="search"
          value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1); }} onFocus={() => setOpen(true)} onKeyDown={onKey}
          placeholder="Search product, item code or brand" className="min-h-11 min-w-0 flex-1 bg-transparent px-3.5 text-sm placeholder:text-slate-500 focus:outline-none" />
        <button type="submit" aria-label="Search" className="grid min-h-11 min-w-12 place-items-center rounded-r-[11px] bg-brand px-3 font-semibold text-navy hover:bg-brand-dark sm:px-5">
          <span className="flex items-center gap-2"><Icon name="search" size={18} /><span className="hidden sm:inline">Search</span></span>
        </button>
      </form>
      {showList && (
        <ul id={listId} role="listbox" aria-label="Product suggestions" className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border bg-white shadow-lift">
          {items.map((p, i) => (
            <li key={p.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
              <button type="button" onClick={() => go(`/products/${p.id}`)} className={`flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-brand-50 ${i === active ? 'bg-brand-50' : ''}`}>
                <ProductImage product={p} className="size-12 shrink-0 rounded-lg border" />
                <span className="min-w-0 flex-1"><span className="line-clamp-1 text-sm font-semibold">{p.name}</span><span className="block text-xs text-muted">{p.sku} · {p.brand}</span></span>
                <span className="text-sm font-bold">{money(p.price)}</span>
              </button>
            </li>
          ))}
          {items.length === 0 && <li className="px-4 py-3 text-sm text-muted" role="presentation">No quick matches. Press Enter to search everything.</li>}
          <li role="presentation"><button type="button" onClick={submit} className="flex w-full items-center justify-between border-t bg-brand-50 px-4 py-3 text-sm font-semibold hover:bg-brand-100">See all results for “{q.trim()}” <Icon name="arrowRight" size={16} /></button></li>
        </ul>
      )}
    </div>
  );
}
