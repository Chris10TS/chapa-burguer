/**
 * Verifica si el local está abierto según los horarios configurados
 */
export function isStoreOpen() {
  const now = new Date();
  const currentHour = now.getHours();
  const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const currentDay = days[now.getDay()];
  
  const openDays = (process.env.NEXT_PUBLIC_OPEN_DAYS || 'martes,miercoles,jueves,viernes,sabado,domingo')
    .split(',')
    .map(d => d.trim().toLowerCase());
  
  const openHour = parseInt(process.env.NEXT_PUBLIC_OPEN_HOUR || '19');
  const closeHour = parseInt(process.env.NEXT_PUBLIC_CLOSE_HOUR || '24');
  
  const isOpenDay = openDays.includes(currentDay);
  
  // Manejar horarios que cruzan medianoche
  let isOpenHour;
  if (closeHour > openHour) {
    isOpenHour = currentHour >= openHour && currentHour < closeHour;
  } else {
    // Cruza medianoche (ej: 19 a 2)
    isOpenHour = currentHour >= openHour || currentHour < closeHour;
  }
  
  return isOpenDay && isOpenHour;
}

/**
 * Formatea precio en formato argentino
 */
export function formatPrice(price) {
  return `$${price.toLocaleString('es-AR')}`;
}

/**
 * Formatea fecha
 */
export function formatDate(date) {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Obtiene el texto legible del horario
 */
export function getScheduleText() {
  const openHour = process.env.NEXT_PUBLIC_OPEN_HOUR || '19';
  const closeHour = process.env.NEXT_PUBLIC_CLOSE_HOUR || '24';
  const closeDisplay = closeHour === '24' ? '00' : closeHour;
  return `${openHour}:00 a ${closeDisplay}:00 hs`;
}

/**
 * Genera un ID corto para pedidos
 */
export function generateOrderId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `CB-${timestamp}${random}`.toUpperCase();
}
