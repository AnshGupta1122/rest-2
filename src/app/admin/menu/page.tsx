'use client';

import { useEffect, useState } from 'react';

export default function AdminMenu() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '🍽️',
    categoryId: '',
    isVeg: true,
    isAvailable: true,
    isFeatured: false
  });

  const fetchData = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const [menuRes, catRes] = await Promise.all([
        fetch('/api/admin/menu', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/menu') // public categories list
      ]);
      
      const menuData = await menuRes.json();
      const catData = await catRes.json();
      
      setItems(menuData);
      setCategories(catData);
      if (catData.length > 0 && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: catData[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        image: item.image || '🍽️',
        categoryId: item.categoryId,
        isVeg: item.isVeg,
        isAvailable: item.isAvailable,
        isFeatured: item.isFeatured
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        image: '🍽️',
        categoryId: categories[0]?.id || '',
        isVeg: true,
        isAvailable: true,
        isFeatured: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    
    if (!formData.name || !formData.price || !formData.categoryId) {
      alert('Please fill required fields');
      return;
    }

    const payload = { ...formData, price: parseFloat(formData.price) };
    const url = editingItem ? `/api/admin/menu/${editingItem.id}` : '/api/admin/menu';
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`/api/admin/menu/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAvailability = async (item: any) => {
    const token = localStorage.getItem('admin_token');
    try {
      // Optimistic update
      setItems(items.map(i => i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i));
      
      await fetch(`/api/admin/menu/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: !item.isAvailable })
      });
    } catch (err) {
      console.error(err);
      fetchData(); // Revert on error
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <>
      <div className="admin-header">
        <h1>Menu Management</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          + Add New Item
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Price</th>
              <th>Type</th>
              <th>Availability</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <span style={{ fontSize: '1.5rem' }}>{item.image || '🍽️'}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {item.name}
                        {item.isFeatured && <span style={{ marginLeft: '8px', fontSize: '0.7rem', background: 'var(--accent)', color: 'var(--secondary)', padding: '2px 6px', borderRadius: '4px' }}>Special</span>}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{item.category?.name || 'Unknown'}</td>
                <td style={{ fontWeight: 600 }}>₹{item.price}</td>
                <td>
                  <span className={`status-badge ${item.isVeg ? 'ready' : 'preparing'}`}>
                    {item.isVeg ? 'Veg' : 'Non-Veg'}
                  </span>
                </td>
                <td>
                  <div 
                    className={`availability-toggle ${item.isAvailable ? 'active' : ''}`}
                    onClick={() => toggleAvailability(item)}
                  ></div>
                </td>
                <td>
                  <div className="actions">
                    <button className="btn btn-outline btn-sm" onClick={() => handleOpenModal(item)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input 
                    type="number" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})} 
                    required 
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Emoji/Icon</label>
                  <input 
                    type="text" 
                    value={formData.image} 
                    onChange={e => setFormData({...formData, image: e.target.value})} 
                    placeholder="e.g. 🍕"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  rows={2}
                ></textarea>
              </div>
              
              <div className="form-group">
                <label>Category *</label>
                <select 
                  value={formData.categoryId} 
                  onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: 'var(--space-xl)', marginTop: 'var(--space-md)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.isVeg} 
                    onChange={e => setFormData({...formData, isVeg: e.target.checked})} 
                  />
                  Pure Veg
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.isFeatured} 
                    onChange={e => setFormData({...formData, isFeatured: e.target.checked})} 
                  />
                  Featured/Special
                </label>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingItem ? 'Save Changes' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
