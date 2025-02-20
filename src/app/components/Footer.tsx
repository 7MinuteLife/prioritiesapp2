'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface FooterProps {
  newsletter?: {
    title?: string
    subtitle?: string
    placeholder?: string
  }
  quickLinks?: {
    title: string
    links: Array<{
      text: string
      href: string
    }>
  }
  contact?: {
    title: string
    address: string
    city: string
    phone: string
    email: string
  }
  social?: {
    title: string
    links: Array<{
      platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube'
      href: string
    }>
  }
  copyright?: string
  bottomLinks?: Array<{
    text: string
    href: string
  }>
}

export default function Footer({
  newsletter = {
    title: 'Stay Connected',
    subtitle: 'Join our newsletter for the latest updates and exclusive offers.',
    placeholder: 'Enter your email'
  },
  quickLinks = {
    title: 'Quick Links',
    links: [
      { text: 'Home', href: '/' },
      { text: 'About Us', href: '/about' },
      { text: 'Services', href: '/services' },
      { text: 'Products', href: '/products' },
      { text: 'Contact', href: '/contact' }
    ]
  },
  contact = {
    title: 'Contact Us',
    address: '123 Innovation Street',
    city: 'Tech City, TC 12345',
    phone: '(123) 456-7890',
    email: 'hello@example.com'
  },
  social = {
    title: 'Follow Us',
    links: [
      { platform: 'facebook', href: '#' },
      { platform: 'twitter', href: '#' },
      { platform: 'instagram', href: '#' },
      { platform: 'linkedin', href: '#' }
    ]
  },
  copyright = '© 2024 Your Company. All rights reserved.',
  bottomLinks = [
    { text: 'Privacy Policy', href: '/privacy' },
    { text: 'Terms of Service', href: '/terms' },
    { text: 'Cookie Settings', href: '/cookies' }
  ]
}: FooterProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const renderThemeChanger = () => {
    return (
      <div className="mt-6 flex items-center space-x-2">
        <span className="text-gray-600 dark:text-gray-400">
          {theme === 'dark' ? '🌙' : '☀️'}
        </span>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-full bg-gray-200 p-2 dark:bg-gray-700"
        >
          <div className="h-6 w-12 rounded-full bg-gray-300 p-1 dark:bg-gray-600">
            <div
              className={`h-4 w-4 transform rounded-full bg-white transition-transform ${
                theme === 'dark' ? 'translate-x-6' : ''
              }`}
            />
          </div>
        </button>
      </div>
    )
  }

  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Newsletter Section */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {newsletter.title}
            </h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              {newsletter.subtitle}
            </p>
            <form className="mt-4 flex max-w-md">
              <input
                type="email"
                placeholder={newsletter.placeholder}
                className="w-full rounded-l-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              <button
                type="submit"
                className="rounded-r-lg bg-black px-4 py-2 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                <span className="sr-only">Submit</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {quickLinks.title}
            </h3>
            <ul className="mt-4 space-y-2">
              {quickLinks.links.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {contact.title}
            </h3>
            <div className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
              <p>{contact.address}</p>
              <p>{contact.city}</p>
              <p>Phone: {contact.phone}</p>
              <p>Email: {contact.email}</p>
            </div>
          </div>

          {/* Social Links & Theme Toggle */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {social.title}
            </h3>
            <div className="mt-4 flex space-x-4">
              {social.links.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <span className="sr-only">{link.platform}</span>
                  <SocialIcon platform={link.platform} />
                </Link>
              ))}
            </div>
            {renderThemeChanger()}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {copyright}
            </p>
            <div className="flex space-x-6">
              {bottomLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {link.text}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

const SocialIcon = ({ platform }: { platform: string }) => {
  const iconClasses = 'h-6 w-6'
  
  switch (platform) {
    case 'facebook':
      return (
        <svg className={iconClasses} fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
        </svg>
      )
    case 'twitter':
      return (
        <svg className={iconClasses} fill="currentColor" viewBox="0 0 24 24">
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg className={iconClasses} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg className={iconClasses} fill="currentColor" viewBox="0 0 24 24">
          <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
        </svg>
      )
    case 'youtube':
      return (
        <svg className={iconClasses} fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    default:
      return null
  }
} 