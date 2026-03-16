import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './hooks/useCart';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ExitIntentPopup from './components/ExitIntentPopup';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import OrderPage from './pages/OrderPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import CategoryPage from './pages/CategoryPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -10 },
};
const pageTransition = { duration: 0.3, ease: 'easeInOut' };

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} initial="initial" animate="in" exit="out"
        variants={pageVariants} transition={pageTransition}>
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/order/:id" element={<OrderPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function StoreLayout() {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1"><AnimatedRoutes /></main>
        <Footer />
        <ExitIntentPopup />
        <Toaster position="top-right" toastOptions={{
          duration: 4000,
          style: { background: '#1f2937', color: '#fff', borderRadius: '12px', fontSize: '14px' },
          success: { iconTheme: { primary: '#EA7B7B', secondary: '#fff' } },
        }} />
      </div>
    </CartProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin login page — /admin */}
        <Route path="/admin" element={<AdminLogin />} />
        {/* Admin dashboard — /admin/dashboard (protected by session check inside component) */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        {/* Store */}
        <Route path="/*" element={<StoreLayout />} />
      </Routes>
    </BrowserRouter>
  );
}