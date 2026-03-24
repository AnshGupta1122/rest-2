'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [restaurantSettings, setRestaurantSettings] = useState<any>({});

  useEffect(() => {
    // Load checkout data
    const data = sessionStorage.getItem('checkout_data');
    if (!data || items.length === 0) {
      router.push('/cart');
      return;
    }
    setCheckoutData(JSON.parse(data));

    // Load restaurant settings for UPI
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => setRestaurantSettings(data))
      .catch(console.error);
  }, [items, router]);

  if (!checkoutData) return <div className="loading-spinner"><div className="spinner"></div></div>;

  const orderTotal = totalAmount + Math.round(totalAmount * 0.05);

  const confirmOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...checkoutData,
          items: items.map(item => ({ id: item.id, quantity: item.quantity })),
          paymentMethod: 'UPI',
        }),
      });

      if (!res.ok) throw new Error('Order creation failed');
      
      const order = await res.json();
      
      // Clear cart and checkout data
      clearCart();
      sessionStorage.removeItem('checkout_data');
      
      // Redirect to confirmation
      router.push(`/order-confirmation?id=${order.id}`);
    } catch (err) {
      alert('There was a problem processing your order. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="page-title" style={{ paddingBottom: 'var(--space-md)' }}>
        <h1>Checkout</h1>
      </div>
      
      <div className="checkout-grid">
        <div className="order-summary" style={{ position: 'static' }}>
          <h3>Order Details</h3>
          
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <p><strong>Name:</strong> {checkoutData.customerName}</p>
            <p><strong>Phone:</strong> {checkoutData.customerPhone}</p>
            <p><strong>Type:</strong> {checkoutData.orderType === 'DINE_IN' ? `Dine In (Table ${checkoutData.tableNumber})` : 'Delivery'}</p>
            {checkoutData.orderType === 'DELIVERY' && (
              <p><strong>Address:</strong> {checkoutData.customerAddress}</p>
            )}
          </div>
          
          <h4 style={{ marginBottom: 'var(--space-sm)' }}>Items</h4>
          <ul style={{ listStyle: 'none', marginBottom: 'var(--space-lg)', padding: 0 }}>
            {items.map(item => (
              <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-xs) 0', borderBottom: '1px dashed var(--border-light)' }}>
                <span>{item.quantity}x {item.name}</span>
                <span>₹{item.price * item.quantity}</span>
              </li>
            ))}
          </ul>
          
          <div className="summary-row total">
            <span>Total Payable</span>
            <span>₹{orderTotal}</span>
          </div>
        </div>
        
        <div className="payment-card">
          <h3>Payment</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
            Please scan the QR code below using any UPI app (GPay, PhonePe, Paytm) to make the payment.
          </p>
          
          <div className="qr-container">
            {/* Generate a QR code pointing to the UPI URI using Google Chart API or similar */}
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(restaurantSettings.upi_qr_data || 'upi://pay?pa=restaurant@upi')}&margin=0`} 
              alt="UPI QR Code" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          
          <div className="upi-id">
            UPI ID: {restaurantSettings.upi_id || 'restaurant@upi'}
          </div>
          
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 'var(--space-xl)' }}>
            Once you have completed the payment, click the button below to confirm your order.
          </p>
          
          <button 
            className="btn btn-primary btn-lg" 
            style={{ width: '100%' }}
            onClick={confirmOrder}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'I have paid & Confirm Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
