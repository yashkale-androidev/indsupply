import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AppContext.jsx';
import { Icon } from '../../components/icons.jsx';
import { cn } from '../../lib/format.js';
import { useDocumentTitle } from '../../lib/useDocumentTitle.js';

const LINKS = [['/admin', 'Dashboard', 'dashboard', true], ['/admin/products', 'Products', 'boxes'], ['/admin/categories', 'Categories', 'tags'], ['/admin/orders', 'Orders', 'orders'], ['/admin/customers', 'Customers', 'users']];

export default function AdminLayout() {
  useDocumentTitle('Admin');
  const { user, signOut } = useAuth();
  const link = ({ isActive }) => cn('flex min-h-11 shrink-0 items-center gap-2.5 rounded-lg px-3.5 text-sm font-medium transition-colors', isActive ? 'bg-brand text-navy' : 'text-white hover:bg-white/10');
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="bg-navy text-white lg:sticky lg:top-0 lg:h-screen lg:p-5">
        <div className="flex items-center justify-between px-3 py-3 lg:mb-6 lg:px-0 lg:py-0">
          <Link to="/" className="font-display text-xl font-bold lg:text-2xl">Ind<span className="text-brand">Supply</span><span className="ml-1.5 rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold">ADMIN</span></Link>
          <button type="button" onClick={signOut} aria-label="Logout" className="grid size-11 place-items-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"><Icon name="logout" size={20} /></button>
        </div>
        <nav aria-label="Admin" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
          {LINKS.map(([to, label, icon, end]) => <NavLink key={to} to={to} end={end} className={link}><Icon name={icon} size={18} />{label}</NavLink>)}
          <Link to="/" className="flex min-h-11 shrink-0 items-center gap-2.5 rounded-lg px-3.5 text-sm text-slate-300 hover:text-white lg:mt-6"><Icon name="external" size={18} />View store</Link>
          <button type="button" onClick={signOut} className="hidden min-h-11 items-center gap-2.5 rounded-lg px-3.5 text-sm text-slate-300 hover:text-white lg:flex"><Icon name="logout" size={18} />Logout</button>
        </nav>
      </aside>
      <div className="min-w-0">
        <div className="hidden items-center justify-end gap-3 border-b bg-white px-6 py-3 text-sm lg:flex"><span className="grid size-8 place-items-center rounded-full bg-brand-100 font-bold">{user.name[0]}</span><span className="font-medium">{user.name}</span></div>
        <main className="p-3 sm:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
