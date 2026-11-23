import { useState } from 'react';
import { adminApi, categoryApi } from '../../api/services.js';
import { useToast } from '../../context/AppContext.jsx';
import { ART_KEYS, ProductArt } from '../../components/art.jsx';
import { Icon } from '../../components/icons.jsx';
import { Button, Card, ErrorState, Field, Loading, Modal } from '../../components/ui.jsx';
import { useAsync } from '../../lib/useAsync.js';

function CategoryForm({ initial, onSaved, onClose }) {
  const toast = useToast();
  const [f, setF] = useState({ name: '', description: '', art: '', ...initial });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErrors({});
    try { initial?.slug ? await adminApi.updateCategory(initial.slug, f) : await adminApi.createCategory(f); toast('Category saved', 'success'); onSaved(); }
    catch (err) { setErrors(err.details || {}); toast(err.message, 'error'); }
    setBusy(false);
  };
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field name="name" label="Category name" value={f.name} error={errors.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <Field name="description" label="Short description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
      <div className="flex items-end gap-3">
        <Field as="select" name="art" label="Illustration" className="flex-1" value={f.art} onChange={(e) => setF({ ...f, art: e.target.value })}><option value="">Default</option>{ART_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}</Field>
        <ProductArt art={f.art} className="h-14 w-16 rounded-lg bg-brand-50 p-1" />
      </div>
      <div className="flex gap-3"><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save category'}</Button><Button variant="outline" onClick={onClose}>Cancel</Button></div>
    </form>
  );
}

export default function AdminCategories() {
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const { data, loading, error, reload } = useAsync(() => categoryApi.list(), []);
  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.name}"?`)) return;
    try { await adminApi.deleteCategory(c.slug); toast('Category deleted', 'success'); reload(); } catch (e) { toast(e.message, 'error'); }
  };
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Categories</h1>
        <Button onClick={() => setEditing({})}><Icon name="plus" size={18} /> Add Category</Button>
      </div>
      {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : (
        <Card><ul className="divide-y">{data.map((c) => (
          <li key={c.slug} className="flex items-center gap-3 p-3 sm:p-4">
            <ProductArt art={c.art} category={c.slug} className="h-14 w-16 shrink-0 rounded-lg bg-brand-50 p-1" />
            <span className="min-w-0 flex-1"><b className="block">{c.name}</b><span className="block truncate text-xs text-muted">{c.description || c.slug} · {c.productCount} products</span></span>
            <button type="button" aria-label={`Edit ${c.name}`} onClick={() => setEditing(c)} className="grid size-11 place-items-center rounded-lg hover:bg-brand-100"><Icon name="edit" size={18} /></button>
            <button type="button" aria-label={`Delete ${c.name}`} onClick={() => remove(c)} className="grid size-11 place-items-center rounded-lg text-red-800 hover:bg-red-50"><Icon name="trash" size={18} /></button>
          </li>))}</ul></Card>
      )}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.slug ? 'Edit category' : 'Add category'}>
        {editing && <CategoryForm initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
      </Modal>
    </>
  );
}
