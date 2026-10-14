'use client';

import { useState } from 'react';

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError('Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-chapa-brown to-chapa-brown-light flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-float p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full border-4 border-chapa-yellow overflow-hidden mx-auto mb-4">
            <img src="/logo-chapa.jpg" alt="CHAPA BURGUER" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-chapa-brown">CHAPA BURGUER</h1>
          <p className="text-chapa-brown/50 text-sm mt-1">Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-chapa-brown mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@chapaburguer.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-chapa-yellow focus:outline-none transition-colors text-chapa-brown"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-chapa-brown mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-chapa-yellow focus:outline-none transition-colors text-chapa-brown"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-chapa-yellow text-chapa-brown py-3.5 rounded-xl font-bold text-lg hover:bg-chapa-yellow/90 transition-all active:scale-[0.98] shadow-md disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-chapa-brown/30 text-xs mt-6">
          Acceso exclusivo para administradores
        </p>
      </div>
    </div>
  );
}
