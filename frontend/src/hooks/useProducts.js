// useProducts.js — shared hook for reading AND saving products/categories
// Used by store pages (ProductPage, CategoryPage, HomePage) AND admin dashboard
import { useState, useEffect } from 'react';
import { products as defaultProducts, categories as defaultCategories } from '../data/products';

export function useProducts() {
  const [products, setProducts] = useState(() => {
    try { const s = localStorage.getItem('admin_products'); return s ? JSON.parse(s) : defaultProducts; }
    catch { return defaultProducts; }
  });

  const [categories, setCategories] = useState(() => {
    try { const s = localStorage.getItem('admin_categories'); return s ? JSON.parse(s) : defaultCategories; }
    catch { return defaultCategories; }
  });

  // Sync across tabs (admin tab saves → store tab reloads)
  useEffect(() => {
    const sync = () => {
      try {
        const p = localStorage.getItem('admin_products');
        const c = localStorage.getItem('admin_categories');
        if (p) setProducts(JSON.parse(p));
        if (c) setCategories(JSON.parse(c));
      } catch {}
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const saveProducts = (updated) => {
    setProducts(updated);
    localStorage.setItem('admin_products', JSON.stringify(updated));
  };

  const saveCategories = (updated) => {
    setCategories(updated);
    localStorage.setItem('admin_categories', JSON.stringify(updated));
  };

  return { products, categories, saveProducts, saveCategories };
}