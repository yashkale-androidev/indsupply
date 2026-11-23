import { Link, useOutletContext } from 'react-router-dom';
import { ProductArt } from '../components/art.jsx';
import { Icon } from '../components/icons.jsx';
import { Breadcrumbs, PageTitle } from '../components/ui.jsx';
import { useDocumentTitle } from '../lib/useDocumentTitle.js';

export default function Categories() {
  useDocumentTitle('All Categories');
  const { categories } = useOutletContext();
  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'All Categories' }]} />
      <PageTitle sub="Browse our industrial product categories">All Categories</PageTitle>
      <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link to={`/category/${c.slug}`} className="flex items-center gap-4 rounded-2xl border bg-white p-3 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-soft sm:p-4">
              <ProductArt art={c.art} category={c.slug} className="h-20 w-24 shrink-0 rounded-xl bg-brand-50 p-1" />
              <span className="min-w-0 flex-1"><b className="block">{c.name}</b><span className="text-sm text-muted">{c.description}</span>
                {c.productCount != null && <span className="mt-1 block text-xs font-medium text-muted">{c.productCount} products</span>}</span>
              <Icon name="chevronRight" className="shrink-0 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
