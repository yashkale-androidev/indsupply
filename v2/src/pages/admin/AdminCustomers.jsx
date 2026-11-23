import { adminApi } from '../../api/services.js';
import { Card, ErrorState, Loading } from '../../components/ui.jsx';
import { useAsync } from '../../lib/useAsync.js';

export default function AdminCustomers() {
  const { data, loading, error, reload } = useAsync(() => adminApi.customers(), []);
  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return (
    <>
      <h1 className="mb-6 font-display text-2xl font-bold">Customers</h1>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b bg-brand-50 text-xs text-muted"><tr>{['Name', 'Company', 'Mobile', 'Email', 'Orders'].map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody className="divide-y">
            {data.map((c) => <tr key={c.id}><td className="px-4 py-3 font-medium">{c.name}</td><td className="px-4 py-3">{c.company || '—'}</td><td className="px-4 py-3">{c.mobile}</td><td className="px-4 py-3">{c.email || '—'}</td><td className="px-4 py-3">{c.orderCount}</td></tr>)}
            {data.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted">No customers yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </>
  );
}
