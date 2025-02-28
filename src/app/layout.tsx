import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import Loading from './loading'
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { Providers } from '@/app/providers';
import Navigation from '@/app/components/Navigation';
import Footer from '@/app/components/Footer';
import OfflineIndicator from './components/OfflineIndicator';
import SyncManager from './components/SyncManager';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Priorities App',
  description: 'Prioritize your values and goals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const footerProps = {
    links: [
      { href: '/about', label: 'About' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
      { href: '/contact', label: 'Contact' },
    ],
    copyright: `© ${new Date().getFullYear()} Priorities App. All rights reserved.`,
  };

  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <AuthProvider>
          <Providers>
            <Suspense fallback={<Loading />}>
              <Navigation />
              <main className="flex-grow">
                {children}
              </main>
              <Footer links={footerProps.links} copyright={footerProps.copyright} />
              <Toaster position="bottom-right" />
              <OfflineIndicator />
              <SyncManager />
            </Suspense>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}
