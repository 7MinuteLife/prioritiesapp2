'use client'

import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import ValuesPrioritization from '@/app/components/ValuesPrioritization'

export default function ValuesPage() {
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
    <div className="min-h-screen bg-gray-50">
      <ValuesPrioritization />
    </div>
  )
} 