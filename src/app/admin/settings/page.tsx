'use client';

import { useEffect, useState } from 'react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    restaurant_name: '',
    restaurant_tagline: '',
    restaurant_phone: '',
    restaurant_address: '',
    upi_id: '',
    upi_qr_data: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      try {
        const res = await fetch('/api/admin/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setSettings({
          restaurant_name: data.restaurant_name || '',
          restaurant_tagline: data.restaurant_tagline || '',
          restaurant_phone: data.restaurant_phone || '',
          restaurant_address: data.restaurant_address || '',
          upi_id: data.upi_id || '',
          upi_qr_data: data.upi_qr_data || ''
        });
      } catch (error) {
        console.error('Failed to fetch settings', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const token = localStorage.getItem('admin_token');
    
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      
      if (res.ok) {
        setToast('Settings saved successfully!');
        setTimeout(() => setToast(''), 3000);
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <>
      <div className="admin-header">
        <h1>Restaurant Settings</h1>
      </div>

      <div style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          
          <div className="admin-table-wrapper" style={{ padding: 'var(--space-xl)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-sm)', borderBottom: '1px solid var(--border-light)' }}>
              General Information
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
              <div className="form-group">
                <label>Restaurant Name</label>
                <input 
                  type="text" 
                  value={settings.restaurant_name}
                  onChange={e => setSettings({...settings, restaurant_name: e.target.value})}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Tagline</label>
                <input 
                  type="text" 
                  value={settings.restaurant_tagline}
                  onChange={e => setSettings({...settings, restaurant_tagline: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Contact Phone (WhatsApp)</label>
                <input 
                  type="text" 
                  value={settings.restaurant_phone}
                  onChange={e => setSettings({...settings, restaurant_phone: e.target.value})}
                  required 
                  placeholder="+91 9876543210"
                />
                <small style={{ color: 'var(--text-muted)' }}>This number will receive WhatsApp orders.</small>
              </div>
              
              <div className="form-group">
                <label>Address</label>
                <textarea 
                  value={settings.restaurant_address}
                  onChange={e => setSettings({...settings, restaurant_address: e.target.value})}
                  rows={2}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="admin-table-wrapper" style={{ padding: 'var(--space-xl)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-sm)', borderBottom: '1px solid var(--border-light)' }}>
              Payment Details (UPI)
            </h2>
            
            <div className="form-group">
              <label>Business UPI ID</label>
              <input 
                type="text" 
                value={settings.upi_id}
                onChange={e => setSettings({...settings, upi_id: e.target.value})}
                required 
                placeholder="restaurant@okicici"
              />
            </div>
            
            <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
              <label>UPI QR String / Intent URI</label>
              <input 
                type="text" 
                value={settings.upi_qr_data}
                onChange={e => setSettings({...settings, upi_qr_data: e.target.value})}
                required 
                placeholder="upi://pay?pa=restaurant@okicici&pn=SpiceGarden"
              />
              <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                This is the raw string embedded in the QR code. You can use standard UPI intent format: 
                <code>upi://pay?pa=YOUR_UPI_ID&pn=YOUR_BUSINESS_NAME</code>
              </small>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-md)' }}>
            <button 
              type="submit" 
              className="btn btn-primary btn-lg"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
        </form>
      </div>

      {toast && (
        <div className="toast-container">
          <div className="toast success">✓ {toast}</div>
        </div>
      )}
    </>
  );
}
