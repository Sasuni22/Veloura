import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { orderService } from '../services/api';

const STATUS_STYLES = {
  pending:    'bg-amber-100 text-amber-700 border-amber-200',
  confirmed:  'bg-blue-100 text-blue-700 border-blue-200',
  processing: 'bg-violet-100 text-violet-700 border-violet-200',
  shipped:    'bg-purple-100 text-purple-700 border-purple-200',
  delivered:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled:  'bg-red-100 text-red-700 border-red-200',
};

const STATUS_ICONS = {
  pending:'⏳', confirmed:'✅', processing:'⚙️', shipped:'🚚', delivered:'🎉', cancelled:'❌'
};

export default function CartDrawer({ open, onClose }) {
  const { cartItems, removeFromCart, updateQty, cartTotal, clearCart } = useCart();
  const [tab, setTab] = useState('cart');
  const [pastOrders, setPastOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (tab === 'orders' && pastOrders.length === 0) {
      setOrdersLoading(true);
      orderService.getOrders()
        .then(r => setPastOrders(r.data || []))
        .catch(() => setPastOrders([]))
        .finally(() => setOrdersLoading(false));
    }
  }, [tab]);

  // Reset to cart tab when closed
  useEffect(() => { if (!open) setTimeout(() => setTab('cart'), 300); }, [open]);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    onClose();
    navigate(`/order/${cartItems[0].id}`, {
      state: { fromCart: true, cartItems, cartTotal },
    });
  };

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-[420px] bg-white z-[61] flex flex-col shadow-2xl"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 7H4l1-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base leading-none">My Bag</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{cartCount} {cartCount === 1 ? 'item' : 'items'}</p>
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ── Tabs ── */}
            <div className="flex bg-gray-50 mx-4 mt-3 rounded-xl p-1 gap-1">
              {[
                { id: 'cart', label: 'Cart', count: cartCount },
                { id: 'orders', label: 'My Orders', count: null },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`relative flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {t.label}
                  {t.count > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {t.count > 9 ? '9+' : t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── CART TAB ── */}
            {tab === 'cart' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {cartItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
                      className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 7H4l1-7z" />
                      </svg>
                    </motion.div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">Your bag is empty</p>
                      <p className="text-sm text-gray-400 mt-1">Add something beautiful to get started</p>
                    </div>
                    <button onClick={onClose}
                      className="mt-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-gray-700 transition-colors">
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Items */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                      <AnimatePresence initial={false}>
                        {cartItems.map(item => (
                          <motion.div key={item.key}
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="flex gap-3 bg-gray-50 rounded-2xl p-3 hover:bg-gray-100/60 transition-colors"
                          >
                            {/* Image */}
                            <div className="w-20 h-24 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0 cursor-pointer"
                              onClick={() => { onClose(); navigate(`/product/${item.id}`); }}>
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                              <div>
                                <p className="font-semibold text-sm text-gray-900 line-clamp-1 cursor-pointer hover:text-rose-600 transition-colors"
                                  onClick={() => { onClose(); navigate(`/product/${item.id}`); }}>
                                  {item.name}
                                </p>
                                <div className="flex gap-1.5 mt-1 flex-wrap">
                                  {item.size && (
                                    <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                                      Size {item.size}
                                    </span>
                                  )}
                                  {item.color && (
                                    <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                                      {item.color}
                                    </span>
                                  )}
                                </div>
                                <p className="font-bold text-rose-600 mt-1.5 text-sm">
                                  ${(item.price * item.quantity).toFixed(2)}
                                  <span className="text-xs text-gray-400 font-normal ml-1">(${item.price.toFixed(2)} each)</span>
                                </p>
                              </div>

                              {/* Controls */}
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-1.5 py-1">
                                  <button onClick={() => updateQty(item.key, item.quantity - 1)}
                                    className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                                    </svg>
                                  </button>
                                  <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                                  <button onClick={() => updateQty(item.key, item.quantity + 1)}
                                    className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                  </button>
                                </div>
                                <button onClick={() => removeFromCart(item.key)}
                                  className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 font-medium">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Remove
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 p-4 space-y-3 bg-white">
                      <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Subtotal ({cartCount} items)</span>
                          <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Shipping</span>
                          <span className="text-emerald-600 font-semibold">Free 🎁</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 flex justify-between">
                          <span className="font-bold text-gray-900">Total</span>
                          <span className="font-bold text-xl text-gray-900">${cartTotal.toFixed(2)}</span>
                        </div>
                      </div>

                      <button onClick={handleCheckout}
                        className="w-full bg-gray-900 hover:bg-gray-700 text-white py-4 rounded-2xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Proceed to Checkout
                      </button>
                      <button onClick={clearCart}
                        className="w-full text-sm text-gray-400 hover:text-red-500 transition-colors py-1 font-medium">
                        Clear bag
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── ORDERS TAB ── */}
            {tab === 'orders' && (
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {ordersLoading ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-3">
                    <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
                    <p className="text-sm text-gray-400">Loading orders...</p>
                  </div>
                ) : pastOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-4 text-center pt-12">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl">📦</div>
                    <div>
                      <p className="font-bold text-gray-800">No orders yet</p>
                      <p className="text-sm text-gray-400 mt-1">Your order history will appear here</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest px-1">
                      {pastOrders.length} order{pastOrders.length !== 1 ? 's' : ''} placed
                    </p>
                    {pastOrders.map((order, i) => (
                      <motion.div key={order._id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Order header */}
                        <div className="bg-gray-50 px-4 py-2.5 flex items-center justify-between border-b border-gray-100">
                          <span className="font-mono text-xs font-bold text-rose-600">{order.orderNumber}</span>
                          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium inline-flex items-center gap-1 ${STATUS_STYLES[order.status] || ''}`}>
                            {STATUS_ICONS[order.status]} {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                          </span>
                        </div>

                        <div className="p-3.5 space-y-3">
                          {/* Product row */}
                          <div className="flex gap-3 items-center">
                            <div className="w-12 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                              <img
                                src='/images/FlowyPalazzoPants1.png'
                                alt={order.product}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 line-clamp-1">{order.product}</p>
                              <p className="text-xs text-gray-400 mt-0.5">Qty: {order.quantity}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-gray-900">${order.totalAmount?.toFixed(2)}</p>
                              <span className={`text-xs font-medium ${order.paymentMethod === 'cod' ? 'text-orange-500' : 'text-blue-500'}`}>
                                {order.paymentMethod === 'cod' ? '💵 COD' : '🏦 Bank'}
                              </span>
                            </div>
                          </div>

                          {/* Reorder button */}
                          <button onClick={() => { onClose(); navigate(`/order/${order.productId || '1'}`); }}
                            className="w-full text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-400 py-2 rounded-xl transition-colors">
                            Reorder →
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}