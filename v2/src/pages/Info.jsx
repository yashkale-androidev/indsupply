import { Link, useParams } from 'react-router-dom';
import { BUSINESS } from '../config.js';
import { Breadcrumbs, Button, PageTitle } from '../components/ui.jsx';
import { useDocumentTitle } from '../lib/useDocumentTitle.js';

// Starter copy for the information pages. Replace the [BRACKETED] items with your real policy before launch.
const PAGES = {
  about: ['About Us', [
    ['Who we are', `${BUSINESS.name} supplies industrial hardware, tools and consumables to small and medium manufacturing units. We focus on the items plants reorder every week, so ordering stays simple and delivery stays reliable.`],
    ['What we supply', 'Fasteners, bearings, electrical items, lubricants, tools, safety items, industrial stationery, hydraulics and pneumatics, and adhesives and sealants.'],
    ['How we work', 'Browse or search by item code, place your order online, and track it until it reaches your gate. For bulk or regular supply, send us an enquiry and we will share the best price.'],
  ]],
  delivery: ['Delivery Information', [
    ['Delivery area', BUSINESS.deliveryNote],
    ['Delivery charges', 'Any applicable delivery charge is calculated at checkout and shown before you place the order. There is no minimum order value or minimum order quantity.'],
    ['Emergency and night-shift service', 'Support is available 24×7 for urgent production breakdowns and night-shift requirements. Call or WhatsApp us to confirm stock and dispatch timing.'],
  ]],
  returns: ['Returns & Refunds', [
    ['Returns', '[ADD RETURN WINDOW, e.g. 7 days] for unused items in original packaging. Items damaged in transit must be reported on delivery.'],
    ['Cancellations', 'You can cancel an order from My Orders until it is packed. After that, please contact us.'],
    ['Refunds', 'Refunds for online payments go back to the original payment method in [REFUND TIME].'],
  ]],
  privacy: ['Privacy Policy', [
    ['What we collect', 'Your name, company, contact details, delivery address and order history, so we can process and deliver your orders.'],
    ['Payments', 'We never see or store your card details. Payments are handled by our payment gateway.'],
    ['Your choices', `Write to ${BUSINESS.email} to correct or delete your account data.`],
  ]],
  terms: ['Terms & Conditions', [
    ['Prices', 'Prices are in Indian rupees and exclude GST unless stated. GST and delivery are added at checkout.'],
    ['Availability', 'Stock levels are updated regularly. If an item becomes unavailable after you order, we will contact you.'],
    ['Disputes', '[ADD YOUR JURISDICTION AND DISPUTE TERMS]'],
  ]],
};

export default function Info() {
  const { slug } = useParams();
  const page = PAGES[slug] || PAGES.about;
  useDocumentTitle(page[0]);
  return (
    <div className="mx-auto max-w-3xl px-3 py-6 sm:px-4 sm:py-10">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: page[0] }]} />
      <PageTitle>{page[0]}</PageTitle>
      <div className="space-y-5 rounded-2xl border bg-white p-5 sm:p-8">
        {page[1].map(([h, t]) => <section key={h}><h2 className="font-display text-lg font-semibold">{h}</h2><p className="mt-1.5 leading-relaxed text-muted">{t}</p>{slug === 'delivery' && h === 'Delivery area' && <div className="mt-3 flex flex-wrap gap-2">{BUSINESS.deliveryAreas.map((area) => <a key={area} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${area}, Waluj MIDC, Chhatrapati Sambhajinagar, Maharashtra`)}`} target="_blank" rel="noreferrer" className="rounded-full border px-3 py-2 text-sm font-semibold text-brand-dark underline-offset-2 hover:bg-brand-50 hover:underline">{area} · Map</a>)}</div>}</section>)}
      </div>
      <p className="mt-6 text-sm text-muted">Questions? <Link to="/contact" className="font-semibold underline">Contact us</Link> or call {BUSINESS.phone}.</p>
      <Button as={Link} to="/products" className="mt-4">Browse products</Button>
    </div>
  );
}
