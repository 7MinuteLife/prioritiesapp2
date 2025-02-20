'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Navigation from '@/app/components/Navigation'

export default function HomePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex flex-col">
      <Navigation />
      
      {/* Hero Section - balanced spacing */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12 max-w-7xl mx-auto">
            {/* Left Column - improved spacing */}
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl font-bold text-gray-900">
                  Values-based priority guides
                </h1>
                <h2 className="text-2xl text-gray-600">
                  Your personal tool for discovering, aligning, and living according to your core values and priorities.
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Feature
                  icon="○"
                  title="Tailored Value Discovery"
                  description="Follow structured processes to identify and prioritize what truly matters to you."
                />
                <Feature
                  icon="⬡"
                  title="Priority Alignment"
                  description="Break down your values into actionable priorities and daily choices."
                />
                <Feature
                  icon="⬢"
                  title="Progress Tracking"
                  description="Monitor how well your actions align with your stated values and priorities."
                />
                <Feature
                  icon="◈"
                  title="Value-Based Decisions"
                  description="Make choices that reflect your authentic priorities and life goals."
                />
              </div>

              <div className="space-x-4 pt-2">
                {!loading && (
                  <>
                    {user ? (
                      <>
                        <Link
                          href="/values"
                          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700"
                        >
                          Create New List
                        </Link>
                        <Link
                          href="/my-lists"
                          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                          View My Lists →
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/signup"
                          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700"
                        >
                          Get Started Free
                        </Link>
                        <Link
                          href="/guides"
                          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                          View Guides →
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right Column - constrained image */}
            <div className="relative flex items-center">
              <div className="w-full overflow-hidden rounded-lg shadow-xl">
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
      </main>
    </div>
  )
}

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start space-x-4 p-4">
      <span className="text-gray-700 text-xl font-light">{icon}</span>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>
    </div>
  )
}
