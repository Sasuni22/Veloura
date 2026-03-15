import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';

export default function CategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products, categories } = useProducts();
  const [addedIds, setAddedIds] = useState({});

  const category = categories.find((c) => c.id === id);
  const categoryName = category ? category.name : (id.charAt(0).toUpperCase() + id.slice(1));
  const categoryItems = products.filter(
    (p) => p.category.toLowerCase() === id.toLowerCase()
  );

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(product, 1, product.sizes[1] || 'M', product.colors[0] || '');
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  const handleOrderNow = (product, e) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/order/${product.id}`, {
      state: {
        product,
        quantity: 1,
        size: product.sizes[1] || 'M',
        color: product.colors[0] || '',
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-dark transition-colors mb-4 group"
          >
            <svg
              className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link to="/" className="hover:text-primary-dark transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">{categoryName}</span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-4xl font-bold text-gray-900"
              >
                {categoryName}
              </motion.h1>
              {category && (
                <p className="text-gray-500 mt-1 text-sm">{category.description}</p>
              )}
            </div>
            <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              {categoryItems.length} items
            </span>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {categoryItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🛍️</div>
            <p className="text-gray-500 text-lg mb-2">No items found in this category.</p>
            <p className="text-gray-400 text-sm mb-6">Make sure your <code className="bg-gray-100 px-1 rounded">products.js</code> has products with <code className="bg-gray-100 px-1 rounded">category: '{categoryName}'</code></p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Back to Home
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {categoryItems.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex"
              >
                {/* Left: Product Image */}
                <div
                  className="w-36 sm:w-48 h-44 sm:h-52 flex-shrink-0 cursor-pointer relative overflow-hidden"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  {product.badge && (
                    <span className="absolute top-2 left-2 bg-primary-dark text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Right: Details + Price + Buttons */}
                <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                  <div>
                    <span className="text-xs text-primary-dark font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                      {product.category}
                    </span>

                    <h3
                      className="font-display text-lg font-semibold text-gray-900 mt-2 cursor-pointer hover:text-primary-dark transition-colors"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-3 h-3 ${star <= Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">({product.reviews.toLocaleString()})</span>
                    </div>

                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 hidden sm:block">
                      {product.description}
                    </p>
                  </div>

                  {/* Price + Buttons row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                    {/* Price */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display text-2xl font-bold text-gray-900">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                      {product.originalPrice && (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={(e) => handleAddToCart(product, e)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                          addedIds[product.id]
                            ? 'bg-green-500 text-white border-green-500 shadow-sm'
                            : 'border-gray-200 text-gray-700 hover:border-primary-dark hover:text-primary-dark'
                        }`}
                      >
                        {addedIds[product.id] ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Added!
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 7H4l1-7z" />
                            </svg>
                            Add to Cart
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={(e) => handleOrderNow(product, e)}
                        className="flex items-center gap-1.5 bg-primary-dark hover:bg-primary-darker text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Order Now
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}