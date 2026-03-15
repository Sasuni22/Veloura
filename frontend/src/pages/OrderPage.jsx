import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { orderService } from '../services/api';
import products from '../data/products';

export default function OrderPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const stateData = location.state;
  // Use product from navigation state if provided (e.g. from CategoryPage),
  // otherwise look it up by ID — works for all product IDs including new ones (7-14)
  const product = stateData?.product || products.find((p) => p.id === id);

  const [loading, setLoading] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    product: product?.name || '',
    productId: id || '',
    quantity: stateData?.quantity || 1,
    price: product?.price || 0,
    paymentMethod: 'cod',
    notes: '',
    receiptImage: null,
  });

  const totalAmount = (form.price * form.quantity).toFixed(2);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, receiptImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.name || !form.email || !form.address || !form.phone) {
      toast.error('Please fill in all customer information');
      return;
    }
    if (form.paymentMethod === 'bank' && !form.receiptImage) {
      toast.error('Please upload your bank receipt');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (key === 'receiptImage' && form.receiptImage) {
          formData.append('receiptImage', form.receiptImage);
        } else if (key !== 'receiptImage') {
          formData.append(key, form[key]);
        }
      });
      formData.append('totalAmount', totalAmount);

      const result = await orderService.createOrder(formData);
      toast.success(`Order ${result.data.orderNumber} placed successfully! 🎉`);
      navigate('/order-success', { state: { order: result.data } });
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
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
          <Link to={`/product/${id}`} className="hover:text-primary-dark">{product.name}</Link>
          <span>/</span>
          <span className="text-gray-800">Checkout</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            <h1 className="font-display text-3xl font-semibold text-gray-900">Checkout</h1>
            <p className="text-sm text-gray-500">Order ID will be auto-generated upon submission</p>

            {/* Customer Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-dark text-white rounded-full flex items-center justify-center text-xs">1</span>
                Shipping Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Shipping Address *</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter your complete delivery address"
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+1</span>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="(555) 000-0000"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-dark text-white rounded-full flex items-center justify-center text-xs">2</span>
                Order Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product</label>
                  <input
                    name="product"
                    value={form.product}
                    onChange={handleChange}
                    className="input-field bg-gray-50"
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setForm((p) => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                        className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center hover:border-primary-dark transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                      </button>
                      <span className="w-8 text-center font-medium">{form.quantity}</span>
                      <button
                        onClick={() => setForm((p) => ({ ...p, quantity: p.quantity + 1 }))}
                        className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center hover:border-primary-dark transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Order Number</label>
                    <div className="input-field bg-gray-50 text-gray-500 flex items-center">
                      <span className="text-xs">Auto-generated on submit</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Any special requests or notes..."
                    rows={2}
                    className="input-field resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-dark text-white rounded-full flex items-center justify-center text-xs">3</span>
                Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* COD */}
                <label className={`relative flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  form.paymentMethod === 'cod' ? 'border-primary-dark bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={form.paymentMethod === 'cod'}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-800 text-sm">Cash on Delivery</div>
                    <div className="text-xs text-gray-500 mt-0.5">Pay when your order arrives at your door</div>
                  </div>
                  <div className="ml-auto text-2xl">💵</div>
                </label>

                {/* Bank */}
                <label className={`relative flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  form.paymentMethod === 'bank' ? 'border-primary-dark bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={form.paymentMethod === 'bank'}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-800 text-sm">Bank Transfer</div>
                    <div className="text-xs text-gray-500 mt-0.5">Upload your bank transfer receipt</div>
                  </div>
                  <div className="ml-auto text-2xl">🏦</div>
                </label>
              </div>

              {/* Bank Receipt Upload */}
              {form.paymentMethod === 'bank' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Bank Receipt *
                  </label>
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    receiptPreview ? 'border-primary' : 'border-gray-200 hover:border-primary/50'
                  }`}>
                    {receiptPreview ? (
                      <div className="space-y-3">
                        <img src={receiptPreview} alt="Receipt" className="max-h-40 mx-auto rounded-lg object-contain" />
                        <p className="text-sm text-green-600 font-medium">✓ Receipt uploaded</p>
                        <button
                          onClick={() => { setReceiptPreview(null); setForm((p) => ({ ...p, receiptImage: null })); }}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="text-4xl mb-3">📤</div>
                        <p className="text-sm text-gray-600 mb-1">Drag & drop or click to upload</p>
                        <p className="text-xs text-gray-400">JPG, PNG, PDF up to 5MB</p>
                        <label className="mt-4 inline-block">
                          <span className="btn-outline text-sm cursor-pointer">Choose File</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Product Preview */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>

              <div className="flex gap-3 mb-4">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-16 h-20 object-cover rounded-xl"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Qty: {form.quantity}</p>
                  <p className="text-sm font-bold text-primary-dark mt-1">${product.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>${totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (8%)</span>
                  <span>${(totalAmount * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-primary-dark">${(parseFloat(totalAmount) * 1.08).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-primary-dark hover:bg-primary-darker text-white py-4 rounded-2xl font-medium transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
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

            {/* Security */}
            <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secured and encrypted checkout
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}