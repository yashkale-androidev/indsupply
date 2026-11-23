import { Link, useParams } from 'react-router-dom';
import { orderApi } from '../api/services.js';
import { Icon } from '../components/icons.jsx';
import { Button, Card, ErrorState, Loading, StatusBadge } from '../components/ui.jsx';
import { money } from '../lib/format.js';
import { openInvoice } from '../lib/invoice.js';
import { useAsync } from '../lib/useAsync.js';

export default function OrderConfirmation() {
  const { id } = useParams();
  const { data: o, loading, error, reload } = useAsync(() => orderApi.get(id), [id]);
  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return (
    <div className="mx-auto max-w-lg px-4 py-14 text-center">
      <Card className="p-8">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-600 text-white"><Icon name="check" size={32} /></span>
        <h1 className="mt-5 font-display text-3xl font-bold">Thank you!</h1>
        <p className="mt-2 text-muted">Your order has been placed successfully.</p>
        <p className="mt-6 text-sm text-muted">Order number</p>
        <p className="font-display text-2xl font-bold">{o.number}</p>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm"><span>Total {money(o.summary.total)}</span><span className="flex items-center gap-2">Payment <StatusBadge payment status={o.paymentStatus} /></span></div>
        <div className="mt-8 grid gap-3">
          <Button onClick={() => openInvoice(o)} variant="outline">View / Save Invoice as PDF</Button>
          <Button as={Link} to={`/account/orders/${o.id}`}>Track this order</Button>
          <Button as={Link} to="/products" variant="outline">Continue Shopping</Button>
          <Link to="/account/orders" className="text-sm font-semibold underline">View my orders</Link>
        </div>
      </Card>
    </div>
  );
}
