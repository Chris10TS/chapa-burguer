'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { formatPrice } from '@/lib/utils';

export default function SalesMetrics() {
  const [metrics, setMetrics] = useState({
    todaySales: 0,
    todayOrders: 0,
    monthSales: 0,
    monthOrders: 0,
    avgTicket: 0,
    weeklyData: [],
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    try {
      const now = new Date();
      
      // Inicio del día
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      
      // Inicio del mes
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Hace 7 días
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);

      const ordersRef = collection(db, 'orders');
      
      // Pedidos del mes (incluye hoy y semana)
      const monthQuery = query(
        ordersRef,
        where('createdAt', '>=', Timestamp.fromDate(monthStart)),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(monthQuery);
      const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filtrar por completados para métricas de ventas
      const completedOrders = allOrders.filter(o => o.status === 'completado' || o.status === 'listo');
      
      // Ventas de hoy
      const todayOrders = completedOrders.filter(o => {
        const orderDate = o.createdAt?.toDate?.() || new Date(o.createdAt);
        return orderDate >= todayStart;
      });
      const todaySales = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      
      // Ventas del mes
      const monthSales = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      
      // Ticket promedio
      const avgTicket = todayOrders.length > 0 ? todaySales / todayOrders.length : 0;
      
      // Datos semanales para gráfico
      const weeklyData = [];
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now);
        day.setDate(day.getDate() - i);
        day.setHours(0, 0, 0, 0);
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const dayOrders = completedOrders.filter(o => {
          const orderDate = o.createdAt?.toDate?.() || new Date(o.createdAt);
          return orderDate >= day && orderDate < nextDay;
        });
        
        weeklyData.push({
          day: dayNames[day.getDay()],
          date: `${day.getDate()}/${day.getMonth() + 1}`,
          sales: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
          orders: dayOrders.length,
        });
      }
      
      // Top 3 productos
      const productCount = {};
      completedOrders.forEach(order => {
        order.items?.forEach(item => {
          if (!productCount[item.name]) {
            productCount[item.name] = { name: item.name, count: 0, revenue: 0 };
          }
          productCount[item.name].count += item.quantity;
          productCount[item.name].revenue += item.price * item.quantity;
        });
      });
      const topProducts = Object.values(productCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
      
      setMetrics({
        todaySales,
        todayOrders: todayOrders.length,
        monthSales,
        monthOrders: completedOrders.length,
        avgTicket,
        weeklyData,
        topProducts,
      });
    } catch (error) {
      console.error('Error cargando métricas:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-10 h-10 border-4 border-chapa-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const maxSale = Math.max(...metrics.weeklyData.map(d => d.sales), 1);

  return (
    <div className="space-y-4">
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Ventas Hoy"
          value={formatPrice(metrics.todaySales)}
          sub={`${metrics.todayOrders} pedidos`}
          emoji="💰"
          color="bg-green-50 border-green-200"
        />
        <MetricCard
          label="Ventas del Mes"
          value={formatPrice(metrics.monthSales)}
          sub={`${metrics.monthOrders} pedidos`}
          emoji="📈"
          color="bg-blue-50 border-blue-200"
        />
        <MetricCard
          label="Ticket Promedio"
          value={formatPrice(metrics.avgTicket)}
          sub="por pedido hoy"
          emoji="🎫"
          color="bg-purple-50 border-purple-200"
        />
        <MetricCard
          label="Pedidos Hoy"
          value={metrics.todayOrders.toString()}
          sub="pedidos recibidos"
          emoji="📋"
          color="bg-orange-50 border-orange-200"
        />
      </div>

      {/* Gráfico de ventas semanal (barras simples con CSS) */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <h3 className="font-bold text-chapa-brown mb-4">📊 Ventas últimos 7 días</h3>
        <div className="flex items-end justify-between gap-1 h-40">
          {metrics.weeklyData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-chapa-brown/50 font-semibold">
                {d.sales > 0 ? formatPrice(d.sales) : ''}
              </span>
              <div
                className="w-full bg-chapa-yellow/80 rounded-t-lg transition-all duration-500 min-h-[4px]"
                style={{ height: `${Math.max((d.sales / maxSale) * 100, 3)}%` }}
              />
              <div className="text-center">
                <p className="text-xs font-semibold text-chapa-brown">{d.day}</p>
                <p className="text-[10px] text-chapa-brown/40">{d.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 3 productos */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <h3 className="font-bold text-chapa-brown mb-3">🏆 Top Hamburguesas del Mes</h3>
        {metrics.topProducts.length === 0 ? (
          <p className="text-chapa-brown/40 text-sm text-center py-4">Sin datos aún</p>
        ) : (
          <div className="space-y-2">
            {metrics.topProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-3 bg-chapa-cream rounded-xl p-3">
                <span className="text-2xl">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-chapa-brown">{product.name}</p>
                  <p className="text-xs text-chapa-brown/50">{product.count} unidades vendidas</p>
                </div>
                <span className="font-bold text-sm text-chapa-brown">
                  {formatPrice(product.revenue)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, emoji, color }) {
  return (
    <div className={`rounded-2xl p-4 border ${color}`}>
      <span className="text-2xl">{emoji}</span>
      <p className="text-xs text-chapa-brown/60 mt-2 font-medium">{label}</p>
      <p className="font-bold text-lg text-chapa-brown mt-0.5">{value}</p>
      <p className="text-xs text-chapa-brown/40">{sub}</p>
    </div>
  );
}
