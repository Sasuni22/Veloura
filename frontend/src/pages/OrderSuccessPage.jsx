import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function OrderSuccessPage() {
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-lg p-10 max-w-lg w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Order Confirmed! 🎉</h1>
          <p className="text-gray-500 mb-8">Your order has been placed successfully. We'll notify you once it ships.</p>

          {order && (
            <div className="bg-cream rounded-2xl p-5 text-left mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Order Number</span>
                <span className="font-bold text-primary-dark">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Product</span>
                <span className="font-medium text-gray-800">{order.product}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Customer</span>
                <span className="font-medium text-gray-800">{order.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment</span>
                <span className="font-medium text-gray-800 capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total</span>
                <span className="font-bold text-gray-900">${order.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium capitalize">{order.status}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/" className="flex-1 btn-outline text-center">
              Continue Shopping
            </Link>
            <Link to="/admin/orders" className="flex-1 btn-primary text-center">
              View All Orders
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
