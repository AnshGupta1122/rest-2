'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check authentication
  useEffect(() => {
    // We skip auth check on the login page itself
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      return;
    }

    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  if (!isAuthenticated) {
    return null; // Don't render anything while checking auth or redirecting
  }

  // Login page doesn't get the sidebar layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: '📊' },
    { label: 'Orders', path: '/admin/orders', icon: '📝' },
    { label: 'Menu Items', path: '/admin/menu', icon: '🍔' },
    { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile Sidebar Toggle */}
      <button 
        className="mobile-menu-btn" 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 200, display: 'none' }} // Hidden on desktop via CSS
      >
        <span style={{ transform: isSidebarOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></span>
        <span style={{ opacity: isSidebarOpen ? 0 : 1 }}></span>
        <span style={{ transform: isSidebarOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }}></span>
      </button>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => setIsSidebarOpen(false)} 
          style={{ zIndex: 90 }}
        ></div>
      )}

      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-logo">
          Spice Garden
          <small>Admin Panel</small>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`admin-nav-link ${pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="admin-logout">
          <button 
            className="admin-nav-link" 
            onClick={handleLogout}
            style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
          >
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
