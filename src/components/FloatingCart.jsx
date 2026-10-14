'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function FloatingCart({ onCheckout }) {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const [expanded, setExpanded] = useState(false);

  if (totalItems === 0) return null;

  return (
    <>
      {/* Backdrop */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/40 z-40 animate-fade-in"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Cart panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Expanded cart items */}
        {expanded && (
          <div className="bg-white rounded-t-3xl shadow-float max-h-[60vh] overflow-y-auto animate-slide-up">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-chapa-brown">Tu Pedido</h3>
                <button
                  onClick={clearCart}
                  className="text-red-400 text-sm font-semibold hover:text-red-500"
                >
                  Vaciar
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-chapa-cream rounded-xl p-3">
                    <div className="flex-1">
                      <p className="font-semibold text-chapa-brown text-sm">{item.name}</p>
                      <p className="text-chapa-brown/60 text-sm">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-chapa-brown font-bold hover:bg-red-50 transition-colors"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-bold text-chapa-brown">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-chapa-brown font-bold hover:bg-green-50 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-bold text-chapa-brown text-sm w-20 text-right">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom bar */}
        <div className="bg-chapa-brown px-4 py-3 shadow-float">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex-1 flex items-center gap-3 text-white"
            >
              <span className="bg-chapa-yellow text-chapa-brown w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                {totalItems}
              </span>
              <span className="font-semibold text-sm">
                {expanded ? 'Ocultar pedido' : 'Ver pedido'}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>

            <span className="text-white font-bold text-lg">
              {formatPrice(totalPrice)}
            </span>

            <button
              onClick={() => {
                setExpanded(false);
                onCheckout();
              }}
              className="bg-chapa-yellow text-chapa-brown px-5 py-2.5 rounded-full font-bold text-sm hover:bg-chapa-yellow/90 transition-all active:scale-95 shadow-md"
            >
              Pedir 🚀
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
