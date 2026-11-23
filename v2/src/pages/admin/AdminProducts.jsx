import { useState } from 'react';
import { adminApi, categoryApi } from '../../api/services.js';
import { useToast } from '../../context/AppContext.jsx';
import { Icon } from '../../components/icons.jsx';
import { ART_KEYS } from '../../components/art.jsx';
import { Badge, Button, Card, ErrorState, Field, Loading, Modal, ProductImage } from '../../components/ui.jsx';
import { money } from '../../lib/format.js';
import { useAsync } from '../../lib/useAsync.js';

const BLANK = { name: '', sku: '', brand: '', category: '', unit: 'piece', price: '', stock: 0, description: '', imageUrl: '', active: true };

function ProductForm({ initial, categories, onSaved, onClose }) {
  const toast = useToast();
  const [f, setF] = useState({ ...BLANK, category: categories[0]?.slug || '', ...initial });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const bind = (name, label, extra) => <Field name={name} label={label} value={f[name]} error={errors[name]} onChange={(e) => setF({ ...f, [name]: e.target.value })} {...extra} />;
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErrors({});
    try {
      initial?.id ? await adminApi.updateProduct(initial.id, f) : await adminApi.createProduct(f);
      toast(initial?.id ? 'Product updated' : 'Product added', 'success'); onSaved();
    } catch (err) { setErrors(err.details || {}); toast(err.message, 'error'); }
    setBusy(false);
  };
  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      {bind('name', 'Product name', { className: 'sm:col-span-2' })}
      {bind('sku', 'SKU / Item code')}{bind('brand', 'Brand')}
      <Field as="select" name="category" label="Category" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</Field>
      {bind('unit', 'Unit')}
      {bind('price', 'Price (₹, excl. GST)', { type: 'number', min: 0, step: '0.01' })}
      {bind('stock', 'Stock quantity', { type: 'number', min: 0 })}
      {bind('imageUrl', 'Image URL', { placeholder: 'https://…', hint: 'Leave empty to use an illustration' })}
      <Field as="select" name="art" label="Illustration (when no image)" value={f.art || ''} onChange={(e) => setF({ ...f, art: e.target.value })}><option value="">Match category</option>{ART_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}</Field>
      {bind('description', 'Description', { as: 'textarea', rows: 3, className: 'sm:col-span-2' })}
      <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" className="size-4 accent-navy" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} />Visible in the store</label>
      <div className="flex gap-3 sm:col-span-2"><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save product'}</Button><Button variant="outline" onClick={onClose}>Cancel</Button></div>
    </form>
  );
}

export default function AdminProducts() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null); // null | {} (new) | product
  const cats = useAsync(() => categoryApi.list(), []);
  const { data, loading, error, reload } = useAsync(() => adminApi.products({ q }), [q]);

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try { await adminApi.deleteProduct(p.id); toast('Product deleted', 'success'); reload(); } catch (e) { toast(e.message, 'error'); }
  };
  const toggle = async (p) => {
    try { await adminApi.updateProduct(p.id, { ...p, active: !p.active }); reload(); } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Products</h1>
        <Button onClick={() => setEditing({})}><Icon name="plus" size={18} /> Add Product</Button>
      </div>
      <Field name="q" aria-label="Search products" placeholder="Search by name or item code" value={q} onChange={(e) => setQ(e.target.value)} className="mb-4 max-w-sm" />
      {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-brand-50 text-xs text-muted"><tr>{['Image', 'Product name', 'SKU', 'Price', 'Stock', 'Status', 'Actions'].map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
            <tbody className="divide-y">
              {data.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2"><ProductImage product={p} className="size-10 rounded-lg border" /></td>
                  <td className="px-4 py-2 font-medium">{p.name}<span className="block text-xs font-normal text-muted">{p.categoryName}</span></td>
                  <td className="px-4 py-2">{p.sku}</td>
                  <td className="px-4 py-2">{money(p.price)}</td>
                  <td className="px-4 py-2">{p.stock <= 0 ? <Badge tone="red">Out of stock</Badge> : p.stock <= 100 ? <Badge tone="amber">{p.stock} (low)</Badge> : p.stock.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-2"><button type="button" onClick={() => toggle(p)} aria-label={`${p.active ? 'Disable' : 'Enable'} ${p.name}`}><Badge tone={p.active ? 'green' : 'gray'}>{p.active ? 'Active' : 'Disabled'}</Badge></button></td>
                  <td className="px-4 py-2"><div className="flex gap-1">
                    <button type="button" aria-label={`Edit ${p.name}`} onClick={() => setEditing(p)} className="grid size-9 place-items-center rounded-lg hover:bg-brand-100"><Icon name="edit" size={18} /></button>
                    <button type="button" aria-label={`Delete ${p.name}`} onClick={() => remove(p)} className="grid size-9 place-items-center rounded-lg text-red-800 hover:bg-red-50"><Icon name="trash" size={18} /></button>
                  </div></td>
                </tr>))}
              {data.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted">No products match your search.</td></tr>}
            </tbody>
          </table>
        </Card>
      )}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit product' : 'Add product'} wide>
        {editing && cats.data && <ProductForm initial={editing} categories={cats.data} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
      </Modal>
    </>
  );
}
