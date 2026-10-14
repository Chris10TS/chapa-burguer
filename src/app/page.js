'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { initialMenu, categories } from '@/data/initialMenu';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';
import ProductCard from '@/components/ProductCard';
import FloatingCart from '@/components/FloatingCart';
import CheckoutModal from '@/components/CheckoutModal';
import { Toaster } from 'react-hot-toast';

export default function HomePage() {
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('destacadas');
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    async function loadMenu() {
      try {
        const menuRef = collection(db, 'menu');
        const q = query(menuRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          setMenuItems(initialMenu);
        } else {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMenuItems(items);
        }
      } catch (error) {
        console.log('Usando menú local:', error.message);
        setMenuItems(initialMenu);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  const filteredItems = menuItems.filter(
    (item) => item.category === activeCategory
  );

  return (
    <CartProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#2B1E16',
            color: '#fff',
            borderRadius: '12px',
            fontFamily: 'Fredoka, sans-serif',
          },
        }}
      />
      <main className="min-h-screen bg-chapa-cream">
        <Header />
        
        <section className="px-4 pt-4 pb-32 max-w-4xl mx-auto">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-chapa-yellow border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-chapa-brown/60 font-medium">Cargando carta...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🍔</p>
              <p className="text-chapa-brown/50 font-medium">No hay productos en esta categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {filteredItems.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          )}
        </section>

        <FloatingCart onCheckout={() => setShowCheckout(true)} />
        
        {showCheckout && (
          <CheckoutModal onClose={() => setShowCheckout(false)} />
        )}
      </main>
    </CartProvider>
  );
}
