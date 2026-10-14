'use client';

import { useState } from 'react';
import OrdersPanel from './OrdersPanel';
import SalesMetrics from './SalesMetrics';
import ClientHistory from './ClientHistory';
import MenuControl from './MenuControl';

const tabs = [
  { id: 'pedidos', label: 'Pedidos', emoji: '📋' },
  { id: 'ventas', label: 'Ventas', emoji: '📊' },
  { id: 'clientes', label: 'Clientes', emoji: '👥' },
  { id: 'menu', label: 'Menú', emoji: '🍔' },
];

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('pedidos');

  return (
    <div className="min-h-screen bg-chapa-cream">
      {/* Barra superior */}
      <header className="bg-chapa-brown text-white px-4 py-3 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐻‍❄️</span>
            <div>
              <h1 className="font-bold text-sm sm:text-base">CHAPA BURGUER</h1>
              <p className="text-white/50 text-xs">Panel Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/60 text-xs hidden sm:block">{user.email}</span>
            <button
              onClick={onLogout}
              className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Navegación por pestañas */}
      <nav className="bg-white border-b border-gray-100 sticky top-[52px] z-40">
        <div className="max-w-6xl mx-auto flex overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[80px] py-3 px-4 text-center text-sm font-semibold transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-chapa-yellow text-chapa-brown bg-chapa-yellow/5'
                  : 'border-transparent text-chapa-brown/50 hover:text-chapa-brown/70'
              }`}
            >
              <span className="block text-lg">{tab.emoji}</span>
              <span className="block text-xs mt-0.5">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Contenido de la pestaña activa */}
      <main className="max-w-6xl mx-auto p-4">
        {activeTab === 'pedidos' && <OrdersPanel />}
        {activeTab === 'ventas' && <SalesMetrics />}
        {activeTab === 'clientes' && <ClientHistory />}
        {activeTab === 'menu' && <MenuControl />}
      </main>
    </div>
  );
}
