import { useState } from 'react';
import { Link } from 'react-router-dom';
import { customerApi } from '../api/services.js';
import { useAuth, useToast } from '../context/AppContext.jsx';
import { Icon } from '../components/icons.jsx';
import { Button, Card, Field, PageTitle } from '../components/ui.jsx';

export default function Profile() {
  const { user, setUser, signOut } = useAuth();
  const toast = useToast();
  const [f, setF] = useState({ name: user.name || '', company: user.company || '', mobile: user.mobile || '', email: user.email || '', gstin: user.gstin || '', gstLegalName: user.gstLegalName || '', line1: user.address?.line1 || '', city: user.address?.city || '', state: user.address?.state || '', pincode: user.address?.pincode || '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const bind = (name, label, extra) => <Field name={name} label={label} value={f[name]} error={errors[name]} onChange={(e) => setF({ ...f, [name]: e.target.value })} {...extra} />;

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setErrors({});
    try {
      const { line1, city, state, pincode, ...rest } = f;
      setUser(await customerApi.updateProfile({ ...rest, address: { line1, city, state, pincode } }));
      toast('Profile saved', 'success');
    } catch (err) { setErrors(err.details || {}); toast(err.message, 'error'); }
    setSaving(false);
  };

  const nav = 'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium hover:bg-brand-100';
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <PageTitle>My Profile</PageTitle>
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <Card className="h-fit p-3">
          <span className={`${nav} bg-brand-100 font-semibold`}><Icon name="user" size={18} /> Profile information</span>
          <Link to="/account/orders" className={nav}><Icon name="box" size={18} /> My Orders</Link>
          <Link to="/contact" className={nav}><Icon name="headset" size={18} /> Help &amp; Support</Link>
          <button type="button" onClick={signOut} className={`${nav} w-full text-left`}><Icon name="logout" size={18} /> Logout</button>
        </Card>
        <Card className="p-6">
          <h2 className="mb-5 font-display text-lg font-semibold">Profile information</h2>
          <form onSubmit={save} noValidate className="grid gap-4 sm:grid-cols-2">
            {bind('name', 'Name', { autoComplete: 'name' })}
            {bind('company', 'Company name', { autoComplete: 'organization' })}
            {bind('mobile', 'Mobile number', { inputMode: 'numeric', maxLength: 10 })}
            {bind('email', 'Email address', { type: 'email', autoComplete: 'email' })}
            <div className="sm:col-span-2 mt-2 border-t pt-4"><h3 className="font-display font-semibold">GST information</h3><p className="mt-1 text-xs text-muted">Add your business GST details to request GST billing. Leave blank for non-GST billing.</p></div>
            {bind('gstLegalName', 'GST registered legal name', { className: 'sm:col-span-2' })}
            {bind('gstin', 'GSTIN (15 characters)', { maxLength: 15, autoCapitalize: 'characters', className: 'sm:col-span-2', onChange: (e) => setF({ ...f, gstin: e.target.value.toUpperCase() }) })}
            {bind('line1', 'Business address', { className: 'sm:col-span-2' })}
            {bind('city', 'City')}{bind('state', 'State')}{bind('pincode', 'Pincode', { inputMode: 'numeric', maxLength: 6 })}
            <div className="sm:col-span-2"><Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button></div>
          </form>
        </Card>
      </div>
    </div>
  );
}
