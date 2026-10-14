'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { formatPrice, generateOrderId } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { buildWhatsAppMessage, openWhatsApp } from '@/lib/whatsapp';
import toast from 'react-hot-toast';

export default function CheckoutModal({ onClose }) {
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    deliveryType: 'retiro',
    address: '',
    paymentMethod: 'efectivo',
    notes: '',
  });

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.customerName.trim()) {
      toast.error('Ingresá tu nombre');
      return;
    }
    if (!form.customerPhone.trim()) {
      toast.error('Ingresá tu número de teléfono');
      return;
    }
    if (form.deliveryType === 'envio' && !form.address.trim()) {
      toast.error('Ingresá tu dirección para el envío');
      return;
    }

    setLoading(true);

    const order = {
      orderId: generateOrderId(),
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total: totalPrice,
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      deliveryType: form.deliveryType,
      address: form.deliveryType === 'envio' ? form.address.trim() : null,
      paymentMethod: form.paymentMethod,
      notes: form.notes.trim(),
      status: 'nuevo',
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'orders'), order);
      
      // Abrir WhatsApp con mensaje prearmado
      const message = buildWhatsAppMessage(order);
      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
      openWhatsApp(whatsappNumber, message);

      toast.success('¡Pedido enviado! Te redirigimos a WhatsApp');
      clearCart();
      onClose();
    } catch (error) {
      console.error('Error al guardar pedido:', error);
      // Aunque falle Firestore, intentar abrir WhatsApp igual
      const message = buildWhatsAppMessage(order);
      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
      openWhatsApp(whatsappNumber, message);
      
      toast.success('¡Pedido enviado por WhatsApp!');
      clearCart();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up shadow-float">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
          <h2 className="font-bold text-xl text-chapa-brown">Finalizar Pedido</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Resumen del pedido */}
          <div className="bg-chapa-cream rounded-2xl p-4">
            <h3 className="font-semibold text-chapa-brown mb-2 text-sm">📋 Resumen</h3>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm py-1">
                <span className="text-chapa-brown/70">{item.quantity}x {item.name}</span>
                <span className="font-semibold text-chapa-brown">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-chapa-brown/10 mt-2 pt-2 flex justify-between">
              <span className="font-bold text-chapa-brown">Total</span>
              <span className="font-bold text-chapa-brown text-lg">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          {/* Datos del cliente */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-chapa-brown mb-1">👤 Tu nombre</label>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => updateForm('customerName', e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-chapa-yellow focus:outline-none transition-colors text-chapa-brown placeholder:text-gray-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-chapa-brown mb-1">📱 WhatsApp / Teléfono</label>
              <input
                type="tel"
                value={form.customerPhone}
                onChange={(e) => updateForm('customerPhone', e.target.value)}
                placeholder="Ej: 1122334455"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-chapa-yellow focus:outline-none transition-colors text-chapa-brown placeholder:text-gray-300"
                required
              />
            </div>
          </div>

          {/* Tipo de entrega */}
          <div>
            <label className="block text-sm font-semibold text-chapa-brown mb-2">🚗 Tipo de entrega</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateForm('deliveryType', 'retiro')}
                className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all border-2 ${
                  form.deliveryType === 'retiro'
                    ? 'border-chapa-yellow bg-chapa-yellow/10 text-chapa-brown'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                🏪 Retiro en local
              </button>
              <button
                type="button"
                onClick={() => updateForm('deliveryType', 'envio')}
                className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all border-2 ${
                  form.deliveryType === 'envio'
                    ? 'border-chapa-yellow bg-chapa-yellow/10 text-chapa-brown'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                🛵 Envío a domicilio
              </button>
            </div>
            {form.deliveryType === 'envio' && (
              <input
                type="text"
                value={form.address}
                onChange={(e) => updateForm('address', e.target.value)}
                placeholder="Calle y altura, piso/depto"
                className="w-full mt-2 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-chapa-yellow focus:outline-none transition-colors text-chapa-brown placeholder:text-gray-300"
              />
            )}
          </div>

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-semibold text-chapa-brown mb-2">💳 Método de pago</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateForm('paymentMethod', 'efectivo')}
                className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all border-2 ${
                  form.paymentMethod === 'efectivo'
                    ? 'border-chapa-yellow bg-chapa-yellow/10 text-chapa-brown'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                💵 Efectivo
              </button>
              <button
                type="button"
                onClick={() => updateForm('paymentMethod', 'transferencia')}
                className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all border-2 ${
                  form.paymentMethod === 'transferencia'
                    ? 'border-chapa-yellow bg-chapa-yellow/10 text-chapa-brown'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                📱 Transferencia
              </button>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-semibold text-chapa-brown mb-1">📝 Notas / Aclaraciones</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateForm('notes', e.target.value)}
              placeholder='Ej: "Sin pickles", "Extra cheddar", etc.'
              rows={2}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-chapa-yellow focus:outline-none transition-colors text-chapa-brown placeholder:text-gray-300 resize-none"
            />
          </div>

          {/* Botón enviar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-chapa-yellow text-chapa-brown py-4 rounded-2xl font-bold text-lg hover:bg-chapa-yellow/90 transition-all active:scale-[0.98] shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-chapa-brown/30 border-t-chapa-brown rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>Enviar Pedido por WhatsApp 🚀</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
