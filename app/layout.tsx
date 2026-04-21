import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { Toaster } from 'sonner';
import { AppProviders } from './providers';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Brego Business',
    template: '%s · Brego Business',
  },
  description:
    'Brego Business — AI-powered marketing and finance reporting, diagnostics, and workspace for growing brands.',
  applicationName: 'Brego Business',
  referrer: 'strict-origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    siteName: 'Brego Business',
    title: 'Brego Business',
    description: 'AI-powered marketing and finance reporting for growing brands.',
  },
};

export const viewport: Viewport = {
  themeColor: '#204CC7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="font-sans antialiased bg-white text-gray-900">
        <AppProviders>
          {children}
        </AppProviders>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: { fontFamily: 'var(--font-manrope), system-ui, sans-serif' },
          }}
        />
      </body>
    </html>
  );
}
