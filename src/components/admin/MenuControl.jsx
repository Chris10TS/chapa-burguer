'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { initialMenu, categories } from '@/data/initialMenu';
import { formatPrice } from '@/lib/utils';
import toast, { Toaster } from 'react-hot-toast';

export default function MenuControl() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPrice, setEditingPrice] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [syncing, setSyncing] = useState(false);

  // Estados para crear producto nuevo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: categories[0]?.id || '',
    description: '',
    price: '',
    image: '',
    badge: ''
  });

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
      // Fallback: si falla el orderBy('order'), intentar leer sin orden
      try {
        const fallbackSnapshot = await getDocs(collection(db, 'menu'));
        if (!fallbackSnapshot.empty) {
          setMenuItems(fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          setMenuItems(initialMenu);
        }
      } catch (err) {
        setMenuItems(initialMenu);
      }
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

  // Crear producto nuevo en Firestore
  async function handleCreateProduct(e) {
    e.preventDefault();
    const price = parseFloat(newItem.price);

    if (!newItem.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (isNaN(price) || price <= 0) {
      toast.error('Ingresá un precio válido');
      return;
    }

    setCreating(true);
    try {
      const productData = {
        name: newItem.name.trim(),
        category: newItem.category,
        description: newItem.description.trim(),
        price: price,
        image: newItem.image.trim() || '/logo.png',
        badge: newItem.badge.trim() || null,
        available: true,
        order: menuItems.length + 1,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'menu'), productData);

      setMenuItems(prev => [...prev, { id: docRef.id, ...productData }]);
      toast.success('¡Producto agregado con éxito!');
      setIsModalOpen(false);
      setNewItem({
        name: '',
        category: categories[0]?.id || '',
        description: '',
        price: '',
        image: '',
        badge: ''
      });
    } catch (error) {
      console.error('Error al crear producto:', error);
      toast.error('Error al guardar el producto');
    } finally {
      setCreating(false);
    }
  }

  // Eliminar producto
  async function handleDeleteProduct(itemId, name) {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${name}"?`)) return;

    try {
      await deleteDoc(doc(db, 'menu', itemId));
      setMenuItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Producto eliminado');
    } catch (error) {
      console.error('Error eliminando producto:', error);
      toast.error('Error al eliminar');
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
      
      {/* Cabecera y acciones */}
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <h2 className="font-bold text-xl text-chapa-brown">🍔 Control del Menú</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-green-700 transition-colors shadow-sm"
          >
            ➕ Nuevo Producto
          </button>
          <button
            onClick={syncMenuToFirestore}
            disabled={syncing}
            className="bg-chapa-brown text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-chapa-brown-light transition-colors disabled:opacity-50"
          >
            {syncing ? '⏳ Sincronizando...' : '🔄 Sincronizar'}
          </button>
        </div>
      </div>

      <p className="text-xs text-chapa-brown/50 mb-4 bg-chapa-yellow/10 p-3 rounded-xl">
        💡 <strong>Gestión:</strong> Podés sumar hamburguesas nuevas, pausar stock de las que se quedaron sin insumos o editar precios al instante.
      </p>

      {/* Listado agrupado por categorías */}
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
                      title={item.available ? 'Marcar como agotado' : 'Marcar como disponible'}
                    >
                      <span
                        className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${
                          item.available ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                    
                    {/* Info del producto */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold text-sm ${
                          item.available ? 'text-chapa-brown' : 'text-chapa-brown/40 line-through'
                        }`}>
                          {item.name}
                        </p>
                        {item.badge && (
                          <span className="bg-chapa-yellow text-chapa-brown text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-chapa-brown/40 truncate">
                        {item.description}
                      </p>
                    </div>

                    {/* Precio y edición */}
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
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => { setEditingPrice(item.id); setNewPrice(item.price.toString()); }}
                          className="font-bold text-sm text-chapa-brown bg-chapa-cream px-3 py-1.5 rounded-lg hover:bg-chapa-yellow/20 transition-colors"
                        >
                          {formatPrice(item.price)} ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(item.id, item.name)}
                          className="text-gray-300 hover:text-red-500 p-1 transition-colors text-sm"
                          title="Eliminar producto"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Modal para agregar producto nuevo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl relative animate-in fade-in zoom-in duration-150">
            <h3 className="font-bold text-lg text-chapa-brown mb-4">🍔 Agregar Nuevo Producto</h3>
            
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-chapa-brown mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Triple Bacon Smash"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-chapa-yellow"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-chapa-brown mb-1">Categoría</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-chapa-yellow bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-chapa-brown mb-1">Precio ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="Ej: 8500"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-chapa-yellow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-chapa-brown mb-1">Descripción / Ingredientes</label>
                <textarea
                  rows="2"
                  placeholder="Ej: Medallón de carne 120g, triple queso cheddar, panceta crocante..."
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-chapa-yellow"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-chapa-brown mb-1">Badge (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: NUEVO o TOP"
                    value={newItem.badge}
                    onChange={(e) => setNewItem({ ...newItem, badge: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-chapa-yellow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-chapa-brown mb-1">URL Foto (Opcional)</label>
                  <input
                    type="text"
                    placeholder="URL de imagen"
                    value={newItem.image}
                    onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-chapa-yellow"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-chapa-brown text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-chapa-brown-light transition-colors disabled:opacity-50"
                >
                  {creating ? 'Guardando...' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}