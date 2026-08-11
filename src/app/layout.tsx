import type { Metadata, Viewport } from 'next';
import Navbar from '@/components/navbar';
import MobileBottomNav from '@/components/MobileBottomNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'telc B2 Beruf Exam Simulator',
  description: 'Interactive web-based and PWA exam simulator for German telc B2 Beruf certification',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'telc B2 Beruf',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0b0f19',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-sky-500 selection:text-white pb-16 md:pb-0" suppressHydrationWarning>
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
        <footer className="hidden md:block border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© 2026 telc B2 Beruf Exam Simulator — PWA & Mobile First Prepared</p>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Leseverstehen</span>
              <span>•</span>
              <span>Sprachbausteine</span>
              <span>•</span>
              <span>Hörverstehen</span>
            </div>
          </div>
        </footer>
        <MobileBottomNav />
      </body>
    </html>
  );
}
