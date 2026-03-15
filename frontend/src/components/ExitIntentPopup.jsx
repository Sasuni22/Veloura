import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const offerProducts = [
  {
    id: '1',
    name: 'Floral Silk Maxi Dress',
    originalPrice: 249,
    salePrice: 174,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    name: 'Boho Midi Dress',
    originalPrice: 75,
    salePrice: 52,
    image: 'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: '5',
    name: 'Linen Summer Dress',
    originalPrice: 89,
    salePrice: 62,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=300&auto=format&fit=crop&q=80',
  },
];

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const navigate = useNavigate();

  const handleMouseLeave = useCallback(
    (e) => {
      if (e.clientY <= 10 && !hasShown) {
        setShow(true);
        setHasShown(true);
      }
    },
    [hasShown]
  );

  useEffect(() => {
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [handleMouseLeave]);

  const handleClose = () => setShow(false);

  const handleOrder = (productId) => {
    setShow(false);
    navigate(`/order/${productId}`);
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white relative">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="text-center">
                  <motion.div
                    initial={{ rotate: -10 }}
                    // ✅ Correct — regular hyphens only
animate={{ rotate: [-10, 10, -5, 5, 0] }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-4xl mb-2"
                  >
                    🎉
                  </motion.div>
                  <h2 className="font-display text-2xl font-semibold mb-1">Wait! Special Offer</h2>
                  <p className="text-white/80 text-sm">Get 30% OFF on these exclusive picks — today only!</p>
                </div>
              </div>

              {/* Products */}
              <div className="p-6">
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {offerProducts.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="text-center"
                    >
                      <div className="relative mb-2 rounded-xl overflow-hidden aspect-[3/4]">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 right-1 bg-primary-dark text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                          -30%
                        </div>
                      </div>
                      <p className="text-xs font-medium text-gray-700 line-clamp-2 mb-1">{product.name}</p>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-sm font-bold text-primary-dark">${product.salePrice}</span>
                        <span className="text-xs text-gray-400 line-through">${product.originalPrice}</span>
                      </div>
                      <button
                        onClick={() => handleOrder(product.id)}
                        className="w-full mt-2 bg-primary-dark text-white text-xs py-1.5 rounded-lg hover:bg-primary-darker transition-colors"
                      >
                        Buy Now
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Countdown */}
                <div className="text-center bg-cream rounded-xl p-3">
                  <p className="text-xs text-primary-darker font-medium">⏰ Offer expires at midnight — Don't miss out!</p>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  No thanks, I'll pay full price
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
