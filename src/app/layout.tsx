import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { Toaster } from 'react-hot-toast';
import Footer from './components/Footer'
import { Providers } from './providers'
import { Suspense } from 'react'
import Loading from './loading'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Values Prioritization",
  description: "Prioritize your personal values",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const footerProps = {
    newsletter: {
      title: 'Join 7minute.ai',
      subtitle: 'Get weekly insights on AI and productivity tools.',
      placeholder: 'Enter your email address'
    },
    quickLinks: {
      title: 'Quick Links',
      links: [
        { text: 'Home', href: 'https://7minute.ai' },
        { text: 'Products', href: 'https://7minute.ai/products' },
        { text: 'Training', href: 'https://7minute.ai/introduction-to-chatgpt-workshop' },
        { text: 'About Us', href: 'https://7minute.ai/about-us' },
        { text: 'Contact Us', href: 'https://7minute.ai/contact-us' },
        { text: 'Guides', href: '/guides' },
      ]
    },
    contact: {
      title: 'Contact Us',
      address: '250 Ledgerwood Rd #4',
      city: 'Hot Springs, AR 71913',
      phone: '870-275-7674',
      email: 'support@7minute.ai'
    },
    social: {
      title: 'Connect With Us',
      links: [
        { platform: 'facebook' as const, href: 'https://facebook.com/7minute.ai' },
        { platform: 'twitter' as const, href: 'https://twitter.com/7minute.ai' },
        { platform: 'instagram' as const, href: 'https://instagram.com/7minute.ai' },
        { platform: 'linkedin' as const, href: 'https://linkedin.com/company/7minute.ai' },
        { platform: 'youtube' as const, href: 'https://www.youtube.com/channel/UCAAGcbWAFNdB9sOTscoNpsQ' }
      ]
    },
    copyright: '© 2024 7minute.ai. All rights reserved.',
    bottomLinks: [
      { text: 'Privacy Policy', href: 'https://7minute.ai/privacy' },
      { text: 'Terms of Use', href: 'https://7minute.ai/terms' },
      { text: 'Cookie Policy', href: 'https://7minute.ai/cookies' }
    ]
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <Providers>
            {children}
            <Footer {...footerProps} />
            <Toaster position="bottom-right" />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
