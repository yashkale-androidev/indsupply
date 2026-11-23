import { useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../api/services.js';
import { Button, Card, EmptyState, ErrorState, Loading, PageTitle, StatusBadge } from '../components/ui.jsx';
import { cn, fmtDate, money, ORDER_STATUS } from '../lib/format.js';
import { useAsync } from '../lib/useAsync.js';

export default function Orders() {
  const [status, setStatus] = useState('');
  const { data, loading, error, reload } = useAsync(() => orderApi.list({ status }), [status]);
  const tabs = [['', 'All'], ...Object.entries(ORDER_STATUS)];
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <PageTitle>My Orders</PageTitle>
      <div role="tablist" aria-label="Filter orders by status" className="mb-6 flex gap-1 overflow-x-auto border-b">
        {tabs.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={status === k} onClick={() => setStatus(k)} className={cn('-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium', status === k ? 'border-brand font-semibold' : 'border-transparent text-muted hover:text-navy')}>{label}</button>
        ))}
      </div>
      {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : data.length === 0 ? (
        <EmptyState title="No orders here yet" text={status ? 'No orders with this status.' : 'Your orders will show up here once you place one.'} action={<Button as={Link} to="/products">Start shopping</Button>} />
      ) : (
        <ul className="space-y-3">
          {data.map((o) => (
            <li key={o.id}>
              <Card className="grid gap-3 p-5 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div><p className="font-display font-semibold">{o.number}</p><p className="text-sm text-muted">{fmtDate(o.createdAt)} · {o.items.length} {o.items.length === 1 ? 'item' : 'items'}</p></div>
                <div className="flex items-center gap-4"><b>{money(o.summary.total)}</b><StatusBadge status={o.status} /></div>
                <Link to={`/account/orders/${o.id}`} className="text-sm font-semibold underline">View details</Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
