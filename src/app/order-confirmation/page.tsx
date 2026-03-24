'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [restaurantPhone, setRestaurantPhone] = useState('');

  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.restaurant_phone) {
          // Clean phone number for WhatsApp link
          setRestaurantPhone(data.restaurant_phone.replace(/\D/g, ''));
        }
      })
      .catch(console.error);
  }, []);

  if (!orderId) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-card">
          <h2>Order Not Found</h2>
          <Link href="/menu" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>Return to Menu</Link>
        </div>
      </div>
    );
  }

  const handleWhatsApp = () => {
    // In a real app, you would fetch the full order details here to build the message.
    // For this demonstration, we'll create a simple message with the order ID.
    const message = `Hello! I just placed an order with Order ID: *#${orderId.slice(-6)}*.\nPlease verify my payment and confirm the order. Thank you!`;
    const whatsappUrl = `https://wa.me/${restaurantPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <div className="confirmation-icon">✓</div>
        <h2>Order Confirmed!</h2>
        <p>Thank you for your order. We've received it and will start preparing it shortly.</p>
        
        <div className="order-id">
          Order ID: <strong>#{orderId.slice(-6).toUpperCase()}</strong>
        </div>
        
        <div style={{ marginTop: 'var(--space-2xl)' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
            To speed up verification and receive your bill directly via WhatsApp, click below:
          </p>
          <button onClick={handleWhatsApp} className="whatsapp-btn">
            <span style={{ fontSize: '1.2rem' }}>📱</span> Send Bill via WhatsApp
          </button>
        </div>
        
        <div style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--border-light)' }}>
          <Link href="/" className="btn btn-outline">Return to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmation() {
  return (
    <Suspense fallback={<div className="loading-spinner"><div className="spinner"></div></div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
