import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supportApi } from '../api/services.js';
import { BUSINESS } from '../config.js';
import { useAuth, useToast } from '../context/AppContext.jsx';
import { useDocumentTitle } from '../lib/useDocumentTitle.js';
import { Icon } from '../components/icons.jsx';
import { Button, Card, Field, PageTitle } from '../components/ui.jsx';

export default function Contact() {
  useDocumentTitle('Contact Us');
  const [sp] = useSearchParams();
  const { user } = useAuth();
  const toast = useToast();
  const bulk = sp.get('subject') === 'bulk';
  const [f, setF] = useState({ name: user?.name || '', company: user?.company || '', type: bulk ? 'BULK_ENQUIRY' : 'PRODUCT_ENQUIRY', email: user?.email || '', mobile: user?.mobile || '', message: bulk ? 'I would like a quote for: ' : sp.get('subject') ? `${sp.get('subject')}\n` : '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErrors({});
    try { await supportApi.send(f); setSent(true); }
    catch (err) { setErrors(err.details || {}); toast(err.message, 'error'); }
    setBusy(false);
  };
  const info = [['phone', BUSINESS.phone], ['mail', BUSINESS.email], ['clock', BUSINESS.hours], ['truck', BUSINESS.address]];
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <PageTitle>{bulk ? 'Bulk enquiry' : 'Contact us'}</PageTitle>
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <Card className="p-6">
          {sent ? (
            <div className="py-10 text-center"><p className="font-display text-xl font-semibold">Message sent</p><p className="mt-2 text-muted">We'll get back to you on the details you gave us.</p></div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
              <Field name="name" label="Name" value={f.name} error={errors.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              <Field name="company" label="Company name" value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} />
              <Field as="select" name="type" label="Enquiry type" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
                <option value="PRODUCT_ENQUIRY">Product enquiry</option><option value="BULK_ENQUIRY">Bulk order</option><option value="QUOTATION">Request a quotation</option><option value="SUPPORT">Order support</option><option value="OTHER">Other</option>
              </Field>
              <Field name="mobile" label="Mobile number" inputMode="numeric" value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value })} />
              <Field name="email" label="Email" type="email" className="sm:col-span-2" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
              <Field as="textarea" rows={6} name="message" label="How can we help?" className="sm:col-span-2" value={f.message} error={errors.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
              <div className="sm:col-span-2"><Button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</Button></div>
            </form>
          )}
        </Card>
        <Card className="h-fit space-y-4 p-6 text-sm">
          {info.map(([icon, text]) => <p key={icon} className="flex items-start gap-3"><Icon name={icon} size={18} className="mt-0.5 shrink-0" />{text}</p>)}
          <Button as="a" href={`https://wa.me/${BUSINESS.whatsapp}`} target="_blank" rel="noreferrer" variant="outline" className="w-full">Chat on WhatsApp</Button>
        </Card>
      </div>
    </div>
  );
}
