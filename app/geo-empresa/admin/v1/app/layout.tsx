import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Geo Empresa TI',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
