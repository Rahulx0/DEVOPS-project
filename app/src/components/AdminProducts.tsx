import React, { useState } from 'react';
import { addProduct, deleteProduct } from '../lib/firebase';
import { useProducts } from '../hooks/useProducts';
import { sampleProducts } from '../scripts/seedProducts';

const AdminProducts: React.FC = () => {
  const { products, loading, error } = useProducts();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    category: 'Apparel' as 'Apparel' | 'Sneakers',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const newId = await addProduct({
        name: formData.name,
        price: Number(formData.price),
        image: formData.image,
        category: formData.category,
        description: formData.description
      });
      setMessage(`✅ Product added with ID: ${newId}`);
      setFormData({ name: '', price: '', image: '', category: 'Apparel', description: '' });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setMessage(`❌ Error: ${err}`);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected products?`)) return;
    
    setSubmitting(true);
    setMessage(`Deleting ${selectedIds.length} products...`);
    
    try {
      for (const id of selectedIds) {
        await deleteProduct(id);
      }
      setMessage(`✅ Deleted ${selectedIds.length} products`);
      setSelectedIds([]);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setMessage(`❌ Error: ${err}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkImport = async () => {
    if (!confirm(`Import ${sampleProducts.length} products from seedProducts.ts?`)) return;
    
    setSubmitting(true);
    setMessage(`Importing ${sampleProducts.length} products...`);
    
    try {
      let count = 0;
      for (const product of sampleProducts) {
        await addProduct(product);
        count++;
        setMessage(`Importing... ${count}/${sampleProducts.length}`);
      }
      setMessage(`✅ Imported ${sampleProducts.length} products!`);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setMessage(`❌ Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">🛠️ Admin - Manage Products</h1>
        
        {message && (
          <div className="mb-4 p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded shadow">{message}</div>
        )}

        {/* Add Product Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Product</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Product Name"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                className="border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <input
              type="text"
              placeholder="Image URL"
              value={formData.image}
              onChange={e => setFormData({...formData, image: e.target.value})}
              className="border dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
            <select
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value as 'Apparel' | 'Sneakers'})}
              className="border dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="Apparel">Apparel</option>
              <option value="Sneakers">Sneakers</option>
            </select>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="border dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={3}
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Product'}
            </button>
          </form>
        </div>

        {/* Bulk Import */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">📦 Bulk Import</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Import products from <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">app/src/scripts/seedProducts.ts</code>
          </p>
          <button
            type="button"
            onClick={handleBulkImport}
            disabled={submitting}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            🌱 Import {sampleProducts.length} Products
          </button>
        </div>

        {/* Product List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Current Products ({products.length})</h2>
            {products.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {selectedIds.length === products.length ? 'Deselect All' : 'Select All'}
                </button>
                {selectedIds.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    disabled={submitting}
                    className="bg-red-600 text-white px-4 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                  >
                    Delete Selected ({selectedIds.length})
                  </button>
                )}
              </div>
            )}
          </div>
          {loading && <p>Loading...</p>}
          {!loading && error && <p className="text-red-500">{error}</p>}
          {!loading && !error && products.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">No products yet. Add your first product above!</p>
          )}
          {!loading && !error && products.length > 0 && (
            <div className="space-y-3">
              {products.map(product => (
                <div 
                  key={product.id} 
                  className={`flex items-center justify-between border-b dark:border-gray-700 pb-3 ${selectedIds.includes(product.id) ? 'bg-blue-50 dark:bg-gray-700 -mx-2 px-2 rounded' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="w-5 h-5"
                    />
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">${product.price} • {product.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
