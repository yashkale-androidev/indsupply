import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderApi } from '../api/services.js';
import { useAuth, useCart, useToast } from '../context/AppContext.jsx';
import { Icon } from '../components/icons.jsx';
import { Button, Card, EmptyState, Field, PageTitle, ProductImage } from '../components/ui.jsx';
import { cn, money, PAYMENT_METHODS } from '../lib/format.js';
import { payForOrder } from '../lib/payment.js';
import { SummaryRows } from './Cart.jsx';

const validate = (a) => {
  const e = {};
  if (!a.name.trim()) e.name = 'Enter the contact name';
  if (!/^[6-9]\d{9}$/.test(a.mobile)) e.mobile = 'Enter a valid 10-digit mobile number';
  if (!a.line1.trim()) e.line1 = 'Enter the delivery address';
  if (!a.city.trim()) e.city = 'Enter the city';
  if (!/^\d{6}$/.test(a.pincode)) e.pincode = 'Enter a 6-digit pincode';
  return e;
};

function Stepper({ step }) {
  const steps = ['Address', 'Review & Payment'];
  return (
    <ol className="mb-8 flex items-center gap-3 text-sm font-medium">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-3" aria-current={step === i + 1 ? 'step' : undefined}>
          <span className={cn('grid size-8 place-items-center rounded-full border font-bold', step >= i + 1 ? 'border-brand bg-brand' : 'bg-white text-muted')}>{step > i + 1 ? <Icon name="check" size={16} /> : i + 1}</span>
          <span className={step === i + 1 ? '' : 'text-muted'}>{s}</span>
          {i < steps.length - 1 && <span className="h-px w-8 bg-edge sm:w-16" />}
        </li>
      ))}
    </ol>
  );
}

export default function Checkout() {
  const { user } = useAuth();
  const { cart, reload } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [addr, setAddr] = useState({ name: user.name || '', mobile: user.mobile || '', company: user.company || '', line1: user.address?.line1 || '', city: user.address?.city || '', state: user.address?.state || '', pincode: user.address?.pincode || '' });
  const [deliveryType, setDeliveryType] = useState('BUSINESS');
  const [billingType, setBillingType] = useState(user.gstin ? 'GST' : 'NON_GST');
  const [gstin, setGstin] = useState(user.gstin || '');
  const [gstLegalName, setGstLegalName] = useState(user.gstLegalName || user.company || '');
  const [errors, setErrors] = useState({});
  const [method, setMethod] = useState(PAYMENT_METHODS[0].id);
  const [placing, setPlacing] = useState(false);

  if (!cart.items.length && !placing) return <EmptyState title="Your cart is empty" text="Add products before checking out." action={<Button as={Link} to="/products">Browse products</Button>} />;
  const field = (name, label, extra = {}) => (
    <Field name={name} label={label} value={addr[name]} error={errors[name]} onChange={(e) => setAddr({ ...addr, [name]: e.target.value })} {...extra} />
  );

  const next = (e) => {
    e.preventDefault();
    const v = validate(addr);
    if (billingType === 'GST') {
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin.trim().toUpperCase())) v.gstin = 'Enter a valid 15-character GSTIN';
      if (!gstLegalName.trim()) v.gstLegalName = 'Enter the GST registered legal name';
    }
    setErrors(v);
    if (!Object.keys(v).length) { setStep(2); window.scrollTo(0, 0); }
  };

  const place = async () => {
    setPlacing(true);
    let order;
    try {
      order = await orderApi.create({ address: addr, paymentMethod: method, deliveryType, billingType, gstin, gstLegalName });
    } catch (e) {
      setPlacing(false);
      if (e.details) { setErrors(e.details); setStep(1); }
      toast(e.message, 'error');
      return;
    }
    try {
      if (method !== 'COD') await payForOrder(order);
      navigate(`/order-confirmation/${order.id}`);
    } catch (e) {
      toast(`${e.message} Your order was saved. You can pay from My Orders.`, 'error');
      navigate(`/account/orders/${order.id}`);
    }
    reload();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageTitle>Checkout</PageTitle>
      <Stepper step={step} />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {step === 1 ? (
          <Card className="p-6">
            <h2 className="mb-2 font-display text-lg font-semibold">Delivery address</h2><p className="mb-4 text-sm text-muted">Choose your regular business address or enter a temporary fabrication / work-site delivery address.</p>
            <div className="mb-5 grid gap-3 sm:grid-cols-2"><label className={cn('cursor-pointer rounded-xl border p-3 text-sm', deliveryType === 'BUSINESS' && 'border-brand bg-brand-50')}><input type="radio" name="deliveryType" checked={deliveryType === 'BUSINESS'} onChange={() => { setDeliveryType('BUSINESS'); setAddr({ name: user.name || '', mobile: user.mobile || '', company: user.company || '', line1: user.address?.line1 || '', city: user.address?.city || '', state: user.address?.state || '', pincode: user.address?.pincode || '' }); }} className="mr-2"/>Business address</label><label className={cn('cursor-pointer rounded-xl border p-3 text-sm', deliveryType === 'WORK_SITE' && 'border-brand bg-brand-50')}><input type="radio" name="deliveryType" checked={deliveryType === 'WORK_SITE'} onChange={() => { setDeliveryType('WORK_SITE'); setAddr({ name: user.name || '', mobile: user.mobile || '', company: user.company || '', line1: '', city: '', state: 'Maharashtra', pincode: '' }); }} className="mr-2"/>Work-site / fabrication site</label></div>
            <form onSubmit={next} noValidate className="grid gap-4 sm:grid-cols-2">
              {field('name', 'Contact name', { autoComplete: 'name' })}
              {field('mobile', 'Mobile number', { inputMode: 'numeric', maxLength: 10, autoComplete: 'tel-national' })}
              {field('company', 'Company name', { className: 'sm:col-span-2', autoComplete: 'organization' })}
              {field('line1', 'Address', { className: 'sm:col-span-2', autoComplete: 'street-address' })}
              {field('city', 'City')}
              {field('state', 'State')}
              {field('pincode', 'Pincode', { inputMode: 'numeric', maxLength: 6 })}
              <div className="sm:col-span-2 mt-2 border-t pt-4"><h3 className="font-display font-semibold">Billing preference</h3><p className="mt-1 text-xs text-muted">GST applicable taxes are calculated according to the order; choose whether to include your GSTIN on the invoice.</p></div>
              <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2"><label className={cn('rounded-xl border p-3 text-sm', billingType === 'GST' && 'border-brand bg-brand-50')}><input type="radio" name="billingType" checked={billingType === 'GST'} onChange={() => setBillingType('GST')} className="mr-2"/>GST billing</label><label className={cn('rounded-xl border p-3 text-sm', billingType === 'NON_GST' && 'border-brand bg-brand-50')}><input type="radio" name="billingType" checked={billingType === 'NON_GST'} onChange={() => setBillingType('NON_GST')} className="mr-2"/>Non-GST customer billing</label></div>
              {billingType === 'GST' && <><Field name="gstin" label="GSTIN" value={gstin} maxLength={15} onChange={(e) => setGstin(e.target.value.toUpperCase())} error={errors.gstin}/><Field name="gstLegalName" label="GST registered legal name" value={gstLegalName} error={errors.gstLegalName} onChange={(e) => setGstLegalName(e.target.value)}/></>}
              <div className="sm:col-span-2"><Button type="submit" className="w-full sm:w-auto">Continue to review</Button></div>
            </form>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm"><h2 className="mb-2 font-display text-lg font-semibold">Delivering to</h2>
                  <p className="font-semibold">{addr.name} · {addr.mobile}</p>{addr.company && <p>{addr.company}</p>}
                  <p className="text-muted">{[addr.line1, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}</p></div>
                <button type="button" className="text-sm font-semibold underline" onClick={() => setStep(1)}>Change</button>
              </div>
            </Card>
            <Card className="p-6">
              <h2 className="mb-2 font-display text-lg font-semibold">Order items</h2>
              <ul className="divide-y">{cart.items.map((i) => (
                <li key={i.productId} className="flex items-center gap-4 py-3 text-sm">
                  <ProductImage product={i} className="size-14 shrink-0 rounded-lg border" />
                  <div className="flex-1"><b>{i.name}</b><p className="text-muted">{money(i.price)} × {i.qty}</p></div>
                  <b>{money(i.price * i.qty)}</b>
                </li>))}</ul>
            </Card>
            <Card className="p-6">
              <fieldset><legend className="mb-3 font-display text-lg font-semibold">Payment options</legend>
                <div className="space-y-3">{PAYMENT_METHODS.map((m) => (
                  <label key={m.id} className={cn('flex cursor-pointer items-start gap-3 rounded-xl border p-4', method === m.id && 'border-navy bg-brand-50')}>
                    <input type="radio" name="payment" className="mt-1 size-4 accent-navy" checked={method === m.id} onChange={() => setMethod(m.id)} />
                    <span><b className="block text-sm">{m.label}</b><span className="text-xs text-muted">{m.hint}</span></span>
                  </label>))}
                </div>
              </fieldset>
            </Card>
          </div>
        )}
        <Card className="h-fit p-6 lg:sticky lg:top-4">
          <h2 className="mb-4 font-display text-lg font-semibold">Price details</h2>
          <SummaryRows summary={cart.summary} />
          {step === 2 && <Button className="mt-5 w-full" disabled={placing} onClick={place}>{placing ? 'Placing order…' : 'Place Order'}</Button>}
          <p className="mt-3 text-xs text-muted">Prices, stock and totals are verified again when you place the order.</p>
        </Card>
      </div>
    </div>
  );
}
