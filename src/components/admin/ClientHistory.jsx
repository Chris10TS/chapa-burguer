'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { formatPrice } from '@/lib/utils';
import { openWhatsAppChat } from '@/lib/whatsapp';

export default function ClientHistory() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const clientMap = {};
      snapshot.docs.forEach((doc) => {
        const order = doc.data();
        const phone = order.customerPhone;
        if (!phone) return;
        
        if (!clientMap[phone]) {
          clientMap[phone] = {
            phone,
            name: order.customerName,
            orders: 0,
            totalSpent: 0,
            lastOrder: order.createdAt,
          };
        }
        clientMap[phone].orders += 1;
        clientMap[phone].totalSpent += order.total || 0;
        // Mantener el nombre más reciente
        if (order.createdAt > clientMap[phone].lastOrder) {
          clientMap[phone].name = order.customerName;
          clientMap[phone].lastOrder = order.createdAt;
        }
      });
      
      const clientList = Object.values(clientMap)
        .sort((a, b) => b.orders - a.orders);
      
      setClients(clientList);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredClients = clients.filter((c) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-10 h-10 border-4 border-chapa-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl text-chapa-brown">👥 Clientes</h2>
        <span className="text-chapa-brown/50 text-sm">{clients.length} clientes</span>
      </div>

      {/* Búsqueda */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 Buscar por nombre o teléfono..."
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-chapa-yellow focus:outline-none transition-colors text-chapa-brown mb-4"
      />

      {filteredClients.length === 0 ? (
        <div className="text-center py-12 text-chapa-brown/40">
          <p className="text-4xl mb-2">👥</p>
          <p>No se encontraron clientes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredClients.map((client) => (
            <div key={client.phone} className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-chapa-yellow/20 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-chapa-brown text-sm">
                  {(client.name || 'C').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-chapa-brown text-sm truncate">{client.name || 'Sin nombre'}</p>
                <p className="text-xs text-chapa-brown/50">{client.phone}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-sm text-chapa-brown">{client.orders} pedidos</p>
                <p className="text-xs text-chapa-brown/50">{formatPrice(client.totalSpent)}</p>
              </div>
              <button
                onClick={() => openWhatsAppChat(client.phone)}
                className="bg-green-500 hover:bg-green-600 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
