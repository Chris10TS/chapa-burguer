import './globals.css';

export const metadata = {
  title: 'CHAPA BURGUER - Sabor que une',
  description: 'La mejor hamburguesa artesanal de tu barrio. Pedí online y recibí en tu casa o retirá en el local.',
  keywords: 'hamburguesas, delivery, artesanal, chapa burguer',
  openGraph: {
    title: 'CHAPA BURGUER - Sabor que une',
    description: 'La mejor hamburguesa artesanal de tu barrio.',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#F5A623',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="font-fredoka antialiased">
        {children}
      </body>
    </html>
  );
}
