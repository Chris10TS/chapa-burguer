/**
 * Genera el mensaje formateado para WhatsApp con el resumen del pedido
 */
export function buildWhatsAppMessage(order) {
  const itemsList = order.items
    .map((item) => `  • ${item.quantity}x ${item.name} - $${(item.price * item.quantity).toLocaleString('es-AR')}`)
    .join('\n');

  const deliveryInfo = order.deliveryType === 'envio'
    ? `🛵 *Envío a domicilio*\n📍 Dirección: ${order.address}`
    : '🏪 *Retiro en el local*';

  const paymentInfo = order.paymentMethod === 'efectivo'
    ? '💵 Efectivo'
    : '📱 Transferencia / Alias';

  const message = `🍔 *NUEVO PEDIDO - CHAPA BURGUER* 🍔

👤 *Cliente:* ${order.customerName}
📞 *Teléfono:* ${order.customerPhone}

📋 *Pedido:*
${itemsList}

💰 *Total: $${order.total.toLocaleString('es-AR')}*

${deliveryInfo}

💳 *Pago:* ${paymentInfo}
${order.notes ? `\n📝 *Notas:* ${order.notes}` : ''}

¡Gracias por elegir Chapa Burguer! 🔥`;

  return message;
}

/**
 * Abre WhatsApp con el mensaje prearmado
 */
export function openWhatsApp(phoneNumber, message) {
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(url, '_blank');
}

/**
 * Abre chat de WhatsApp con un cliente específico
 */
export function openWhatsAppChat(customerPhone) {
  const cleanPhone = customerPhone.replace(/[^\d]/g, '');
  const phone = cleanPhone.startsWith('54') ? cleanPhone : `54${cleanPhone}`;
  window.open(`https://wa.me/${phone}`, '_blank');
}
