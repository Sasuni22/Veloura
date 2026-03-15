import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { orderService } from '../services/api';

// ── Local product store (reads from localStorage, falls back to defaults) ──
import { products as defaultProducts, categories as defaultCategories } from '../data/products';

function useAdminStore() {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_products');
      return saved ? JSON.parse(saved) : defaultProducts;
    } catch { return defaultProducts; }
  });

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_categories');
      return saved ? JSON.parse(saved) : defaultCategories;
    } catch { return defaultCategories; }
  });

  const saveProducts = (updated) => {
    setProducts(updated);
    localStorage.setItem('admin_products', JSON.stringify(updated));
  };

  const saveCategories = (updated) => {
    setCategories(updated);
    localStorage.setItem('admin_categories', JSON.stringify(updated));
  };

  return { products, categories, saveProducts, saveCategories };
}

// ── Status config ──
const STATUS = {
  pending:    { color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-400',   label: 'Pending' },
  confirmed:  { color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-400',    label: 'Confirmed' },
  processing: { color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-400',  label: 'Processing' },
  shipped:    { color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-400',  label: 'Shipped' },
  delivered:  { color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400', label: 'Delivered' },
  cancelled:  { color: 'bg-red-100 text-red-700',       dot: 'bg-red-400',     label: 'Cancelled' },
};

// ── Sidebar nav items ──
const NAV = [
  { id: 'orders',     label: 'Orders',     icon: '📦' },
  { id: 'products',   label: 'Products',   icon: '👗' },
  { id: 'categories', label: 'Categories', icon: '🗂️' },
];

// ════════════════════════════════════════════
// ORDERS PANEL
// ════════════════════════════════════════════
function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrders();
      setOrders(res.data || []);
    } catch {
      // Demo mode — show sample orders if backend not connected
      setOrders([
        { _id: '1', orderNumber: 'ORD-001', name: 'Amara Silva', email: 'amara@email.com', phone: '+94 77 123 4567', address: '12 Lake Rd, Colombo 03', product: 'Floral Silk Maxi Dress', quantity: 1, totalAmount: 249, paymentMethod: 'cod', status: 'pending', notes: '', createdAt: new Date().toISOString() },
        { _id: '2', orderNumber: 'ORD-002', name: 'Priya Mendis', email: 'priya@email.com', phone: '+94 71 987 6543', address: '45 Galle Face, Colombo 01', product: 'Silk Slip Dress', quantity: 2, totalAmount: 240, paymentMethod: 'bank', status: 'confirmed', notes: 'Gift wrap please', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { _id: '3', orderNumber: 'ORD-003', name: 'Nisha Fernando', email: 'nisha@email.com', phone: '+94 76 555 0011', address: '8 Kandy Rd, Nugegoda', product: 'Wide-Leg Linen Trousers', quantity: 1, totalAmount: 110, paymentMethod: 'cod', status: 'shipped', notes: '', createdAt: new Date(Date.now() - 172800000).toISOString() },
        { _id: '4', orderNumber: 'ORD-004', name: 'Kavya Perera', email: 'kavya@email.com', phone: '+94 70 222 3344', address: '33 Temple St, Kandy', product: 'Boho Midi Dress', quantity: 1, totalAmount: 75, paymentMethod: 'bank', status: 'delivered', notes: '', createdAt: new Date(Date.now() - 259200000).toISOString() },
        { _id: '5', orderNumber: 'ORD-005', name: 'Dilini Rajapaksa', email: 'dilini@email.com', phone: '+94 72 888 9900', address: '7 Beach Rd, Galle', product: 'Off-Shoulder Knit Top', quantity: 3, totalAmount: 216, paymentMethod: 'cod', status: 'pending', notes: 'Size L please', createdAt: new Date(Date.now() - 3600000).toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await orderService.updateStatus(id, status);
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
      toast.success(`Order marked as ${status}`);
    } catch {
      // demo mode
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
      toast.success(`Order marked as ${status}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search || [o.orderNumber, o.name, o.product, o.email]
      .some(f => f?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.reduce((s, o) => s + (o.totalAmount || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, icon: '📦', bg: 'bg-blue-50', text: 'text-blue-700' },
          { label: 'Pending', value: stats.pending, icon: '⏳', bg: 'bg-amber-50', text: 'text-amber-700' },
          { label: 'Delivered', value: stats.delivered, icon: '✅', bg: 'bg-emerald-50', text: 'text-emerald-700' },
          { label: 'Revenue', value: `$${stats.revenue.toFixed(0)}`, icon: '💰', bg: 'bg-rose-50', text: 'text-rose-700' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`${s.bg} rounded-2xl p-5`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`text-2xl font-bold ${s.text}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders, customers..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...Object.keys(STATUS)].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${filterStatus === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s === 'all' ? 'All' : STATUS[s].label}
            </button>
          ))}
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors ml-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 text-sm mt-3">Loading orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-400">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Order', 'Customer', 'Product', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 first:pl-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order, i) => (
                  <motion.tr key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-4 pl-6">
                      <span className="font-mono text-xs font-bold text-rose-600">{order.orderNumber}</span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-gray-800">{order.name}</p>
                      <p className="text-xs text-gray-400">{order.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-700 max-w-[140px] truncate">{order.product}</p>
                      <p className="text-xs text-gray-400">Qty: {order.quantity}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-bold text-gray-900">${order.totalAmount?.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${order.paymentMethod === 'cod' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {order.paymentMethod === 'cod' ? 'COD' : 'Bank'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${STATUS[order.status]?.dot || 'bg-gray-400'}`} />
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS[order.status]?.color || ''}`}>
                          {STATUS[order.status]?.label || order.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setSelected(order)}
                          className="text-xs font-medium text-rose-600 hover:text-rose-800 transition-colors">
                          View
                        </button>
                        {order.status === 'pending' && (
                          <button onClick={() => handleStatus(order._id, 'confirmed')}
                            disabled={updatingId === order._id}
                            className="text-xs font-medium text-emerald-600 hover:text-emerald-800 transition-colors disabled:opacity-50">
                            Accept
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Order Details</h3>
                  <p className="font-mono text-sm text-rose-600">{selected.orderNumber}</p>
                </div>
                <button onClick={() => setSelected(null)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 text-sm mb-6">
                {[
                  ['Customer', selected.name],
                  ['Email', selected.email],
                  ['Phone', selected.phone],
                  ['Address', selected.address],
                  ['Product', selected.product],
                  ['Quantity', selected.quantity],
                  ['Total', `$${selected.totalAmount?.toFixed(2)}`],
                  ['Payment', selected.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'],
                  ['Notes', selected.notes || '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3 py-2 border-b border-gray-50">
                    <span className="text-gray-400 w-24 shrink-0">{k}</span>
                    <span className="text-gray-800 font-medium">{v}</span>
                  </div>
                ))}
              </div>

              {/* Status updater */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Update Status</p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(STATUS).map(([key, val]) => (
                    <button key={key} onClick={() => handleStatus(selected._id, key)}
                      disabled={updatingId === selected._id}
                      className={`py-2 px-3 rounded-xl text-xs font-medium transition-all border-2 ${
                        selected.status === key
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}>
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>

              {selected.receiptImage && (
                <div className="mt-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bank Receipt</p>
                  <a href={`/uploads/receipts/${selected.receiptImage}`} target="_blank" rel="noopener noreferrer"
                    className="block rounded-xl overflow-hidden border border-gray-200 hover:border-rose-300 transition-colors">
                    <img src={`/uploads/receipts/${selected.receiptImage}`} alt="Receipt" className="w-full max-h-48 object-contain" />
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ════════════════════════════════════════════
// PRODUCTS PANEL
// ════════════════════════════════════════════
function ProductsPanel({ products, saveProducts }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterCat, setFilterCat] = useState('All');
  const fileInputRef = useRef(null);
  const [uploadingFor, setUploadingFor] = useState(null);

  const cats = ['All', 'Frocks', 'Tops', 'Pants'];
  const filtered = filterCat === 'All' ? products : products.filter(p => p.category === filterCat);

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditForm({ ...product });
  };

  const saveEdit = () => {
    const updated = products.map(p => p.id === editingId ? { ...editForm } : p);
    saveProducts(updated);
    setEditingId(null);
    toast.success('Product updated!');
  };

  const deleteProduct = (id) => {
    saveProducts(products.filter(p => p.id !== id));
    setDeleteConfirm(null);
    toast.success('Product removed');
  };

  const handleImageUpload = (productId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (editingId === productId) {
        setEditForm(prev => ({ ...prev, images: [reader.result, ...(prev.images.slice(1))] }));
      } else {
        const updated = products.map(p =>
          p.id === productId ? { ...p, images: [reader.result, ...p.images.slice(1)] } : p
        );
        saveProducts(updated);
        toast.success('Image updated!');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {cats.map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterCat === c ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            {c}
            <span className="ml-1.5 text-xs opacity-60">
              {c === 'All' ? products.length : products.filter(p => p.category === c).length}
            </span>
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((product, i) => (
          <motion.div key={product.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl shadow-sm overflow-hidden">

            {editingId === product.id ? (
              /* ── EDIT MODE ── */
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-700">Editing Product</span>
                  <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                </div>

                {/* Image preview + upload */}
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-gray-100">
                  <img src={editForm.images?.[0]} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => { setUploadingFor(product.id); fileInputRef.current?.click(); }}
                    className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity">
                    <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs">Change Image</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Product Name</label>
                  <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Price ($)</label>
                    <input type="number" value={editForm.price} onChange={e => setEditForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Original Price ($)</label>
                    <input type="number" value={editForm.originalPrice} onChange={e => setEditForm(p => ({ ...p, originalPrice: parseFloat(e.target.value) || 0 }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                  <select value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200">
                    {['Frocks', 'Tops', 'Pants'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Badge</label>
                  <input value={editForm.badge} onChange={e => setEditForm(p => ({ ...p, badge: e.target.value }))}
                    placeholder="e.g. New, Sale, Hot..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Image URL (optional)</label>
                  <input value={editForm.images?.[0]} onChange={e => setEditForm(p => ({ ...p, images: [e.target.value, ...p.images.slice(1)] }))}
                    placeholder="https://..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>

                <div className="flex gap-2 pt-1">
                  <button onClick={saveEdit}
                    className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">
                    Save Changes
                  </button>
                  <button onClick={() => setEditingId(null)}
                    className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* ── VIEW MODE ── */
              <>
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover" />
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {product.badge}
                    </span>
                  )}
                  <span className="absolute top-3 right-3 bg-white/90 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                  {/* Quick image upload overlay */}
                  <button onClick={() => { setUploadingFor(product.id); fileInputRef.current?.click(); }}
                    className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-gray-700 text-xs font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Change Photo
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-rose-600 font-bold">${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-700 py-2 rounded-xl text-xs font-medium hover:border-gray-400 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button onClick={() => setDeleteConfirm(product.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-600 py-2 rounded-xl text-xs font-medium hover:bg-red-50 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { if (uploadingFor) handleImageUpload(uploadingFor, e); }} />

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">🗑️</div>
                <h3 className="font-semibold text-gray-900">Remove Product?</h3>
                <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium">Cancel</button>
                <button onClick={() => deleteProduct(deleteConfirm)}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors">Remove</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ════════════════════════════════════════════
// CATEGORIES PANEL
// ════════════════════════════════════════════
function CategoriesPanel({ categories, saveCategories }) {
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const fileInputRef = useRef(null);
  const [uploadingFor, setUploadingFor] = useState(null);

  const startEdit = (cat) => { setEditing(cat.id); setEditForm({ ...cat }); };

  const saveEdit = () => {
    saveCategories(categories.map(c => c.id === editing ? { ...editForm } : c));
    setEditing(null);
    toast.success('Category updated!');
  };

  const handleImageUpload = (catId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (editing === catId) {
        setEditForm(prev => ({ ...prev, image: reader.result }));
      } else {
        saveCategories(categories.map(c => c.id === catId ? { ...c, image: reader.result } : c));
        toast.success('Category image updated!');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">Update category cover images, names and descriptions shown on the homepage.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat, i) => (
          <motion.div key={cat.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl shadow-sm overflow-hidden">

            {editing === cat.id ? (
              <div className="p-5 space-y-4">
                <span className="text-sm font-semibold text-gray-700">Editing: {cat.name}</span>

                {/* Image preview */}
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-gray-100">
                  <img src={editForm.image} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => { setUploadingFor(cat.id); fileInputRef.current?.click(); }}
                    className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity">
                    <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs">Upload Image</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
                  <input value={editForm.image} onChange={e => setEditForm(p => ({ ...p, image: e.target.value }))}
                    placeholder="https://... or upload above"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                  <input value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>

                <div className="flex gap-2">
                  <button onClick={saveEdit}
                    className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">Save</button>
                  <button onClick={() => setEditing(null)}
                    className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-bold text-lg">{cat.name}</p>
                    <p className="text-xs text-white/70">{cat.count}</p>
                  </div>
                  {/* Quick image upload */}
                  <button onClick={() => { setUploadingFor(cat.id); fileInputRef.current?.click(); }}
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-700 text-xs font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-3">{cat.description}</p>
                  <button onClick={() => startEdit(cat)}
                    className="w-full flex items-center justify-center gap-1.5 border border-gray-200 text-gray-700 py-2 rounded-xl text-xs font-medium hover:border-gray-400 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Category
                  </button>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { if (uploadingFor) handleImageUpload(uploadingFor, e); }} />
    </div>
  );
}

// ════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ════════════════════════════════════════════
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { products, categories, saveProducts, saveCategories } = useAdminStore();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1f2937', color: '#fff', borderRadius: '12px', fontSize: '14px' },
        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
      }} />

      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} transition-all duration-300 bg-gray-900 flex flex-col min-h-screen flex-shrink-0`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-800">
          <div className="w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">Z</span>
          </div>
          {sidebarOpen && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="ml-2.5 font-semibold text-white text-sm whitespace-nowrap">
              ZaraStyle Admin
            </motion.span>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-gray-500 hover:text-gray-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {NAV.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                activeTab === item.id
                  ? 'bg-rose-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}>
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium whitespace-nowrap">
                  {item.label}
                </motion.span>
              )}
            </button>
          ))}
        </nav>

        {/* Back to store */}
        <div className="p-3 border-t border-gray-800">
          <a href="/" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all text-sm`}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {sidebarOpen && <span className="text-sm font-medium whitespace-nowrap">Back to Store</span>}
          </a>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 flex-shrink-0">
          <div>
            <h1 className="font-semibold text-gray-900 text-lg">
              {NAV.find(n => n.id === activeTab)?.icon} {NAV.find(n => n.id === activeTab)?.label}
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
              <span className="text-rose-600 text-xs font-bold">A</span>
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
              {activeTab === 'orders' && <OrdersPanel />}
              {activeTab === 'products' && <ProductsPanel products={products} saveProducts={saveProducts} />}
              {activeTab === 'categories' && <CategoriesPanel categories={categories} saveCategories={saveCategories} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}