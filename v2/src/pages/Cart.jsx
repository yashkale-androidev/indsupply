import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BUSINESS } from '../config.js';
import { useCart } from '../context/AppContext.jsx';
import { Icon } from '../components/icons.jsx';
import { Button, Card, EmptyState, PageTitle, ProductImage, QtyStepper } from '../components/ui.jsx';
import { money } from '../lib/format.js';
import { useDocumentTitle } from '../lib/useDocumentTitle.js';

export function SummaryRows({ summary }) {
  const pending = summary.gst == null; // guest carts: the server calculates GST and delivery after login
  const rows = [['Subtotal', summary.subtotal], ['GST (18%)', summary.gst], ['Delivery charges', summary.delivery]];
  return (
    <dl className="space-y-2.5 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between"><dt className="text-muted">{k}</dt>
          <dd className="font-medium">{v == null ? <span className="text-xs text-muted">At checkout</span> : k === 'Delivery charges' && v === 0 ? <span className="text-emerald-800">Free</span> : money(v)}</dd></div>
      ))}
      <div className="flex justify-between border-t pt-3 text-base font-bold"><dt>{pending ? 'Subtotal' : 'Total amount'}</dt><dd>{money(pending ? summary.subtotal : summary.total)}</dd></div>
    </dl>
  );
}

function FreeDeliveryBar({ summary }) {
  const goal = summary.freeDeliveryAbove ?? BUSINESS.freeDeliveryAbove;
  if (!goal) return null;
  const left = goal - summary.subtotal;
  const pct = Math.min(100, Math.round((summary.subtotal / goal) * 100));
  return (
    <div className="rounded-xl bg-brand-50 p-3.5 text-sm">
      <p className="flex items-center gap-2 font-medium"><Icon name="truck" size={18} className="text-brand-dark" />
        {left > 0 ? <>Add <b>{money(left)}</b> more for free delivery</> : <>You've unlocked <b>free delivery</b></>}</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free delivery"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function CartRow({ item }) {
  const { update, remove } = useCart();
  const [qty, setQty] = useState(item.qty);
  useEffect(() => setQty(item.qty), [item.qty]);
  // Debounced: wait for the customer to stop changing the quantity, then let the server validate it.
  useEffect(() => {
    if (qty === item.qty || qty < 1) return undefined;
    const t = setTimeout(async () => { if (!(await update(item.productId, qty))) setQty(item.qty); }, 450);
    return () => clearTimeout(t);
  }, [qty]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <li className="grid grid-cols-[84px_1fr] gap-x-4 gap-y-3 py-4 sm:grid-cols-[96px_1fr_auto_auto] sm:items-center sm:py-5">
      <Link to={`/products/${item.productId}`} aria-label={item.name}><ProductImage product={item} className="size-[84px] rounded-xl border sm:size-24" /></Link>
      <div className="min-w-0">
        <Link to={`/products/${item.productId}`} className="line-clamp-2 text-sm font-semibold hover:underline">{item.name}</Link>
        <p className="text-xs text-muted">SKU: {item.sku}</p>
        <p className="mt-1 text-sm">{money(item.price)} / {item.unit}</p>
        {item.qty > item.stock && <p role="alert" className="mt-1 text-xs font-medium text-red-700">Only {item.stock} left in stock. Reduce the quantity to continue.</p>}
      </div>
      <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:justify-start">
        <QtyStepper value={qty} onChange={setQty} min={1} max={item.stock} step={1} />
        <b className="sm:hidden">{money(item.price * qty)}</b>
      </div>
      <div className="col-span-2 flex items-center justify-between sm:col-span-1 sm:w-40 sm:justify-end sm:gap-3">
        <button type="button" onClick={() => remove(item.productId)} className="flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-red-800 hover:bg-red-50 sm:order-2 sm:px-3" aria-label={`Remove ${item.name}`}><Icon name="trash" size={18} /><span className="sm:hidden">Remove</span></button>
        <b className="hidden sm:block">{money(item.price * qty)}</b>
      </div>
    </li>
  );
}

export default function Cart() {
  useDocumentTitle('Your Cart');
  const { cart } = useCart();
  if (!cart.items.length) return <EmptyState art="box" title="Your cart is empty" text="Add products to see them here." action={<Button as={Link} to="/products">Browse products</Button>} />;
  const blocked = cart.items.some((i) => i.qty > i.stock);
  const cta = cart.guest
    ? <Button as={Link} to="/login" state={{ from: '/checkout' }} className="w-full">Login to checkout</Button>
    : <Button as={Link} to="/checkout" className="w-full" aria-disabled={blocked} onClick={(e) => blocked && e.preventDefault()}>Proceed to Checkout</Button>;
  return (
    <div className="mx-auto max-w-7xl px-3 py-6 pb-32 sm:px-4 sm:py-8 lg:pb-8">
      <PageTitle>Your Cart ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})</PageTitle>
      {cart.guest && <p className="mb-4 flex items-start gap-3 rounded-xl bg-brand-100 p-4 text-sm"><Icon name="info" size={18} className="mt-0.5 shrink-0" />Log in to place your order. Your cart will be saved to your account.</p>}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card className="px-4 sm:px-5"><ul className="divide-y">{cart.items.map((i) => <CartRow key={i.productId} item={i} />)}</ul></Card>
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5 sm:p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">Price details</h2>
            <FreeDeliveryBar summary={cart.summary} />
            <div className="mt-4"><SummaryRows summary={cart.summary} /></div>
            <div className="mt-5 hidden lg:block">{cta}</div>
            <Button as={Link} to="/products" variant="outline" className="mt-3 w-full">Continue Shopping</Button>
          </Card>
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-[3.6rem] z-30 flex items-center gap-4 border-t bg-white px-3 py-2.5 shadow-lift lg:hidden">
        <div><p className="text-xs text-muted">{cart.guest ? 'Subtotal' : 'Total'}</p><p className="font-display text-lg font-bold leading-none">{money(cart.guest ? cart.summary.subtotal : cart.summary.total)}</p></div>
        <div className="flex-1">{cta}</div>
      </div>
    </div>
  );
}
