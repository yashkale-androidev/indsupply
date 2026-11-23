import { useState } from 'react';
import { adminApi } from '../../api/services.js';
import { useToast } from '../../context/AppContext.jsx';
import { Button, Card, ErrorState, Loading, Modal, StatusBadge } from '../../components/ui.jsx';
import { fmtDate, money, ORDER_STATUS } from '../../lib/format.js';
import { useAsync } from '../../lib/useAsync.js';

export default function AdminOrders() {
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [view, setView] = useState(null);
  const { data, loading, error, reload } = useAsync(() => adminApi.orders({ status }), [status]);

  const change = async (o, next) => {
    try { await adminApi.updateOrderStatus(o.id, next); toast(`${o.number} marked ${ORDER_STATUS[next]}`, 'success'); reload(); } catch (e) { toast(e.message, 'error'); }
  };
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <label className="flex items-center gap-2 text-sm">Status
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-edge bg-white px-3 py-2.5 text-sm"><option value="">All</option>{Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </label>
      </div>
      {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b bg-brand-50 text-xs text-muted"><tr>{['Order', 'Customer', 'Date', 'Amount', 'Payment', 'Status', ''].map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
            <tbody className="divide-y">
              {data.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-medium">{o.number}</td>
                  <td className="px-4 py-3">{o.customer?.name}<span className="block text-xs text-muted">{o.customer?.company}</span></td>
                  <td className="px-4 py-3">{fmtDate(o.createdAt)}</td>
                  <td className="px-4 py-3">{money(o.summary.total)}</td>
                  <td className="px-4 py-3"><StatusBadge payment status={o.paymentStatus} /></td>
                  <td className="px-4 py-3">
                    <label className="sr-only" htmlFor={`st-${o.id}`}>Status of {o.number}</label>
                    <select id={`st-${o.id}`} value={o.status} onChange={(e) => change(o, e.target.value)} className="rounded-lg border border-edge bg-white px-2 py-2 text-sm">{Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                  </td>
                  <td className="px-4 py-3"><button type="button" className="font-semibold underline" onClick={() => setView(o)}>View</button></td>
                </tr>))}
              {data.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted">No orders with this status.</td></tr>}
            </tbody>
          </table>
        </Card>
      )}
      <Modal open={!!view} onClose={() => setView(null)} title={view?.number || ''} wide>
        {view && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2"><StatusBadge status={view.status} /><StatusBadge payment status={view.paymentStatus} /></div>
            <div><b>Deliver to</b><p>{view.address.name} · {view.address.mobile}</p><p className="text-muted">{[view.address.line1, view.address.city, view.address.state, view.address.pincode].filter(Boolean).join(', ')}</p>
              <a className="font-semibold underline" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([view.address.line1, view.address.city, view.address.pincode].join(' '))}`}>Open in Google Maps</a></div>
            <ul className="divide-y rounded-lg border">{view.items.map((i) => <li key={i.productId} className="flex justify-between gap-3 px-3 py-2"><span>{i.name} <span className="text-muted">× {i.qty}</span></span><b>{money(i.price * i.qty)}</b></li>)}</ul>
            <p className="text-right text-base font-bold">Total {money(view.summary.total)}</p>
            <Button variant="outline" onClick={() => setView(null)}>Close</Button>
          </div>
        )}
      </Modal>
    </>
  );
}
