'use client'

import Link from 'next/link'

interface FooterProps {
  links?: Array<{
    href: string;
    label: string;
  }>;
  copyright?: string;
}

export default function Footer({
  links = [
    { href: '/about', label: 'About' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
    { href: '/contact', label: 'Contact' },
  ],
  copyright = `© ${new Date().getFullYear()} Priorities App. All rights reserved.`,
}: FooterProps) {
  return (
    <footer className="bg-white border-t">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 mb-4 md:mb-0">
            {copyright}
          </p>
          <div className="flex space-x-6">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
} 