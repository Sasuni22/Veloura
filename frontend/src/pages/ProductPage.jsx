import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';

// ── Reusable star display ──
function StarDisplay({ rating, size = 'md' }) {
  const w = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(star => (
        <svg key={star} className={`${w} ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ── Interactive star picker ──
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(star => (
        <button key={star} type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110 focus:outline-none"
        >
          <svg className={`w-8 h-8 transition-colors ${star <= (hovered || value) ? 'text-yellow-400' : 'text-gray-200'}`}
            fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

// ── Rating bar row ──
function RatingBar({ star, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-3 text-gray-500 text-xs font-medium shrink-0">{star}</span>
      <svg className="w-3.5 h-3.5 text-yellow-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: 0.2 }}
          className="h-full bg-yellow-400 rounded-full" />
      </div>
      <span className="w-6 text-right text-xs text-gray-400 shrink-0">{count}</span>
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products, saveProducts } = useProducts();

  const product = products.find(p => p.id === id);

  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cartAdded, setCartAdded] = useState(false);

  // Rating state
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingName, setRatingName] = useState('');
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-display text-gray-800 mb-4">Product not found</p>
          <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  // Compute live rating from userRatings + base rating/reviews
  const userRatings = product.userRatings || [];
  const allRatingsCount = product.reviews + userRatings.length;
  // Weighted average: base rating × base reviews + user ratings sum, divided by total
  const userSum = userRatings.reduce((s, r) => s + r.score, 0);
  const liveRating = allRatingsCount > 0
    ? ((product.rating * product.reviews + userSum) / allRatingsCount)
    : product.rating;

  // Distribution for bars
  const distrib = [5,4,3,2,1].map(star => ({
    star,
    count: userRatings.filter(r => r.score === star).length
  }));

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart(product, quantity, selectedSize, product.colors[selectedColor]);
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2000);
  };

  const handleSubmitRating = () => {
    if (!ratingScore) return;
    const newRating = {
      id: Date.now(),
      name: ratingName.trim() || 'Anonymous',
      score: ratingScore,
      comment: ratingComment.trim(),
      date: new Date().toISOString(),
    };
    const updated = products.map(p =>
      p.id === id ? { ...p, userRatings: [...(p.userRatings || []), newRating] } : p
    );
    saveProducts(updated);
    setRatingSubmitted(true);
    setShowRatingForm(false);
    setRatingScore(0);
    setRatingName('');
    setRatingComment('');
  };

  const colorSwatches = ['#EA7B7B', '#8B1A1A', '#F5E6D0'];

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-primary-dark transition-colors">Home</Link>
          <span>/</span>
          <span className="hover:text-primary-dark cursor-pointer">{product.category}</span>
          <span>/</span>
          <span className="text-gray-800">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* ── Images ── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="relative rounded-3xl overflow-hidden bg-gray-50 aspect-[3/4] mb-4 group">
              {/* Out of stock banner */}
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                  <div className="bg-white text-gray-900 font-bold text-xl px-8 py-4 rounded-2xl shadow-2xl rotate-[-3deg]">
                    Out of Stock
                  </div>
                </div>
              )}
              <motion.img
                key={activeImage}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                src={product.images[activeImage]}
                alt={product.name}
                className={`w-full h-full object-cover ${!product.inStock ? 'grayscale' : ''}`}
              />
            </div>
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`relative rounded-xl overflow-hidden w-20 h-24 border-2 transition-all ${activeImage === i ? 'border-primary-dark' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── Details ── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }} className="lg:pt-4">

            {/* Stock badge */}
            {!product.inStock && (
              <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full mb-3">
                ✕ Out of Stock
              </span>
            )}
            {product.inStock && (
              <span className="inline-block bg-emerald-100 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full mb-3">
                ✓ In Stock
              </span>
            )}

            <h1 className="font-display text-3xl font-semibold text-gray-900 mb-3">{product.name}</h1>

            {/* Live Rating summary */}
            <div className="flex items-center gap-3 mb-4">
              <StarDisplay rating={liveRating} />
              <span className="text-base font-bold text-gray-800">{liveRating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({allRatingsCount.toLocaleString()} reviews)</span>
              <button onClick={() => setShowRatingForm(!showRatingForm)}
                className="ml-auto text-xs font-semibold text-primary-dark hover:text-primary-darker underline underline-offset-2 transition-colors">
                Rate this product
              </button>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="font-display text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
              )}
              {product.originalPrice && (
                <span className="bg-rose-100 text-rose-600 text-sm font-bold px-2.5 py-1 rounded-full">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-8 text-sm">{product.description}</p>

            {/* ── Rate This Product form ── */}
            <AnimatePresence>
              {showRatingForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-4">
                    <h4 className="font-semibold text-gray-800">Leave a Rating</h4>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Your rating</p>
                      <StarPicker value={ratingScore} onChange={setRatingScore} />
                      {ratingScore > 0 && (
                        <p className="text-xs text-amber-600 font-medium mt-1">
                          {['','😞 Poor','😐 Fair','🙂 Good','😊 Great','🤩 Excellent'][ratingScore]}
                        </p>
                      )}
                    </div>
                    <input value={ratingName} onChange={e => setRatingName(e.target.value)}
                      placeholder="Your name (optional)"
                      className="w-full border border-amber-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                    <textarea value={ratingComment} onChange={e => setRatingComment(e.target.value)}
                      placeholder="Share your thoughts about this product (optional)"
                      rows={2} className="w-full border border-amber-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none" />
                    <div className="flex gap-2">
                      <button onClick={handleSubmitRating} disabled={!ratingScore}
                        className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-gray-700 transition-colors">
                        Submit Rating
                      </button>
                      <button onClick={() => setShowRatingForm(false)}
                        className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success message */}
            <AnimatePresence>
              {ratingSubmitted && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-5 font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Thank you! Your rating has been submitted.
                </motion.div>
              )}
            </AnimatePresence>

            {/* Color selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                  Color: <span className="font-normal text-gray-600">{product.colors[selectedColor]}</span>
                </span>
              </div>
              <div className="flex gap-3">
                {colorSwatches.map((color, i) => (
                  <button key={i} onClick={() => setSelectedColor(i)}
                    className={`w-9 h-9 rounded-full border-2 transition-all ${selectedColor === i ? 'border-gray-800 scale-110' : 'border-gray-200'}`}
                    style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Select Size</span>
                <button className="text-sm text-primary-dark underline">Size Guide</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-xl border text-sm font-medium transition-all ${
                      selectedSize === size ? 'border-primary-dark bg-primary-dark text-white' : 'border-gray-200 text-gray-700 hover:border-primary-dark'
                    }`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <span className="text-sm font-semibold text-gray-800 uppercase tracking-wide block mb-3">Quantity</span>
              <div className="flex items-center gap-3 w-fit">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:border-primary-dark transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                </button>
                <span className="text-lg font-medium w-6 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:border-primary-dark transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>

            {/* CTA */}
            {product.inStock ? (
              <div className="flex gap-3 mb-8">
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleAddToCart}
                  className={`flex-1 py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 border-2 ${
                    cartAdded ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-200' : 'border-gray-200 text-gray-800 hover:border-primary-dark hover:text-primary-dark'
                  }`}>
                  {cartAdded ? (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Added to Cart!</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 7H4l1-7z" /></svg>Add to Cart</>
                  )}
                </motion.button>
                <button onClick={() => navigate(`/order/${product.id}`, { state: { product, quantity, size: selectedSize, color: product.colors[selectedColor] } })}
                  className="flex-1 bg-primary-dark hover:bg-primary-darker text-white py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Order Now
                </button>
              </div>
            ) : (
              <div className="mb-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl py-5 text-center text-gray-400 font-medium">
                This product is currently out of stock
              </div>
            )}

            {/* Shipping info */}
            <div className="space-y-3 bg-gray-50 rounded-2xl p-5">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <strong>Free Shipping & Returns</strong>
                  <p className="text-gray-500 text-xs mt-0.5">Free standard shipping on orders above $150</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div>
                  <strong>Secure Checkout</strong>
                  <p className="text-gray-500 text-xs mt-0.5">Your payment info is handled securely</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── REVIEWS SECTION ── */}
        {userRatings.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="mt-20 border-t border-gray-100 pt-16">
            <h2 className="font-display text-3xl font-semibold text-gray-900 mb-10">Customer Reviews</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left: Summary */}
              <div className="bg-gray-50 rounded-3xl p-8 text-center self-start">
                <div className="text-6xl font-bold text-gray-900 mb-2">{liveRating.toFixed(1)}</div>
                <StarDisplay rating={liveRating} size="md" />
                <p className="text-sm text-gray-500 mt-2">{userRatings.length} customer {userRatings.length === 1 ? 'review' : 'reviews'}</p>
                <div className="mt-6 space-y-2">
                  {distrib.map(({ star, count }) => (
                    <RatingBar key={star} star={star} count={count} total={userRatings.length} />
                  ))}
                </div>
                <button onClick={() => setShowRatingForm(true)}
                  className="mt-6 w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors">
                  Write a Review
                </button>
              </div>

              {/* Right: Reviews list */}
              <div className="lg:col-span-2 space-y-5">
                {[...userRatings].reverse().map((review, i) => (
                  <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">{review.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                          <p className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</p>
                        </div>
                      </div>
                      <StarDisplay rating={review.score} size="sm" />
                    </div>
                    {review.comment && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{review.comment}</p>}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty review CTA */}
        {userRatings.length === 0 && (
          <div className="mt-20 border-t border-gray-100 pt-16 text-center">
            <h2 className="font-display text-2xl font-semibold text-gray-900 mb-2">No Reviews Yet</h2>
            <p className="text-gray-500 text-sm mb-6">Be the first to share your thoughts on this product!</p>
            <button onClick={() => { setShowRatingForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors">
              Write the First Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}