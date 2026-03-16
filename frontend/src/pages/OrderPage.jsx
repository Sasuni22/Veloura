import { useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { orderService } from '../services/api';
import { useCart } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';

export default function OrderPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { products } = useProducts();
  const stateData = location.state;

  // ── Detect mode: cart checkout OR single product ──
  const isCartOrder = stateData?.fromCart === true && Array.isArray(stateData?.cartItems);
  const cartItems   = isCartOrder ? stateData.cartItems : null;
  const cartTotal   = isCartOrder ? stateData.cartTotal  : 0;

  // Single product — from state (CategoryPage / ProductPage) or URL id
  const singleProduct = !isCartOrder
    ? (stateData?.product || products.find((p) => p.id === id))
    : null;

  const [loading, setLoading] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    paymentMethod: 'cod',
    notes: '',
    receiptImage: null,
    quantity: stateData?.quantity || 1,
  });

  // ── Calculate totals ──
  const singleSubtotal = singleProduct ? singleProduct.price * form.quantity : 0;
  const totalAmount    = isCartOrder ? cartTotal : singleSubtotal;

  // ── Build summary items list (used in UI + passed to success page) ──
  const summaryItems = isCartOrder
    ? cartItems.map(item => ({
        id:       item.id,
        name:     item.name,
        image:    item.image,
        price:    item.price,
        quantity: item.quantity,
        size:     item.size,
        color:    item.color,
        subtotal: item.price * item.quantity,
      }))
    : singleProduct
      ? [{
          id:       singleProduct.id,
          name:     singleProduct.name,
          image:    singleProduct.images[0],
          price:    singleProduct.price,
          quantity: form.quantity,
          size:     stateData?.size || 'M',
          color:    stateData?.color || '',
          subtotal: singleSubtotal,
        }]
      : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({ ...prev, receiptImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.address || !form.phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.paymentMethod === 'bank' && !form.receiptImage) {
      toast.error('Please upload your bank receipt');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name',          form.name);
      formData.append('email',         form.email);
      formData.append('address',       form.address);
      formData.append('phone',         form.phone);
      formData.append('paymentMethod', form.paymentMethod);
      formData.append('notes',         form.notes);
      formData.append('totalAmount',   totalAmount);

      if (isCartOrder) {
        formData.append('product',    cartItems.map(i => `${i.name} ×${i.quantity}`).join(', '));
        formData.append('quantity',   cartItems.reduce((s, i) => s + i.quantity, 0));
        formData.append('cartItems',  JSON.stringify(cartItems));
      } else {
        formData.append('product',    singleProduct.name);
        formData.append('productId',  singleProduct.id);
        formData.append('quantity',   form.quantity);
        formData.append('price',      singleProduct.price);
      }

      if (form.receiptImage) {
        formData.append('receiptImage', form.receiptImage);
      }

      const result = await orderService.createOrder(formData);
      if (isCartOrder) clearCart();
      toast.success(`Order ${result.data.orderNumber} placed! 🎉`);
      navigate('/order-success', {
        state: { order: result.data, summaryItems, totalAmount },
      });
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Guard
  if (!isCartOrder && !singleProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-display text-gray-800 mb-4">Product not found</p>
          <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-primary-dark">Home</Link>
          <span>/</span>
          <span className="text-gray-800">
            {isCartOrder ? 'Cart Checkout' : 'Checkout'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT: FORM ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6">

            <div>
              <h1 className="font-display text-3xl font-semibold text-gray-900">Checkout</h1>
              <p className="text-sm text-gray-500 mt-1">
                {isCartOrder
                  ? `${cartItems.length} item${cartItems.length > 1 ? 's' : ''} from your cart`
                  : 'Order ID will be auto-generated upon submission'}
              </p>
            </div>

            {/* 1. Shipping Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-dark text-white rounded-full flex items-center justify-center text-xs">1</span>
                Shipping Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange}
                    placeholder="Enter your full name" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="your@email.com" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Shipping Address *</label>
                  <textarea name="address" value={form.address} onChange={handleChange}
                    placeholder="Enter your complete delivery address"
                    rows={3} className="input-field resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+94</span>
                    <input name="phone" value={form.phone} onChange={handleChange}
                      placeholder="77 123 4567" className="input-field pl-12" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Order Items */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-dark text-white rounded-full flex items-center justify-center text-xs">2</span>
                Order Items
              </h2>

              {isCartOrder ? (
                /* ── Cart mode: show all items, no editing ── */
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.key} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <img src={item.image} alt={item.name}
                        className="w-14 h-16 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && ' · '}
                          {item.color}
                        </p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* ── Single product mode: show product + qty editor ── */
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <img src={singleProduct.images[0]} alt={singleProduct.name}
                      className="w-14 h-16 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{singleProduct.name}</p>
                      {stateData?.size  && <p className="text-xs text-gray-400 mt-0.5">Size: {stateData.size}</p>}
                      {stateData?.color && <p className="text-xs text-gray-400">{stateData.color}</p>}
                    </div>
                    <p className="text-sm font-bold text-primary-dark shrink-0">
                      ${singleProduct.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Qty editor */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">Quantity</span>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-2 py-1">
                      <button onClick={() => setForm(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary-dark transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                      </button>
                      <span className="w-8 text-center font-semibold">{form.quantity}</span>
                      <button onClick={() => setForm(p => ({ ...p, quantity: p.quantity + 1 }))}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary-dark transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
                    <span className="text-sm text-gray-500 ml-auto">
                      Subtotal: <span className="font-bold text-gray-900">${singleSubtotal.toFixed(2)}</span>
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (Optional)</label>
                <textarea name="notes" value={form.notes} onChange={handleChange}
                  placeholder="Any special requests or delivery notes..."
                  rows={2} className="input-field resize-none" />
              </div>
            </div>

            {/* 3. Payment */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-dark text-white rounded-full flex items-center justify-center text-xs">3</span>
                Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  form.paymentMethod === 'cod' ? 'border-primary-dark bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" name="paymentMethod" value="cod"
                    checked={form.paymentMethod === 'cod'} onChange={handleChange} className="mt-1" />
                  <div>
                    <div className="font-medium text-gray-800 text-sm">Cash on Delivery</div>
                    <div className="text-xs text-gray-500 mt-0.5">Pay when your order arrives</div>
                  </div>
                  <div className="ml-auto text-2xl">💵</div>
                </label>

                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  form.paymentMethod === 'bank' ? 'border-primary-dark bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" name="paymentMethod" value="bank"
                    checked={form.paymentMethod === 'bank'} onChange={handleChange} className="mt-1" />
                  <div>
                    <div className="font-medium text-gray-800 text-sm">Bank Transfer</div>
                    <div className="text-xs text-gray-500 mt-0.5">Upload your bank transfer receipt</div>
                  </div>
                  <div className="ml-auto text-2xl">🏦</div>
                </label>
              </div>

              {form.paymentMethod === 'bank' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Bank Receipt *</label>
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    receiptPreview ? 'border-primary' : 'border-gray-200 hover:border-primary/50'
                  }`}>
                    {receiptPreview ? (
                      <div className="space-y-3">
                        <img src={receiptPreview} alt="Receipt" className="max-h-40 mx-auto rounded-lg object-contain" />
                        <p className="text-sm text-green-600 font-medium">✓ Receipt uploaded</p>
                        <button onClick={() => { setReceiptPreview(null); setForm(p => ({ ...p, receiptImage: null })); }}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors">Remove</button>
                      </div>
                    ) : (
                      <>
                        <div className="text-4xl mb-3">📤</div>
                        <p className="text-sm text-gray-600 mb-1">Drag & drop or click to upload</p>
                        <p className="text-xs text-gray-400">JPG, PNG, PDF up to 5MB</p>
                        <label className="mt-4 inline-block">
                          <span className="btn-outline text-sm cursor-pointer">Choose File</span>
                          <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                        </label>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* ── RIGHT: ORDER SUMMARY ── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }} className="space-y-4">

            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
              <h3 className="font-semibold text-gray-800 mb-4">
                Order Summary
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ({summaryItems.length} {summaryItems.length === 1 ? 'item' : 'items'})
                </span>
              </h3>

              {/* All items */}
              <div className="space-y-3 mb-5">
                {summaryItems.map((item, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <img src={item.image} alt={item.name}
                      className="w-14 h-16 object-cover rounded-xl flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm line-clamp-1">{item.name}</p>
                      {item.size && <p className="text-xs text-gray-400 mt-0.5">Size: {item.size}</p>}
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-primary-dark shrink-0">
                      ${item.subtotal.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                {summaryItems.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs text-gray-500">
                    <span className="truncate mr-2">{item.name} ×{item.quantity}</span>
                    <span className="shrink-0">${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm text-gray-600 pt-1 border-t border-gray-100">
                  <span>Subtotal</span>
                  <span className="font-medium">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">Free 🎁</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span className="text-primary-dark">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit button — inside the card, right under the total */}
              <div className="mt-5 space-y-3">
                <button onClick={handleSubmit} disabled={loading}
                  className="w-full bg-primary-dark hover:bg-primary-darker text-white py-2.5 rounded-xl font-medium transition-all shadow-md shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Confirm & Place Order
                    </>
                  )}
                </button>

                <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secured and encrypted checkout
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}