'use client';

import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const handleAdd = () => {
    if (!product.available) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
    });
    toast.success(`${product.name} agregado`, {
      icon: '🍔',
      duration: 1500,
    });
  };

  return (
    <div className={`bg-white rounded-2xl shadow-card overflow-hidden transition-all duration-200 hover:shadow-card-hover ${
      !product.available ? 'opacity-60' : ''
    }`}>
      {/* Imagen */}
      <div className="relative h-44 sm:h-48 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {!product.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">
              AGOTADO
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-chapa-brown text-lg leading-tight">
          {product.name}
        </h3>
        <p className="text-chapa-brown/60 text-sm mt-1 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-chapa-brown">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAdd}
            disabled={!product.available}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 active:scale-95 ${
              product.available
                ? 'bg-chapa-yellow text-chapa-brown hover:bg-chapa-yellow/80 shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            + Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
