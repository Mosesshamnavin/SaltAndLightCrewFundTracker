import type { Metadata, Viewport } from 'next';
import { Inter, Caveat } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { TransactionProvider } from '@/context/TransactionContext';
import { SplashScreen } from '@/components/layout/SplashScreen';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-caveat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Salt and Light - Youth Income & Expense Management',
  description: 'A simple, transparent, cloud-based financial ledger for youth income and expenses in Indian Currency (INR ₹).',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable} ${inter.className}`}>
      <body className="bg-[#F8FAFC] text-slate-900 antialiased font-sans font-normal">
        <AuthProvider>
          <TransactionProvider>
            <SplashScreen />
            <Toaster richColors closeButton position="top-right" />
            {children}
          </TransactionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
