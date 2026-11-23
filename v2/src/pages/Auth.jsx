import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/services.js';
import { useAuth, useToast } from '../context/AppContext.jsx';
import { Icon } from '../components/icons.jsx';
import { Button, Card, Field, Modal } from '../components/ui.jsx';
import { cn } from '../lib/format.js';
import { useDocumentTitle } from '../lib/useDocumentTitle.js';

function PasswordField({ label, error, ...p }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Field label={label} error={error} type={show ? 'text' : 'password'} className="[&_input]:pr-12" {...p} />
      <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)} className="absolute right-1 top-[1.85rem] grid size-10 place-items-center rounded-lg text-muted hover:text-navy"><Icon name={show ? 'eyeOff' : 'eye'} size={18} /></button>
    </div>
  );
}

export default function Auth({ admin = false }) {
  useDocumentTitle(admin ? 'Admin Login' : 'Login / Register');
  const { user, signIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [tab, setTab] = useState('login');
  const [login, setLogin] = useState({ identifier: '', password: '', otp: '' });
  const [otpMode, setOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [reg, setReg] = useState({ name: '', company: '', mobile: '', email: '', password: '', terms: false });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState('');
  const [forgot, setForgot] = useState(false);

  if (user) return <Navigate to={from || (user.role === 'ADMIN' ? '/admin' : '/')} replace />;

  const finish = (res) => {
    if (admin && res.user.role !== 'ADMIN') throw new Error('This account does not have admin access.');
    signIn(res); navigate(from || (res.user.role === 'ADMIN' ? '/admin' : '/'), { replace: true });
  };
  const run = async (key, fn) => {
    setBusy(key); setErrors({});
    try { await fn(); } catch (e) { setErrors({ ...(e.details || {}), [key]: e.message }); }
    setBusy('');
  };
  const submitLogin = (e) => {
    e.preventDefault();
    run('login', async () => {
      if (!login.identifier.trim()) throw Object.assign(new Error('Enter your mobile number or email.'), { details: { identifier: 'Required' } });
      if (otpMode && !otpSent) { await authApi.requestOtp({ identifier: login.identifier }); setOtpSent(true); toast('OTP sent. In demo mode use 123456.'); return; }
      finish(otpMode ? await authApi.verifyOtp({ identifier: login.identifier, otp: login.otp }) : await authApi.login({ identifier: login.identifier, password: login.password }));
    });
  };
  const submitReg = (e) => {
    e.preventDefault();
    run('register', async () => {
      if (!reg.terms) throw new Error('Please accept the Terms & Conditions to continue.');
      const { terms, ...body } = reg;
      finish(await authApi.register(body));
    });
  };

  const loginForm = (
    <form onSubmit={submitLogin} noValidate className={cn('space-y-4 p-5 sm:p-8', tab !== 'login' && 'hidden md:block')}>
      <h1 className="font-display text-2xl font-bold">{admin ? 'Admin login' : 'Login'}</h1>
      {admin && <p className="text-sm text-muted">Sign in to manage products, orders and customers.</p>}
      <Field name="identifier" label={admin ? 'Email' : 'Mobile number / Email'} autoComplete="username" inputMode="email" value={login.identifier} error={errors.identifier} onChange={(e) => { setLogin({ ...login, identifier: e.target.value }); setOtpSent(false); }} />
      {otpMode ? (otpSent && <Field name="otp" label="Enter OTP" inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={login.otp} onChange={(e) => setLogin({ ...login, otp: e.target.value })} />) : (
        <PasswordField name="password" label="Password" autoComplete="current-password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
      )}
      {errors.login && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{errors.login}</p>}
      {!admin && <div className="text-right"><button type="button" className="min-h-9 text-sm font-semibold underline" onClick={() => setForgot(true)}>Forgot password?</button></div>}
      <Button type="submit" className="w-full" disabled={busy === 'login'}>{busy === 'login' ? 'Please wait…' : otpMode && !otpSent ? 'Send OTP' : 'Login'}</Button>
      {!admin && <Button variant="outline" className="w-full" onClick={() => { setOtpMode(!otpMode); setOtpSent(false); setErrors({}); }}>{otpMode ? 'Login with password' : 'Login with OTP'}</Button>}
      <p className="rounded-lg bg-brand-50 p-3 text-xs text-muted">Demo accounts: {admin ? 'admin@indsupply.in / admin123' : 'demo@indsupply.in / demo123 · admin@indsupply.in / admin123'}</p>
    </form>
  );

  const registerForm = (
    <form onSubmit={submitReg} noValidate className={cn('space-y-4 border-t p-5 sm:p-8 md:border-t-0', tab !== 'register' && 'hidden md:block')}>
      <h2 className="font-display text-2xl font-bold">Register</h2>
      {[['name', 'Full name', 'name'], ['company', 'Company name', 'organization'], ['mobile', 'Mobile number', 'tel-national'], ['email', 'Email address (optional)', 'email']].map(([k, label, ac]) => (
        <Field key={k} name={`reg-${k}`} label={label} autoComplete={ac} type={k === 'email' ? 'email' : 'text'} inputMode={k === 'mobile' ? 'numeric' : undefined} maxLength={k === 'mobile' ? 10 : undefined}
          value={reg[k]} error={errors[k]} onChange={(e) => setReg({ ...reg, [k]: e.target.value })} />
      ))}
      <PasswordField name="reg-password" label="Password" autoComplete="new-password" hint="At least 6 characters" value={reg.password} error={errors.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} />
      <label className="flex min-h-10 items-start gap-3 text-sm"><input type="checkbox" className="mt-0.5 size-5 accent-navy" checked={reg.terms} onChange={(e) => setReg({ ...reg, terms: e.target.checked })} />I agree to the Terms &amp; Conditions</label>
      {errors.register && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{errors.register}</p>}
      <Button type="submit" className="w-full" disabled={busy === 'register'}>{busy === 'register' ? 'Creating account…' : 'Create account'}</Button>
    </form>
  );

  return (
    <div className="mx-auto max-w-5xl px-3 py-6 sm:px-4 sm:py-10">
      {admin ? <Card className="mx-auto max-w-md">{loginForm}</Card> : (
        <>
          <div role="tablist" aria-label="Login or register" className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-brand-100 p-1 md:hidden">
            {[['login', 'Login'], ['register', 'Register']].map(([k, l]) => <button key={k} role="tab" type="button" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('min-h-11 rounded-lg text-sm font-semibold', tab === k ? 'bg-white shadow-soft' : 'text-muted')}>{l}</button>)}
          </div>
          <Card className="grid md:grid-cols-2 md:divide-x">{loginForm}{registerForm}</Card>
        </>
      )}
      <Modal open={forgot} onClose={() => setForgot(false)} title="Reset your password">
        <form noValidate onSubmit={async (e) => { e.preventDefault(); try { await authApi.forgotPassword({ identifier: login.identifier }); toast('If the account exists, reset instructions have been sent.', 'success'); setForgot(false); } catch (err) { toast(err.message, 'error'); } }} className="space-y-4">
          <Field name="forgot-id" label="Mobile number / Email" value={login.identifier} onChange={(e) => setLogin({ ...login, identifier: e.target.value })} />
          <Button type="submit" className="w-full">Send reset instructions</Button>
        </form>
      </Modal>
    </div>
  );
}
