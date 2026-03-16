import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// Social media preview data — replace links with your own
const socialPosts = [
  {
    platform: 'Instagram',
    handle: '@velourа',
    link: 'https://www.instagram.com/',
    icon: '📸',
    color: 'from-pink-500 to-purple-600',
    image: '/images/bohomihi1.png',
    caption: 'New collection drop 🌸 Silk Maxi Dress now available',
    likes: '2.4k',
  },
  {
    platform: 'Facebook',
    handle: 'Velourа Official',
    link: 'https://www.facebook.com/',
    icon: '📘',
    color: 'from-blue-500 to-blue-700',
    image: 'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=400&auto=format&fit=crop&q=80',
    caption: 'Get 30% OFF on selected Boho dresses this weekend only!',
    likes: '1.8k',
  },
  
];

export default function HomePage() {
  const navigate = useNavigate();
  const featuredRef = useRef(null);
  const { products, categories } = useProducts();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* ── HERO ── */}
      <section className="relative min-h-screen bg-cream overflow-hidden flex items-center">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-10 w-72 h-72 bg-primary-dark/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block text-primary-dark text-sm font-medium tracking-widest uppercase mb-4 border border-primary/30 bg-white/60 px-4 py-1.5 rounded-full"
              >
                ✨ Where every look is a statement
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6"
              >
                New Collections 
                <br />
                <span className="text-primary-dark italic">Out Now</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 text-lg mb-8 max-w-md leading-relaxed"
              >
                Discover the latest trends in high-end women's fashion. Timeless pieces for the modern woman.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                <button
                  onClick={() => featuredRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-primary text-base px-8 py-4"
                >
                  Shop Now
                </button>
                <button className="btn-outline text-base px-8 py-4">
                  View Lookbook
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex gap-8 mt-12"
              >
                {[
                  { label: 'Styles', value: '50+' },
                  { label: 'Happy Customers', value: '100+' },
                  { label: 'New Arrivals', value: 'Weekly' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="font-display text-2xl font-bold text-primary-dark">{stat.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Hero Image Grid */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 mt-8">
                  <div className="rounded-3xl overflow-hidden h-72 shadow-xl">
                    <img
                      src='/images/bohomihi1.png'
                      alt="Fashion"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="rounded-3xl overflow-hidden h-48 shadow-lg">
                    <img
                      src='/images/floralcrop.png'
                      alt="Fashion"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-3xl overflow-hidden h-48 shadow-lg">
                    <img
                      src='/images/LinenSummerDress1.png'
                      alt="Fashion"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="rounded-3xl overflow-hidden h-72 shadow-xl">
                    <img
                      src='/images/floralsilk1.png'
                      alt="Fashion"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-cream rounded-full flex items-center justify-center text-xl">🛍️</div>
                <div>
                  <div className="text-xs text-gray-500">New Collection</div>
                  <div className="font-semibold text-sm text-gray-900">30% OFF Today</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section id="categories" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-primary-dark text-sm font-medium tracking-widest uppercase">Browse By</span>
            <h2 className="section-title mt-2">Shop Categories</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="relative rounded-3xl overflow-hidden h-80 cursor-pointer group shadow-lg"
                onClick={() => navigate(`/category/${cat.id}`)}
              >
                {/* REPLACEABLE image — update in products.js categories array */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="font-display text-2xl font-semibold">{cat.name}</h3>
                  <p className="text-sm text-white/70 mt-1">{cat.count}</p>
                </div>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore →
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED DRESSES ── */}
      <section id="featured" ref={featuredRef} className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <span className="text-primary-dark text-sm font-medium tracking-widest uppercase">Curated Picks</span>
              <h2 className="section-title mt-2">Featured Dresses</h2>
            </div>
            <a href="#" className="text-sm font-medium text-primary-dark hover:text-primary-darker flex items-center gap-1 group">
              View All
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </motion.div>

          {/* REPLACEABLE images — update product images in products.js */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {featuredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SOCIAL MEDIA SECTION ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-primary-dark text-sm font-medium tracking-widest uppercase">Follow Along</span>
            <h2 className="section-title mt-2">Find Us on Social Media</h2>
            <p className="text-gray-500 mt-3 max-w-md mx-auto">
              Stay updated with the latest drops, style tips, and exclusive offers across our channels.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {socialPosts.map((post, i) => (
              <motion.a
                key={post.platform}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="block rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.platform}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Platform badge */}
                  <div className={`absolute top-4 left-4 bg-gradient-to-r ${post.color} text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg`}>
                    <span>{post.icon}</span>
                    <span>{post.platform}</span>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white text-gray-900 text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg">
                      Visit Page →
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-white p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-800">{post.handle}</span>
                    <span className="text-xs text-gray-400">❤️ {post.likes}</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{post.caption}</p>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Social icons row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex justify-center gap-5 mt-10"
          >
            {[
              { label: 'Instagram', icon: '📸', link: 'https://www.instagram.com/', color: 'hover:bg-pink-50 hover:border-pink-300 hover:text-pink-600' },
              { label: 'Facebook', icon: '📘', link: 'https://www.facebook.com/', color: 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600' },
          
              { label: 'TikTok', icon: '🎵', link: 'https://www.tiktok.com/', color: 'hover:bg-gray-50 hover:border-gray-400 hover:text-gray-800' },
            ].map((s) => (
              <a
                key={s.label}
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-200 px-5 py-2.5 rounded-full transition-all duration-200 ${s.color}`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </a>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}