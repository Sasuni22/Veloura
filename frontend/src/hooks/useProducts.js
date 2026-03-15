// useProducts.js — reads admin-saved products/categories from localStorage
// Falls back to the static products.js if no admin changes have been saved yet
import { useState, useEffect } from 'react';
import { products as defaultProducts, categories as defaultCategories } from '../data/products';

export function useProducts() {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_products');
      return saved ? JSON.parse(saved) : defaultProducts;
    } catch { return defaultProducts; }
  });

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_categories');
      return saved ? JSON.parse(saved) : defaultCategories;
    } catch { return defaultCategories; }
  });

  // Listen for changes made in the admin dashboard (same tab)
  useEffect(() => {
    const handleStorage = () => {
      try {
        const p = localStorage.getItem('admin_products');
        const c = localStorage.getItem('admin_categories');
        if (p) setProducts(JSON.parse(p));
        if (c) setCategories(JSON.parse(c));
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return { products, categories };
}