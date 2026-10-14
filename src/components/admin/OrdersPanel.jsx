'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where, Timestamp } from 'firebase/firestore';
import { formatPrice, formatDate } from '@/lib/utils';
import { openWhatsAppChat } from '@/lib/whatsapp';

const statusConfig = {
  nuevo: { label: '🆕 Nuevo', color: 'bg-blue-100 text-blue-700 border-blue-200', next: 'preparando' },
  preparando: { label: '🔥 Preparando', color: 'bg-orange-100 text-orange-700 border-orange-200', next: 'listo' },
  listo: { label: '✅ Listo', color: 'bg-green-100 text-green-700 border-green-200', next: 'completado' },
  completado: { label: '📦 Completado', color: 'bg-gray-100 text-gray-500 border-gray-200', next: null },
};

const statusFilters = [
  { id: 'activos', label: 'Activos' },
  { id: 'nuevo', label: 'Nuevos' },
  { id: 'preparando', label: 'Preparando' },
  { id: 'listo', label: 'Listos' },
  { id: 'completado', label: 'Completados' },
];

export default function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('activos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener pedidos de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);

    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('createdAt', '>=', todayTimestamp),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersList);
      setLoading(false);
    }, (error) => {
      console.error('Error escuchando pedidos:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        [`${newStatus}At`]: new Date(),
      });
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'activos') return order.status !== 'completado';
    return order.status === filter;
  });

  const newCount = orders.filter((o) => o.status === 'nuevo').length;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-10 h-10 border-4 border-chapa-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header con contador */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl text-chapa-brown">
          Pedidos de hoy
          {newCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
              {newCount} nuevo{newCount > 1 ? 's' : ''}
            </span>
          )}
        </h2>
        <span className="text-chapa-brown/50 text-sm">{orders.length} total</span>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-4 pb-1">
        {statusFilters.map((sf) => (
          <button
            key={sf.id}
            onClick={() => setFilter(sf.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === sf.id
                ? 'bg-chapa-brown text-white'
                : 'bg-white text-chapa-brown/60 hover:bg-gray-100'
            }`}
          >
            {sf.label}
          </button>
        ))}
      </div>

      {/* Lista de pedidos */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-chapa-brown/40">
          <p className="text-4xl mb-2">📋</p>
          <p>No hay pedidos con este filtro</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.nuevo;
            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-card p-4">
                {/* Header del pedido */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-chapa-brown">{order.customerName}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-chapa-brown/40 mt-0.5">
                      {order.orderId || `#${order.id.slice(-4)}`} • {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => openWhatsAppChat(order.customerPhone)}
                    className="bg-green-500 hover:bg-green-600 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                    title="Chat por WhatsApp"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </button>
                </div>

                {/* Items del pedido */}
                <div className="bg-chapa-cream rounded-xl p-3 mb-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-0.5">
                      <span className="text-chapa-brown/70">{item.quantity}x {item.name}</span>
                      <span className="font-semibold text-chapa-brown">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t border-chapa-brown/10 mt-1.5 pt-1.5 flex justify-between">
                    <span className="font-bold text-sm text-chapa-brown">Total</span>
                    <span className="font-bold text-chapa-brown">{formatPrice(order.total)}</span>
                  </div>
                </div>

                {/* Info adicional */}
                <div className="flex flex-wrap gap-2 text-xs text-chapa-brown/60 mb-3">
                  <span className="bg-gray-100 px-2 py-1 rounded-lg">
                    {order.deliveryType === 'envio' ? `🛵 ${order.address}` : '🏪 Retiro'}
                  </span>
                  <span className="bg-gray-100 px-2 py-1 rounded-lg">
                    {order.paymentMethod === 'efectivo' ? '💵 Efectivo' : '📱 Transferencia'}
                  </span>
                  {order.notes && (
                    <span className="bg-yellow-50 px-2 py-1 rounded-lg text-yellow-700">
                      📝 {order.notes}
                    </span>
                  )}
                </div>

                {/* Botón cambiar estado */}
                {config.next && (
                  <button
                    onClick={() => handleStatusChange(order.id, config.next)}
                    className="w-full bg-chapa-yellow text-chapa-brown py-2.5 rounded-xl font-bold text-sm hover:bg-chapa-yellow/80 transition-all active:scale-[0.98]"
                  >
                    {config.next === 'preparando' && '🔥 Marcar en Preparación'}
                    {config.next === 'listo' && '✅ Marcar como Listo'}
                    {config.next === 'completado' && '📦 Marcar como Completado'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
