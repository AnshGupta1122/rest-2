'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CartPage() {
  const { items, totalAmount, totalItems, updateQuantity, removeItem } = useCart();
  const router = useRouter();
  
  const [orderType, setOrderType] = useState('DINE_IN');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  
  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <div className="emoji">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Let's add some delicious food!</p>
          <Link href="/menu" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!customerName || !customerPhone) {
      alert('Please enter your name and phone number');
      return;
    }
    
    if (orderType === 'DINE_IN' && !tableNumber) {
      alert('Please enter your table number');
      return;
    }
    
    if (orderType === 'DELIVERY' && !customerAddress) {
      alert('Please enter your delivery address');
      return;
    }
    
    // Save order details to sessionStorage for checkout page
    sessionStorage.setItem('checkout_data', JSON.stringify({
      orderType,
      customerName,
      customerPhone,
      tableNumber: orderType === 'DINE_IN' ? tableNumber : '',
      customerAddress: orderType === 'DELIVERY' ? customerAddress : '',
    }));
    
    router.push('/checkout');
  };

  return (
    <div className="cart-page">
      <div className="page-title" style={{ paddingBottom: 'var(--space-md)' }}>
        <h1>Your Cart ({totalItems} items)</h1>
      </div>
      
      <div className="section-inner">
        <div className="cart-items">
          {items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-emoji">🍽️</div>
              <div className="cart-item-info">
                <h4>
                  <span className={`menu-card-badge ${item.isVeg ? 'veg' : 'non-veg'}`} style={{ display: 'inline-block', position: 'static', width: '12px', height: '12px', marginRight: '6px', verticalAlign: 'middle', borderWidth: '1px' }}></span>
                  {item.name}
                </h4>
                <p>₹{item.price}</p>
              </div>
              
              <div className="cart-item-actions">
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <div className="cart-item-price">₹{item.price * item.quantity}</div>
                <button className="remove-btn" onClick={() => removeItem(item.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="order-summary">
          <h3>Order Details</h3>
          
          <div className="order-type-selector">
            <button 
              type="button"
              className={`order-type-btn ${orderType === 'DINE_IN' ? 'active' : ''}`}
              onClick={() => setOrderType('DINE_IN')}
            >
              <span className="icon">🍽️</span> Dine In
            </button>
            <button 
              type="button"
              className={`order-type-btn ${orderType === 'DELIVERY' ? 'active' : ''}`}
              onClick={() => setOrderType('DELIVERY')}
            >
              <span className="icon">🛵</span> Delivery
            </button>
          </div>
          
          <form onSubmit={handleProceed}>
            <div className="form-group">
              <label>Name</label>
              <input 
                type="text" 
                required 
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                required 
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="10-digit number"
                pattern="[0-9]{10}"
              />
            </div>
            
            {orderType === 'DINE_IN' ? (
              <div className="form-group">
                <label>Table Number</label>
                <input 
                  type="text" 
                  required={orderType === 'DINE_IN'} 
                  value={tableNumber}
                  onChange={e => setTableNumber(e.target.value)}
                  placeholder="e.g. 4"
                />
              </div>
            ) : (
              <div className="form-group">
                <label>Delivery Address</label>
                <textarea 
                  required={orderType === 'DELIVERY'}
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  placeholder="Complete address with landmark"
                ></textarea>
              </div>
            )}
            
            <div style={{ marginTop: 'var(--space-xl)' }}>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="summary-row">
                <span>Taxes & Fees (5%)</span>
                <span>₹{Math.round(totalAmount * 0.05)}</span>
              </div>
              <div className="summary-row total">
                <span>Total to Pay</span>
                <span>₹{totalAmount + Math.round(totalAmount * 0.05)}</span>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: 'var(--space-lg)' }}
              >
                Proceed to Checkout
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
