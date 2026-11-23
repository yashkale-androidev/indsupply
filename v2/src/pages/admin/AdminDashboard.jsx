import { Link } from 'react-router-dom';
import { adminApi } from '../../api/services.js';
import { Icon } from '../../components/icons.jsx';
import { Card, ErrorState, Loading, ProductImage, StatusBadge } from '../../components/ui.jsx';
import { fmtDay, money } from '../../lib/format.js';
import { useAsync } from '../../lib/useAsync.js';

function SalesChart({ series }) {
  const W = 640, H = 240, PX = 48, PY = 28;
  const max = Math.max(...series.map((s) => s.amount), 1);
  const x = (i) => PX + (i * (W - PX - 16)) / Math.max(series.length - 1, 1);
  const y = (v) => H - PY - (v / max) * (H - 2 * PY);
  const pts = series.map((s, i) => `${x(i)},${y(s.amount)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Sales amount for the last 14 days" className="w-full">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}><line x1={PX} x2={W - 16} y1={y(max * t)} y2={y(max * t)} stroke="#efe3c6" /><text x={PX - 8} y={y(max * t) + 4} textAnchor="end" fontSize="11" fill="#47596a">{Math.round((max * t) / 1000)}k</text></g>
      ))}
      <polyline points={pts} fill="none" stroke="#f9a401" strokeWidth="3" strokeLinejoin="round" />
      {series.map((s, i) => <circle key={s.date} cx={x(i)} cy={y(s.amount)} r="3.5" fill="#072336"><title>{`${fmtDay(s.date)}: ${money(s.amount)}`}</title></circle>)}
      {series.map((s, i) => i % 3 === 0 && <text key={s.date} x={x(i)} y={H - 6} textAnchor="middle" fontSize="11" fill="#47596a">{fmtDay(s.date)}</text>)}
    </svg>
  );
}

export default function AdminDashboard() {
  const { data: d, loading, error, reload } = useAsync(() => adminApi.dashboard(), []);
  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const stats = [['Total orders', d.totalOrders.toLocaleString('en-IN'), 'orders'], ['Pending orders', d.pendingOrders.toLocaleString('en-IN'), 'clock'], ['Total sales', money(d.salesAmount), 'offer'], ['Customers', d.customers.toLocaleString('en-IN'), 'users']];
  return (
    <>
      <h1 className="mb-6 font-display text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([k, v, icon]) => <Card key={k} className="flex items-center gap-4 p-4 sm:p-5"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-100"><Icon name={icon} size={22} /></span><span className="min-w-0"><span className="block text-sm text-muted">{k}</span><span className="block truncate font-display text-2xl font-bold">{v}</span></span></Card>)}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_400px]">
        <Card className="p-5"><h2 className="mb-3 font-display text-lg font-semibold">Sales overview (last 14 days)</h2><SalesChart series={d.salesSeries} /></Card>
        <Card className="p-5 xl:col-span-2">
          <h2 className="mb-2 font-display text-lg font-semibold">Recent orders</h2>
          <ul className="divide-y text-sm">{d.recentOrders.map((o) => <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3"><span><b>{o.number}</b><span className="block text-xs text-muted">{o.customer}</span></span><span className="flex items-center gap-3"><b>{money(o.total)}</b><StatusBadge status={o.status} /></span></li>)}</ul>
          <Link to="/admin/orders" className="mt-2 inline-flex min-h-10 items-center text-sm font-semibold underline">View all orders</Link>
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 font-display text-lg font-semibold">Low stock products</h2>
          {d.lowStock.length === 0 ? <p className="text-sm text-muted">Everything is well stocked.</p> : (
            <ul className="divide-y">{d.lowStock.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3 text-sm"><ProductImage product={p} className="size-10 shrink-0 rounded-lg border" /><span className="flex-1"><b className="block">{p.name}</b><span className="text-xs text-muted">{p.sku}</span></span><span className={p.stock === 0 ? 'font-semibold text-red-700' : 'font-semibold'}>{p.stock === 0 ? 'Out of stock' : `Stock: ${p.stock}`}</span></li>))}</ul>
          )}
          <Link to="/admin/products" className="mt-3 inline-flex min-h-10 items-center text-sm font-semibold underline">Manage products</Link>
        </Card>
      </div>
    </>
  );
}
