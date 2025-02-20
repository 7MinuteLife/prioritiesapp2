'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'

export default function Navigation() {
  const { user, loading, signOut } = useAuth()

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-gray-900 hover:text-gray-600">
              <span className="text-xl font-semibold">7minute.ai</span>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link 
              href="/guides" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Guides
            </Link>
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link 
                      href="/values" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Create Values
                    </Link>
                    <Link 
                      href="/values-chat" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Chat with Values
                    </Link>
                    <Link 
                      href="/my-lists" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      My Lists
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md text-sm font-medium border border-gray-200 hover:border-gray-300"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium shadow-sm"
                    >
                      Get Started Free
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 