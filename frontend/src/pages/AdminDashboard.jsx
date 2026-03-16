import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { orderService } from '../services/api';
import { products as defaultProducts, categories as defaultCategories } from '../data/products';

// ── Auth guard ──
function useAdminAuth() {
  const navigate = useNavigate();
  useEffect(() => {
    if (sessionStorage.getItem('zs_admin_auth') !== 'true') {
      navigate('/admin');
    }
  }, []);
}

// ── Local store ──
function useAdminStore() {
  const [products, setProducts] = useState(() => {
    try { const s = localStorage.getItem('admin_products'); return s ? JSON.parse(s) : defaultProducts; }
    catch { return defaultProducts; }
  });
  const [categories, setCategories] = useState(() => {
    try { const s = localStorage.getItem('admin_categories'); return s ? JSON.parse(s) : defaultCategories; }
    catch { return defaultCategories; }
  });
  const saveProducts = (u) => { setProducts(u); localStorage.setItem('admin_products', JSON.stringify(u)); };
  const saveCategories = (u) => { setCategories(u); localStorage.setItem('admin_categories', JSON.stringify(u)); };
  return { products, categories, saveProducts, saveCategories };
}

const STATUS = {
  pending:    { color: 'bg-amber-100 text-amber-700 border-amber-200',   dot: 'bg-amber-400',    label: 'Pending',    icon: '⏳' },
  confirmed:  { color: 'bg-blue-100 text-blue-700 border-blue-200',      dot: 'bg-blue-400',     label: 'Confirmed',  icon: '✅' },
  processing: { color: 'bg-violet-100 text-violet-700 border-violet-200',dot: 'bg-violet-400',   label: 'Processing', icon: '⚙️' },
  shipped:    { color: 'bg-purple-100 text-purple-700 border-purple-200',dot: 'bg-purple-400',   label: 'Shipped',    icon: '🚚' },
  delivered:  { color: 'bg-emerald-100 text-emerald-700 border-emerald-200',dot:'bg-emerald-400',label: 'Delivered',  icon: '🎉' },
  cancelled:  { color: 'bg-red-100 text-red-700 border-red-200',         dot: 'bg-red-400',      label: 'Cancelled',  icon: '❌' },
};

// ── Sidebar Items ──
const NAV = [
  { id: 'overview',   label: 'Overview',   icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg> },
  { id: 'orders',     label: 'Orders',     icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 7H4l1-7z" /></svg> },
  { id: 'products',   label: 'Products',   icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> },
  { id: 'categories', label: 'Categories', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
];

// ════════════════ OVERVIEW PANEL ════════════════
function OverviewPanel({ orders, products }) {
  const stats = [
    { label: 'Total Orders', value: orders.length, change: '+12%', up: true, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 7H4l1-7z" /></svg>, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending', value: orders.filter(o=>o.status==='pending').length, change: orders.filter(o=>o.status==='pending').length > 0 ? 'needs action' : 'all clear', up: false, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Revenue', value: `$${orders.reduce((s,o)=>s+(o.totalAmount||0),0).toFixed(0)}`, change: '+8%', up: true, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Products', value: products.length, change: '3 categories', up: true, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const recentOrders = [...orders].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.08 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`${s.bg} ${s.color} p-2.5 rounded-xl`}>{s.icon}</div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.up ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {s.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-0.5">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Status breakdown + Recent orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Status breakdown */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Order Status</h3>
          <div className="space-y-3">
            {Object.entries(STATUS).map(([key, val]) => {
              const count = orders.filter(o=>o.status===key).length;
              const pct = orders.length ? Math.round((count/orders.length)*100) : 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2 text-gray-600">
                      <span className={`w-2 h-2 rounded-full ${val.dot}`} />
                      {val.label}
                    </span>
                    <span className="font-semibold text-gray-800">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ delay:0.4, duration:0.6 }}
                      className={`h-full rounded-full ${val.dot}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent orders */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
          className="xl:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No orders yet</div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o, i) => (
                <motion.div key={o._id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.4+i*0.06 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-rose-600 text-xs font-bold">{o.name?.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{o.name}</p>
                    <p className="text-xs text-gray-400 truncate">{o.product}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">${o.totalAmount?.toFixed(0)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS[o.status]?.color}`}>
                      {STATUS[o.status]?.label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// ════════════════ ORDERS PANEL ════════════════
function OrdersPanel({ orders, setOrders, loading, reload }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await orderService.updateStatus(id, status);
    } catch {}
    setOrders(prev => prev.map(o => o._id===id ? {...o, status} : o));
    if (selected?._id===id) setSelected(p=>({...p, status}));
    toast.success(`Marked as ${STATUS[status].label}`);
    setUpdatingId(null);
  };

  const filtered = orders.filter(o => {
    const s = !search || [o.orderNumber,o.name,o.product,o.email].some(f=>f?.toLowerCase().includes(search.toLowerCase()));
    const st = filterStatus==='all' || o.status===filterStatus;
    return s && st;
  });

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search orders or customers..."
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 w-64" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all',...Object.keys(STATUS)].map(s=>(
            <button key={s} onClick={()=>setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${filterStatus===s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {s==='all'?'All':STATUS[s].label}
              {s!=='all' && <span className="ml-1 opacity-60">{orders.filter(o=>o.status===s).length}</span>}
            </button>
          ))}
        </div>
        <button onClick={reload} className="ml-auto flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 bg-white px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 text-sm mt-3">Loading orders...</p>
          </div>
        ) : filtered.length===0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">📭</div>
            <p className="text-gray-500 font-medium">No orders found</p>
            <p className="text-gray-400 text-sm mt-1">Try changing your search or filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Order #','Customer','Product','Total','Payment','Status','Date',''].map(h=>(
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3.5 first:pl-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order,i)=>(
                  <motion.tr key={order._id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.03}}
                    className="hover:bg-rose-50/30 transition-colors group">
                    <td className="px-5 py-4 pl-6">
                      <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">{order.orderNumber}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{order.name?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{order.name}</p>
                          <p className="text-xs text-gray-400">{order.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700 max-w-[160px] truncate">{order.product}</p>
                      <p className="text-xs text-gray-400">×{order.quantity}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-gray-900">${order.totalAmount?.toFixed(2)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${order.paymentMethod==='cod'?'bg-orange-100 text-orange-700':'bg-blue-100 text-blue-700'}`}>
                        {order.paymentMethod==='cod'?'💵 COD':'🏦 Bank'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium inline-flex items-center gap-1 ${STATUS[order.status]?.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS[order.status]?.dot}`} />
                        {STATUS[order.status]?.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'2-digit'})}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={()=>setSelected(order)}
                          className="text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                          View
                        </button>
                        {order.status==='pending' && (
                          <button onClick={()=>handleStatus(order._id,'confirmed')}
                            disabled={updatingId===order._id}
                            className="text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
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
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={()=>setSelected(null)}>
            <motion.div initial={{scale:0.92,y:20}} animate={{scale:1,y:0}} exit={{scale:0.92,y:20}}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={e=>e.stopPropagation()}>
              {/* Modal header */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-3xl p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Order Details</p>
                    <h3 className="text-xl font-bold mt-0.5 font-mono">{selected.orderNumber}</h3>
                    <span className={`mt-2 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS[selected.status]?.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS[selected.status]?.dot}`} />
                      {STATUS[selected.status]?.label}
                    </span>
                  </div>
                  <button onClick={()=>setSelected(null)}
                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Customer + Order info */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label:'Customer', value:selected.name },
                    { label:'Email', value:selected.email },
                    { label:'Phone', value:selected.phone },
                    { label:'Payment', value:selected.paymentMethod==='cod'?'Cash on Delivery':'Bank Transfer' },
                  ].map(({label,value})=>(
                    <div key={label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
                      <p className="text-sm text-gray-800 font-medium truncate">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Shipping Address</p>
                  <p className="text-sm text-gray-800 font-medium">{selected.address}</p>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-rose-400 font-medium mb-0.5">Product</p>
                    <p className="text-sm text-gray-900 font-semibold">{selected.product}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Quantity: {selected.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">${selected.totalAmount?.toFixed(2)}</p>
                  </div>
                </div>
                {selected.notes && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <p className="text-xs text-amber-500 font-medium mb-0.5">Customer Notes</p>
                    <p className="text-sm text-gray-700">{selected.notes}</p>
                  </div>
                )}

                {/* Status update */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Update Status</p>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(STATUS).map(([key,val])=>(
                      <button key={key} onClick={()=>handleStatus(selected._id,key)}
                        disabled={updatingId===selected._id}
                        className={`py-2.5 px-2 rounded-xl text-xs font-medium transition-all border-2 flex flex-col items-center gap-1 ${
                          selected.status===key ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                        }`}>
                        <span>{val.icon}</span>
                        <span>{val.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ════════════════ PRODUCTS PANEL ════════════════
function ProductsPanel({ products, saveProducts }) {
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterCat, setFilterCat] = useState('All');
  const fileInputRef = useRef(null);
  const [uploadingFor, setUploadingFor] = useState(null);

  const cats = ['All','Frocks','Tops','Pants'];
  const filtered = filterCat==='All' ? products : products.filter(p=>p.category===filterCat);

  const startEdit = (p) => { setEditing(p.id); setEditForm({...p}); };
  const saveEdit = () => {
    saveProducts(products.map(p=>p.id===editing?{...editForm}:p));
    setEditing(null);
    toast.success('Product saved!');
  };
  const deleteProduct = (id) => {
    saveProducts(products.filter(p=>p.id!==id));
    setDeleteConfirm(null);
    toast.success('Product removed');
  };

  const handleImgUpload = (pid, e) => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if(editing===pid) setEditForm(p=>({...p,images:[reader.result,...(p.images.slice(1))]}));
      else { saveProducts(products.map(p=>p.id===pid?{...p,images:[reader.result,...p.images.slice(1)]}:p)); toast.success('Image updated!'); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap items-center">
        {cats.map(c=>(
          <button key={c} onClick={()=>setFilterCat(c)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterCat===c?'bg-gray-900 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {c} <span className="ml-1 opacity-60 text-xs">{c==='All'?products.length:products.filter(p=>p.category===c).length}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((product,i)=>(
          <motion.div key={product.id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">

            {editing===product.id ? (
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">Edit Product</span>
                  <button onClick={()=>setEditing(null)} className="text-xs text-gray-400 hover:text-gray-600">✕ Cancel</button>
                </div>
                <div className="relative rounded-xl overflow-hidden aspect-[16/9] bg-gray-100 cursor-pointer"
                  onClick={()=>{setUploadingFor(product.id);fileInputRef.current?.click();}}>
                  <img src={editForm.images?.[0]} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-xs">Click to change</span>
                  </div>
                </div>
                <input value={editForm.name} onChange={e=>setEditForm(p=>({...p,name:e.target.value}))}
                  placeholder="Product name" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Price ($)</label>
                    <input type="number" value={editForm.price} onChange={e=>setEditForm(p=>({...p,price:parseFloat(e.target.value)||0}))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Original ($)</label>
                    <input type="number" value={editForm.originalPrice} onChange={e=>setEditForm(p=>({...p,originalPrice:parseFloat(e.target.value)||0}))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select value={editForm.category} onChange={e=>setEditForm(p=>({...p,category:e.target.value}))}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200">
                    {['Frocks','Tops','Pants'].map(c=><option key={c}>{c}</option>)}
                  </select>
                  <input value={editForm.badge} onChange={e=>setEditForm(p=>({...p,badge:e.target.value}))}
                    placeholder="Badge e.g. New" className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
                <input value={editForm.images?.[0]} onChange={e=>setEditForm(p=>({...p,images:[e.target.value,...p.images.slice(1)]}))}
                  placeholder="Image URL (paste or upload above)" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                <div className="flex gap-2 pt-1">
                  <button onClick={saveEdit} className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">Save</button>
                  <button onClick={()=>setEditing(null)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                      <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</span>
                    </div>
                  )}
                  {product.badge && product.inStock && <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">{product.badge}</span>}
                  <span className="absolute top-3 right-3 bg-white/95 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">{product.category}</span>
                  <button onClick={()=>{setUploadingFor(product.id);fileInputRef.current?.click();}}
                    className="absolute bottom-3 right-3 bg-white/95 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm hover:bg-white transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Photo
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-rose-600 font-bold text-lg">${product.price.toFixed(2)}</span>
                    {product.originalPrice && <span className="text-xs text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>}
                    {product.originalPrice && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      -{Math.round(((product.originalPrice-product.price)/product.originalPrice)*100)}%
                    </span>}
                  </div>
                  {/* Live rating display */}
                  {(() => {
                    const ur = product.userRatings || [];
                    const lr = ur.length > 0
                      ? ((product.rating * product.reviews + ur.reduce((s,r)=>s+r.score,0)) / (product.reviews + ur.length))
                      : product.rating;
                    return (
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s=>(
                            <svg key={s} className={`w-3 h-3 ${s<=Math.round(lr)?'text-yellow-400':'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs font-bold text-gray-700">{lr.toFixed(1)}</span>
                        <span className="text-xs text-gray-400">({product.reviews + ur.length} reviews)</span>
                        {ur.length > 0 && <span className="text-xs text-emerald-600 font-semibold">+{ur.length} new</span>}
                      </div>
                    );
                  })()}
                  {/* Stock toggle */}
                  <button
                    onClick={() => saveProducts(products.map(p=>p.id===product.id?{...p,inStock:!p.inStock}:p))}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold mb-2 transition-all ${
                      product.inStock ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'
                    }`}>
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${product.inStock?'bg-emerald-500':'bg-red-400'}`} />
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <span className="opacity-60">Click to toggle</span>
                  </button>
                  <div className="flex gap-2">
                    <button onClick={()=>startEdit(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 border-2 border-gray-200 text-gray-700 py-2 rounded-xl text-sm font-medium hover:border-gray-900 hover:text-gray-900 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Edit
                    </button>
                    <button onClick={()=>setDeleteConfirm(product.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 border-2 border-red-100 text-red-500 py-2 rounded-xl text-sm font-medium hover:border-red-400 hover:bg-red-50 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Remove
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e=>{if(uploadingFor)handleImgUpload(uploadingFor,e);}} />

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={()=>setDeleteConfirm(null)}>
            <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}}
              className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl text-center" onClick={e=>e.stopPropagation()}>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🗑️</div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Remove Product?</h3>
              <p className="text-sm text-gray-500 mb-6">This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={()=>setDeleteConfirm(null)} className="flex-1 border-2 border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={()=>deleteProduct(deleteConfirm)} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors">Remove</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ════════════════ CATEGORIES PANEL ════════════════
function CategoriesPanel({ categories, saveCategories }) {
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const fileInputRef = useRef(null);
  const [uploadingFor, setUploadingFor] = useState(null);

  const saveEdit = () => { saveCategories(categories.map(c=>c.id===editing?{...editForm}:c)); setEditing(null); toast.success('Category updated!'); };

  const handleImgUpload = (catId, e) => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if(editing===catId) setEditForm(p=>({...p,image:reader.result}));
      else { saveCategories(categories.map(c=>c.id===catId?{...c,image:reader.result}:c)); toast.success('Image updated!'); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">Manage category cover images and descriptions shown on the homepage.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat,i)=>(
          <motion.div key={cat.id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {editing===cat.id ? (
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
                  <button onClick={()=>setEditing(null)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-gray-100 cursor-pointer"
                  onClick={()=>{setUploadingFor(cat.id);fileInputRef.current?.click();}}>
                  <img src={editForm.image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-xs">Upload Image</span>
                  </div>
                </div>
                <input value={editForm.image} onChange={e=>setEditForm(p=>({...p,image:e.target.value}))}
                  placeholder="Or paste image URL" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                <input value={editForm.description} onChange={e=>setEditForm(p=>({...p,description:e.target.value}))}
                  placeholder="Category description" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">Save</button>
                  <button onClick={()=>setEditing(null)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-bold text-xl">{cat.name}</p>
                    <p className="text-xs text-white/70">{cat.count}</p>
                  </div>
                  <button onClick={()=>{setUploadingFor(cat.id);fileInputRef.current?.click();}}
                    className="absolute top-3 right-3 bg-white/95 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm hover:bg-white transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Upload
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-3">{cat.description}</p>
                  <button onClick={()=>{setEditing(cat.id);setEditForm({...cat});}}
                    className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:border-gray-900 hover:text-gray-900 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Edit Category
                  </button>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e=>{if(uploadingFor)handleImgUpload(uploadingFor,e);}} />
    </div>
  );
}

// ════════════════ MAIN DASHBOARD ════════════════
export default function AdminDashboard() {
  useAdminAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const { products, categories, saveProducts, saveCategories } = useAdminStore();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await orderService.getOrders();
      setOrders(res.data || []);
    } catch {
      setOrders([
        { _id:'1', orderNumber:'ORD-001', name:'Amara Silva', email:'amara@email.com', phone:'+94 77 123 4567', address:'12 Lake Rd, Colombo 03', product:'Floral Silk Maxi Dress', quantity:1, totalAmount:249, paymentMethod:'cod', status:'pending', notes:'', createdAt:new Date().toISOString() },
        { _id:'2', orderNumber:'ORD-002', name:'Priya Mendis', email:'priya@email.com', phone:'+94 71 987 6543', address:'45 Galle Face, Colombo 01', product:'Silk Slip Dress', quantity:2, totalAmount:240, paymentMethod:'bank', status:'confirmed', notes:'Gift wrap', createdAt:new Date(Date.now()-86400000).toISOString() },
        { _id:'3', orderNumber:'ORD-003', name:'Nisha Fernando', email:'nisha@email.com', phone:'+94 76 555 0011', address:'8 Kandy Rd, Nugegoda', product:'Wide-Leg Linen Trousers', quantity:1, totalAmount:110, paymentMethod:'cod', status:'shipped', notes:'', createdAt:new Date(Date.now()-172800000).toISOString() },
        { _id:'4', orderNumber:'ORD-004', name:'Kavya Perera', email:'kavya@email.com', phone:'+94 70 222 3344', address:'33 Temple St, Kandy', product:'Boho Midi Dress', quantity:1, totalAmount:75, paymentMethod:'bank', status:'delivered', notes:'', createdAt:new Date(Date.now()-259200000).toISOString() },
        { _id:'5', orderNumber:'ORD-005', name:'Dilini Rajapaksa', email:'dilini@email.com', phone:'+94 72 888 9900', address:'7 Beach Rd, Galle', product:'Off-Shoulder Knit Top', quantity:3, totalAmount:216, paymentMethod:'cod', status:'pending', notes:'Size L', createdAt:new Date(Date.now()-3600000).toISOString() },
      ]);
    } finally { setOrdersLoading(false); }
  };

  useEffect(() => { loadOrders(); }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('zs_admin_auth');
    navigate('/admin');
  };

  const pendingCount = orders.filter(o=>o.status==='pending').length;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <Toaster position="top-right" toastOptions={{ style:{background:'#1f2937',color:'#fff',borderRadius:'12px',fontSize:'14px'}, success:{iconTheme:{primary:'#10b981',secondary:'#fff'}} }} />

      {/* ── SIDEBAR ── */}
      <aside className={`${collapsed?'w-[72px]':'w-60'} transition-all duration-300 ease-in-out bg-gray-900 flex flex-col min-h-screen flex-shrink-0 shadow-xl`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-800/80">
          <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-rose-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-900/50">
            <span className="text-white font-bold text-base">Z</span>
          </div>
          {!collapsed && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="ml-3 overflow-hidden">
              <p className="text-white font-bold text-sm leading-none">ZaraStyle</p>
              <p className="text-gray-500 text-xs mt-0.5">Admin Portal</p>
            </motion.div>
          )}
          <button onClick={()=>setCollapsed(!collapsed)}
            className={`${collapsed?'mx-auto mt-0':'ml-auto'} text-gray-600 hover:text-gray-300 transition-colors p-1`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed?"M13 5l7 7-7 7M5 5l7 7-7 7":"M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV.map(item=>(
            <button key={item.id} onClick={()=>setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm group relative ${
                activeTab===item.id ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}>
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <motion.span initial={{opacity:0}} animate={{opacity:1}} className="font-medium whitespace-nowrap">{item.label}</motion.span>}
              {item.id==='orders' && pendingCount>0 && (
                <span className={`${collapsed?'absolute -top-1 -right-1':'ml-auto'} bg-amber-400 text-gray-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center`}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-gray-800/80 space-y-1">
          <a href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all text-sm">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            {!collapsed && <span className="text-sm font-medium">View Store</span>}
          </a>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-all text-sm">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 flex-shrink-0 shadow-sm">
          <div>
            <h1 className="font-bold text-gray-900 text-lg">{NAV.find(n=>n.id===activeTab)?.label}</h1>
            <p className="text-xs text-gray-400">{new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {pendingCount>0 && (
              <button onClick={()=>setActiveTab('orders')}
                className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-amber-100 transition-colors">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                {pendingCount} pending order{pendingCount>1?'s':''}
              </button>
            )}
            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-rose-700 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-bold">A</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.2}}>
              {activeTab==='overview'   && <OverviewPanel orders={orders} products={products} />}
              {activeTab==='orders'     && <OrdersPanel orders={orders} setOrders={setOrders} loading={ordersLoading} reload={loadOrders} />}
              {activeTab==='products'   && <ProductsPanel products={products} saveProducts={saveProducts} />}
              {activeTab==='categories' && <CategoriesPanel categories={categories} saveCategories={saveCategories} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}