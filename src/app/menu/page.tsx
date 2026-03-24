'use client';

import { useState, useEffect } from 'react';
import MenuCard from '@/components/MenuCard';

export default function MenuPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
        else setError('Failed to load menu');
        setLoading(false);
      })
      .catch(() => {
        setError('Network error');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section" style={{ textAlign: 'center', minHeight: '60vh' }}>
        <h2>Oops!</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Filter items based on category, search, and veg
  const visibleCategories = activeCategory === 'all' 
    ? categories 
    : categories.filter(c => c.id === activeCategory);

  return (
    <>
      <div className="page-title">
        <h1>Our Menu</h1>
        <p>Discover our wide selection of authentic Indian dishes.</p>
      </div>

      <div className="section" style={{ paddingTop: 'var(--space-lg)' }}>
        <div className="section-inner">
          <div className="menu-filters">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search for dishes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button 
              className={`veg-toggle ${vegOnly ? 'active' : ''}`}
              onClick={() => setVegOnly(!vegOnly)}
            >
              <div className="menu-card-badge veg" style={{ position: 'relative', top: 0, left: 0 }}></div>
              Veg Only
            </button>
          </div>

          <div className="category-tabs">
            <button 
              className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.image} {cat.name}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3xl)' }}>
            {visibleCategories.map(cat => {
              const filteredItems = cat.items.filter((item: any) => {
                const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
                const matchesVeg = !vegOnly || item.isVeg;
                return matchesSearch && matchesVeg;
              });

              if (filteredItems.length === 0) return null;

              return (
                <div key={cat.id}>
                  <h2 style={{ fontSize: '1.8rem', marginBottom: 'var(--space-lg)', borderBottom: '2px solid var(--border-light)', paddingBottom: 'var(--space-xs)' }}>
                    {cat.image} {cat.name}
                  </h2>
                  <div className="menu-grid">
                    {filteredItems.map((item: any) => (
                      <MenuCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              );
            })}
            
            {!categories.some(cat => cat.items.some((item: any) => 
               (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))) && 
               (!vegOnly || item.isVeg)
            )) && (
              <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-secondary)' }}>
                <h3>No items found</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
