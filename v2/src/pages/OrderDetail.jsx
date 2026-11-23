import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orderApi } from '../api/services.js';
import { useCart, useToast } from '../context/AppContext.jsx';
import { Icon } from '../components/icons.jsx';
import { Breadcrumbs, Button, Card, ErrorState, Loading, StatusBadge } from '../components/ui.jsx';
import { cn, fmtDate, money, ORDER_STATUS, ORDER_STEPS, PAYMENT_METHODS } from '../lib/format.js';
import { useAsync } from '../lib/useAsync.js';
import { payForOrder } from '../lib/payment.js';
import { openInvoice } from '../lib/invoice.js';
import { SummaryRows } from './Cart.jsx';

function Tracking({ order }) {
  const done = Object.fromEntries(order.timeline.map((t) => [t.status, t.at]));
  const currentIdx = ORDER_STEPS.reduce((n, s, i) => (done[s] ? i : n), -1);
  return (
    <ol className="grid gap-4 sm:grid-cols-5">
      {ORDER_STEPS.map((s, i) => (
        <li key={s} className="flex items-center gap-3 sm:flex-col sm:text-center">
          <span className={cn('grid size-9 shrink-0 place-items-center rounded-full border-2', done[s] ? 'border-brand bg-brand' : 'bg-white text-muted', order.status !== 'CANCELLED' && i === currentIdx && 'ring-4 ring-brand-200')}>
            {done[s] ? <Icon name="check" size={16} /> : i + 1}
          </span>
          <span><b className="block text-sm">{ORDER_STATUS[s]}</b><span className="text-xs text-muted">{done[s] ? fmtDate(done[s]) : 'Pending'}</span></span>
        </li>
      ))}
    </ol>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { add, reload: reloadCart } = useCart();
  const { data: o, loading, error, reload, setData } = useAsync(() => orderApi.get(id), [id]);
  const [busy, setBusy] = useState(false);

  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const act = async (fn, ok) => {
    setBusy(true);
    try { setData(await fn()); toast(ok, 'success'); } catch (e) { toast(e.message, 'error'); }
    setBusy(false);
  };
  const cancellable = ['PLACED', 'CONFIRMED'].includes(o.status);
  const needsPayment = o.paymentStatus === 'PENDING' && o.paymentMethod !== 'COD' && o.status !== 'CANCELLED';
  const reorder = async () => {
    setBusy(true);
    let ok = true;
    for (const i of o.items) ok = (await add({ id: i.productId, name: i.name }, i.qty)) && ok;
    await reloadCart();
    setBusy(false);
    if (ok) navigate('/cart');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumbs items={[{ label: 'My Orders', to: '/account/orders' }, { label: o.number }]} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-display text-2xl font-bold sm:text-3xl">{o.number}</h1><p className="text-sm text-muted">Placed on {fmtDate(o.createdAt)}</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={o.status} /><StatusBadge payment status={o.paymentStatus} /><Button variant="outline" className="min-h-10" onClick={() => openInvoice(o)}>View / Save Invoice as PDF</Button>
          <Button variant="outline" className="min-h-10" disabled={busy} onClick={reorder}>Reorder</Button>
          {needsPayment && <Button className="min-h-10" disabled={busy} onClick={() => act(async () => { await payForOrder(o); return orderApi.get(o.id); }, 'Payment received')}>Pay now</Button>}
          {cancellable && <Button variant="danger" className="min-h-10" disabled={busy} onClick={() => window.confirm('Cancel this order?') && act(() => orderApi.cancel(o.id), 'Order cancelled')}>Cancel order</Button>}
        </div>
      </div>

      <Card className="mb-6 p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Order tracking</h2>
        {o.status === 'CANCELLED' && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-800">This order was cancelled. {o.paymentStatus === 'REFUNDED' ? 'Your payment has been refunded.' : ''}</p>}
        <Tracking order={o} />
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 text-sm">
          <h2 className="mb-3 font-display text-lg font-semibold">Delivery address</h2>
          <p className="font-semibold">{o.address.name}{o.address.mobile && ` · ${o.address.mobile}`}</p>
          {o.address.company && <p>{o.address.company}</p>}
          <p className="text-muted">{[o.address.line1, o.address.city, o.address.state, o.address.pincode].filter(Boolean).join(', ')}</p>
          <p className="mt-4 text-muted">Payment method: <span className="font-medium text-navy">{PAYMENT_METHODS.find((m) => m.id === o.paymentMethod)?.label}</span></p>
          {o.transactionId && <p className="text-muted">Transaction ID: <span className="font-medium text-navy">{o.transactionId}</span></p>}
        </Card>
        <Card className="p-6"><h2 className="mb-3 font-display text-lg font-semibold">Order summary</h2><SummaryRows summary={o.summary} /></Card>
      </div>

      <Card className="mt-6 p-6">
        <h2 className="mb-2 font-display text-lg font-semibold">Order items</h2>
        <ul className="divide-y text-sm">{o.items.map((i) => (
          <li key={i.productId} className="flex flex-wrap items-center justify-between gap-2 py-3"><span><b>{i.name}</b><span className="block text-xs text-muted">SKU: {i.sku}</span></span><span className="text-muted">Qty {i.qty} × {money(i.price)}</span><b>{money(i.qty * i.price)}</b></li>))}</ul>
      </Card>
    </div>
  );
}
