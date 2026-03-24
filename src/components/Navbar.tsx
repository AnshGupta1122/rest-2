'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [customerToken, setCustomerToken] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Simple check for auth state (re-runs on pathname change)
    setCustomerToken(localStorage.getItem('customer_token'));
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (pathname.startsWith('/admin')) {
    return null; // Admin has its own layout
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <span>🌶️</span> Spice Garden
        </Link>

        {/* Desktop Menu */}
        <div className="navbar-links">
          <Link href="/">Home</Link>
          <Link href="/menu">Menu</Link>
          {customerToken ? (
            <Link href="/my-orders">My Orders</Link>
          ) : (
            <Link href="/login">Login</Link>
          )}
          <Link href="/cart" className="cart-btn">
            🛒 Cart
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <span style={{ transform: isMobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></span>
          <span style={{ opacity: isMobileMenuOpen ? 0 : 1 }}></span>
          <span style={{ transform: isMobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }}></span>
        </button>

        {/* Mobile Menu Content */}
        {isMobileMenuOpen && (
          <div className="navbar-links open" style={{ display: 'flex' }}>
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link href="/menu" onClick={() => setIsMobileMenuOpen(false)}>Menu</Link>
            {customerToken ? (
              <Link href="/my-orders" onClick={() => setIsMobileMenuOpen(false)}>My Orders</Link>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
            )}
            <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              🛒 Cart 
              {totalItems > 0 && <span style={{ background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{totalItems}</span>}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
