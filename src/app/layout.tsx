import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Зун яг ална (Zunygalna) — Жижиг үйлдлээр зуны том өөрчлөлт',
  description:
    'Make it simple to see the effects of small actions on your lifestyle over time. Calculate daily calorie burn, balance movement vs food deficit, and race friends to June 15th.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
