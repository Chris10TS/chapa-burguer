'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, setDoc } from 'firebase/firestore';
import { initialMenu, categories } from '@/data/initialMenu';
import { formatPrice } from '@/lib/utils';
import toast, { Toaster } from 'react-hot-toast';

export default function MenuControl() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPrice, setEditingPrice] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadMenu();
  }, []);

  async function loadMenu() {
    try {
      const menuRef = collection(db, 'menu');
      const q = query(menuRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setMenuItems(initialMenu);
      } else {
        setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    } catch (error) {
      console.error('Error cargando menú:', error);
      setMenuItems(initialMenu);
    } finally {
      setLoading(false);
    }
  }

  // Sincronizar menú inicial a Firestore
  async function syncMenuToFirestore() {
    setSyncing(true);
    try {
      for (const item of initialMenu) {
        await setDoc(doc(db, 'menu', item.id), item);
      }
      await loadMenu();
      toast.success('Menú sincronizado con la base de datos');
    } catch (error) {
      console.error('Error sincronizando:', error);
      toast.error('Error al sincronizar');
    } finally {
      setSyncing(false);
    }
  }

  async function toggleAvailability(itemId, currentAvailability) {
    try {
      await updateDoc(doc(db, 'menu', itemId), {
        available: !currentAvailability,
      });
      setMenuItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, available: !currentAvailability } : item
      ));
      toast.success(!currentAvailability ? 'Producto disponible' : 'Producto agotado');
    } catch (error) {
      console.error('Error actualizando disponibilidad:', error);
      toast.error('Error al actualizar. ¿Sincronizaste el menú?');
    }
  }

  async function savePrice(itemId) {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Ingresá un precio válido');
      return;
    }
    try {
      await updateDoc(doc(db, 'menu', itemId), { price });
      setMenuItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, price } : item
      ));
      setEditingPrice(null);
      setNewPrice('');
      toast.success('Precio actualizado');
    } catch (error) {
      console.error('Error actualizando precio:', error);
      toast.error('Error al actualizar. ¿Sincronizaste el menú?');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-10 h-10 border-4 border-chapa-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Toaster position="bottom-center" />
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl text-chapa-brown">🍔 Control del Menú</h2>
        <button
          onClick={syncMenuToFirestore}
          disabled={syncing}
          className="bg-chapa-brown text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-chapa-brown-light transition-colors disabled:opacity-50"
        >
          {syncing ? '⏳ Sincronizando...' : '🔄 Sincronizar Menú'}
        </button>
      </div>

      <p className="text-xs text-chapa-brown/50 mb-4 bg-chapa-yellow/10 p-3 rounded-xl">
        💡 <strong>Primera vez:</strong> Presioná "Sincronizar Menú" para cargar los productos en la base de datos. Después podrás editarlos desde acá.
      </p>

      {categories.map((cat) => {
        const catItems = menuItems.filter((item) => item.category === cat.id);
        if (catItems.length === 0) return null;
        
        return (
          <div key={cat.id} className="mb-6">
            <h3 className="font-bold text-sm text-chapa-brown/60 uppercase tracking-wide mb-2">
              {cat.label}
            </h3>
            <div className="space-y-2">
              {catItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-card p-4">
                  <div className="flex items-center gap-3">
                    {/* Toggle disponibilidad */}
                    <button
                      onClick={() => toggleAvailability(item.id, item.available)}
                      className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
                        item.available ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${
                          item.available ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                    
                    {/* Info del producto */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${
                        item.available ? 'text-chapa-brown' : 'text-chapa-brown/40 line-through'
                      }`}>
                        {item.name}
                      </p>
                      <p className="text-xs text-chapa-brown/40 truncate">
                        {item.description}
                      </p>
                    </div>

                    {/* Precio */}
                    {editingPrice === item.id ? (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <input
                          type="number"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="w-20 px-2 py-1 text-sm border-2 border-chapa-yellow rounded-lg focus:outline-none text-right"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') savePrice(item.id);
                            if (e.key === 'Escape') { setEditingPrice(null); setNewPrice(''); }
                          }}
                        />
                        <button
                          onClick={() => savePrice(item.id)}
                          className="bg-green-500 text-white w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => { setEditingPrice(null); setNewPrice(''); }}
                          className="bg-gray-200 text-gray-500 w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingPrice(item.id); setNewPrice(item.price.toString()); }}
                        className="font-bold text-sm text-chapa-brown bg-chapa-cream px-3 py-1.5 rounded-lg hover:bg-chapa-yellow/20 transition-colors flex-shrink-0"
                      >
                        {formatPrice(item.price)} ✏️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
