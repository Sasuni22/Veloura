import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { orderService } from '../services/api';

export default function CartDrawer({ open, onClose }) {
  const { cartItems, removeFromCart, updateQty, cartTotal, clearCart } = useCart();
  const [tab, setTab] = useState('cart');
  const [pastOrders, setPastOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (tab === 'orders' && pastOrders.length === 0) {
      setOrdersLoading(true);
      orderService
        .getOrders()
        .then((r) => setPastOrders(r.data || []))
        .catch(() => setPastOrders([]))
        .finally(() => setOrdersLoading(false));
    }
  }, [tab]);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    const first = cartItems[0];
    onClose();
    navigate(`/order/${first.id}`, {
      state: { fromCart: true, cartItems, cartTotal },
    });
  };

  const STATUS_COLORS = {
    pending:    'bg-yellow-100 text-yellow-700',
    confirmed:  'bg-blue-100 text-blue-700',
    processing: 'bg-indigo-100 text-indigo-700',
    shipped:    'bg-purple-100 text-purple-700',
    delivered:  'bg-green-100 text-green-700',
    cancelled:  'bg-red-100 text-red-700',
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[61] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-display text-xl font-semibold text-gray-900">My ZaraStyle</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-5">
              {[
                { id: 'cart', label: 'Cart', count: cartItems.reduce((s, i) => s + i.quantity, 0) },
                { id: 'orders', label: 'My Orders', count: null },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative flex items-center gap-2 py-3 px-1 mr-6 text-sm font-medium transition-colors ${
                    tab === t.id ? 'text-primary-dark' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.label}
                  {t.count > 0 && (
                    <span className="bg-primary-dark text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {t.count}
                    </span>
                  )}
                  {tab === t.id && (
                    <motion.div
                      layoutId="tabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-dark rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* ── CART TAB ── */}
            {tab === 'cart' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {cartItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
                    <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center text-4xl">🛍️</div>
                    <p className="font-display text-xl font-semibold text-gray-800">Your cart is empty</p>
                    <p className="text-sm text-gray-500">Browse our collection and add items you love</p>
                    <button onClick={onClose} className="btn-primary mt-2">
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Items */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                      <AnimatePresence initial={false}>
                        {cartItems.map((item) => (
                          <motion.div
                            key={item.key}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex gap-4 bg-gray-50 rounded-2xl p-3"
                          >
                            {/* Thumbnail */}
                            <div
                              className="w-20 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer"
                              onClick={() => { onClose(); navigate(`/product/${item.id}`); }}
                            >
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-medium text-sm text-gray-900 line-clamp-1 hover:text-primary-dark cursor-pointer transition-colors"
                                onClick={() => { onClose(); navigate(`/product/${item.id}`); }}
                              >
                                {item.name}
                              </p>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                {item.size && (
                                  <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                                    Size: {item.size}
                                  </span>
                                )}
                                {item.color && (
                                  <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                                    {item.color}
                                  </span>
                                )}
                              </div>
                              <p className="font-bold text-primary-dark mt-1.5 text-sm">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>

                              {/* Qty controls + Remove */}
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-2 py-1">
                                  <button
                                    onClick={() => updateQty(item.key, item.quantity - 1)}
                                    className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-primary-dark transition-colors"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                  </button>
                                  <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQty(item.key, item.quantity + 1)}
                                    className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-primary-dark transition-colors"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                  </button>
                                </div>
                                <button
                                  onClick={() => removeFromCart(item.key)}
                                  className="text-xs text-red-400 hover:text-red-600 transition-colors font-medium"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 px-5 py-4 space-y-3 bg-white">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)
                        </span>
                        <span className="font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Shipping</span>
                        <span className="text-green-600 font-medium">Free</span>
                      </div>
                      <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
                        <span className="font-semibold text-gray-800">Total</span>
                        <span className="font-bold text-xl text-primary-dark">${cartTotal.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={handleCheckout}
                        className="w-full bg-primary-dark hover:bg-primary-darker text-white py-3.5 rounded-2xl font-medium transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Proceed to Checkout
                      </button>
                      <button
                        onClick={clearCart}
                        className="w-full text-sm text-gray-400 hover:text-red-500 transition-colors py-1"
                      >
                        Clear cart
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── ORDERS TAB ── */}
            {tab === 'orders' && (
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {ordersLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : pastOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-4 text-center pt-16">
                    <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center text-4xl">📦</div>
                    <p className="font-display text-xl font-semibold text-gray-800">No orders yet</p>
                    <p className="text-sm text-gray-500">Your order history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-4">
                      {pastOrders.length} order{pastOrders.length !== 1 ? 's' : ''} placed
                    </p>
                    {pastOrders.map((order, i) => (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="bg-gray-50 rounded-2xl p-4 space-y-3"
                      >
                        {/* Order header row */}
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-sm text-primary-dark font-mono">{order.orderNumber}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                              })}
                            </p>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>

                        {/* Product row */}
                        <div className="flex gap-3 items-center">
                          <div className="w-12 h-14 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                            <img
                              src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=100&auto=format&fit=crop"
                              alt={order.product}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 line-clamp-1">{order.product}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Qty: {order.quantity}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-gray-900">${order.totalAmount?.toFixed(2)}</p>
                            <p className={`text-xs mt-0.5 ${order.paymentMethod === 'cod' ? 'text-orange-500' : 'text-blue-500'}`}>
                              {order.paymentMethod === 'cod' ? 'COD' : 'Bank'}
                            </p>
                          </div>
                        </div>

                        {/* Footer row */}
                        <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                          <p className="text-xs text-gray-500 truncate">{order.name}</p>
                          <button
                            onClick={() => { onClose(); navigate(`/order/${order.productId || '1'}`); }}
                            className="text-xs font-medium text-primary-dark hover:underline shrink-0 ml-2"
                          >
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