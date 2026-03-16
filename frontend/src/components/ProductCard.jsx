import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../hooks/useCart';

function StarDisplay({ rating, size = 'sm' }) {
  const w = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(star => {
        const full  = star <= Math.floor(rating);
        const half  = !full && star - 0.5 <= rating;
        return (
          <svg key={star} className={`${w} ${full || half ? 'text-yellow-400' : 'text-gray-200'}`}
            fill={full ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 20 20">
            {half ? (
              <>
                <defs>
                  <linearGradient id={`h${star}`}>
                    <stop offset="50%" stopColor="currentColor" stopOpacity="1"/>
                    <stop offset="50%" stopColor="transparent" stopOpacity="1"/>
                  </linearGradient>
                </defs>
                <path fill={`url(#h${star})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </>
            ) : (
              <path fill={full ? 'currentColor' : 'none'} strokeWidth={full ? 0 : 1}
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            )}
          </svg>
        );
      })}
    </div>
  );
}

export default function ProductCard({ product, index = 0 }) {
  const [isHovered, setIsHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Use live rating from userRatings if available, else fall back to base rating
  const userRatings = product.userRatings || [];
  const liveRating = userRatings.length > 0
    ? (userRatings.reduce((s, r) => s + r.score, 0) / userRatings.length)
    : product.rating;
  const totalReviews = product.reviews + userRatings.length;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product, 1, 'M', '');
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group ${product.inStock ? 'cursor-pointer' : 'cursor-default'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => product.inStock && navigate(`/product/${product.id}`)}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-50 aspect-[3/4] mb-4">
        <motion.img
          src={product.images[isHovered && product.images[1] ? 1 : 0]}
          alt={product.name}
          className={`w-full h-full object-cover ${!product.inStock ? 'grayscale opacity-70' : ''}`}
          animate={{ scale: isHovered && product.inStock ? 1.05 : 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {/* Out of Stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="bg-white text-gray-800 font-bold text-sm px-4 py-2 rounded-full shadow-lg tracking-wide">
              Out of Stock
            </span>
          </div>
        )}

        {/* Badge */}
        {product.badge && product.inStock && (
          <div className="absolute top-3 left-3">
            <span className="bg-primary-dark text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {product.badge}
            </span>
          </div>
        )}

        {/* Discount */}
        {discount && product.inStock && (
          <div className="absolute top-3 right-3">
            <span className="bg-white text-primary-dark text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
              -{discount}%
            </span>
          </div>
        )}

        {/* Hover Quick Add */}
        {product.inStock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/10 flex items-end p-4"
          >
            <motion.button
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-full bg-white text-gray-900 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark hover:text-white transition-colors shadow-lg"
              onClick={handleAddToCart}
            >
              {added ? '✓ Added to Cart' : 'Quick Add'}
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Info */}
      <div>
        <p className="text-xs text-gray-400 mb-1">{product.category}</p>
        <h3 className="font-body font-medium text-gray-900 mb-2 group-hover:text-primary-dark transition-colors line-clamp-1">
          {product.name}
        </h3>

        {/* Live Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <StarDisplay rating={liveRating} />
          <span className="text-xs font-semibold text-gray-700">{liveRating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({totalReviews.toLocaleString()})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-semibold text-gray-900">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>

        {/* Buttons */}
        {product.inStock ? (
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleAddToCart}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${
                added ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 text-gray-700 hover:border-primary-dark hover:text-primary-dark'
              }`}>
              {added ? '✓ Added!' : 'Add to Cart'}
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={(e) => { e.stopPropagation(); navigate(`/order/${product.id}`); }}
              className="flex-1 bg-primary-dark text-white py-2 rounded-xl text-xs font-medium hover:bg-primary-darker transition-colors">
              Order Now
            </motion.button>
          </div>
        ) : (
          <div className="py-2 rounded-xl text-xs font-medium text-center border border-gray-200 text-gray-400 bg-gray-50">
            Currently Unavailable
          </div>
        )}
      </div>
    </motion.div>
  );
}