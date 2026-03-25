'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function CustomerLoginForm() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/my-orders';

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/customer/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setStep(2);
      setMessage(`OTP code sent to ${email}. Check your inbox!`);
      if (data.previewUrl) setPreviewUrl(data.previewUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError('Please enter the full OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/customer/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), code: otp })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Invalid OTP');

      localStorage.setItem('customer_token', data.token);
      localStorage.setItem('customer_email', data.email);

      router.push(returnTo);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in to view your past orders</p>

        {error && <div className="login-error">{error}</div>}
        {message && (
          <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: 'var(--space-md)', textAlign: 'center' }}>
            {message}
            {previewUrl && (
              <div style={{ marginTop: '8px' }}>
                <a href={previewUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>
                  Click to view test email ↗
                </a>
              </div>
            )}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={requestOtp}>
            <div className="form-group" style={{ marginBottom: 'var(--space-xl)' }}>
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '1.1rem', padding: '14px' }}
              disabled={loading || !email.includes('@')}
            >
              {loading ? 'Sending OTP...' : 'Send Magic Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp}>
            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
              <label>Enter 4-Digit Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                placeholder="XXXX"
                required
                autoFocus
                style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px', fontWeight: 700 }}
              />
            </div>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); setError(''); setMessage(''); setPreviewUrl(''); }}
                style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Use a different email
              </button>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '1.1rem', padding: '14px' }}
              disabled={loading || otp.length < 4}
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 'var(--space-lg)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          By continuing, you agree to our Terms of Service.
        </p>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--border-light)' }}>
          <Link href="/" className="btn btn-outline btn-sm">Return Home</Link>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLogin() {
  return (
    <Suspense fallback={null}>
      <CustomerLoginForm />
    </Suspense>
  );
}