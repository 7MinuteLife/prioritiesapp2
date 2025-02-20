'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin mx-auto"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F5F5F3]">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="text-gray-900 hover:text-gray-600">
                <span className="text-xl font-semibold">7minute.ai</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/guides" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Guides
              </Link>
              <Link 
                href="/values" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                My Values
              </Link>
              <button
                onClick={() => router.push('/values')}
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left Column - Text */}
          <div className="flex flex-col justify-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-8">
              Values-based priority guides
            </h1>
            <h2 className="text-2xl text-gray-600 mb-12">
              Your personal tool for discovering, aligning, and living according to your core values and priorities.
            </h2>
            <div className="space-y-8">
              <Feature
                icon="🎯"
                title="Tailored Value Discovery"
                description="Follow structured processes to identify and prioritize what truly matters to you."
              />
              <Feature
                icon="⚡️"
                title="Priority Alignment"
                description="Break down your values into actionable priorities and daily choices."
              />
              <Feature
                icon="📊"
                title="Progress Tracking"
                description="Monitor how well your actions align with your stated values and priorities."
              />
              <Feature
                icon="🤝"
                title="Value-Based Decisions"
                description="Make choices that reflect your authentic priorities and life goals."
              />
            </div>
            <div className="mt-12 space-x-4">
              <Link
                href="/values"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700"
              >
                Start Prioritizing
              </Link>
              <Link
                href="/guides"
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                View Guides →
              </Link>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative">
            <div className="relative h-[600px] w-full overflow-hidden rounded-lg shadow-xl">
              <Image
                src="/images/priorities-dashboard.png"
                alt="7minute.ai Dashboard"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover rounded-lg shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start space-x-4">
      <span className="text-xl">{icon}</span>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-gray-600">{description}</p>
      </div>
    </div>
  )
} 