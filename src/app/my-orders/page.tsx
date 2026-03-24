'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addItem, clearCart } = useCart();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('customer_token');
      if (!token) {
        router.push('/login?returnTo=/my-orders');
        return;
      }

      try {
        const res = await fetch('/api/customer/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 401) {
          localStorage.removeItem('customer_token');
          router.push('/login?returnTo=/my-orders');
          return;
        }

        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_phone');
    router.push('/');
  };

  const handleReorder = (orderItems: any[]) => {
    clearCart();
    orderItems.forEach(item => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        isVeg: item.isVeg,
      });
      // The add item context doesn't support setting quantity directly so we manually loop
      // but the addItem logic only sets quantity=1. 
    });
    // Redirect to cart
    router.push('/cart');
  };

  if (loading) return <div className="loading-spinner" style={{ minHeight: '60vh' }}><div className="spinner"></div></div>;

  return (
    <>
      <div className="page-title">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
          <div>
            <h1>My Orders</h1>
            <p>View your order history and reorder your favorites.</p>
          </div>
          <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
        </div>
      </div>

      <div className="section" style={{ paddingTop: 'var(--space-lg)', minHeight: '50vh' }}>
        <div className="section-inner" style={{ maxWidth: '800px' }}>
          
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-4xl) 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>🍽️</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-sm)' }}>No orders yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>Looks like you haven't placed any orders with this number.</p>
              <Link href="/menu" className="btn btn-primary">Browse Menu</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              {orders.map(order => (
                <div key={order.id} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)', paddingBottom: 'var(--space-md)', borderBottom: '1px solid var(--border-light)' }}>
                    <div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>
                        Order #{order.id.slice(-6).toUpperCase()} • {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{order.type.replace('_', ' ')} Order</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                      <div style={{ marginTop: '8px', fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>₹{order.totalAmount}</div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {order.items.map((item: any, idx: number) => (
                        <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.95rem' }}>
                          <span><span style={{ fontWeight: 600, color: 'var(--text-secondary)', marginRight: '8px' }}>{item.quantity}x</span> {item.name}</span>
                          <span>₹{item.price * item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Payment: {order.paymentMethod} {order.isPaid && <span style={{ color: 'var(--success)' }}>(Paid ✓)</span>}
                    </div>
                    <button 
                      onClick={() => handleReorder(order.items)} 
                      className="btn btn-outline btn-sm"
                    >
                      Reorder Items
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
        </div>
      </div>
    </>
  );
}
