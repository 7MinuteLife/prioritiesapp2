'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/app/components/Navigation'
import ValuesPrioritization from '@/app/components/ValuesPrioritization'
import { getUserValues } from '@/lib/firebase/firebaseUtils'

export default function EditValuesPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [values, setValues] = useState<any>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    async function fetchValues() {
      if (user && params.id) {
        try {
          const data = await getUserValues(user.uid, params.id)
          if (data) {
            setValues(data)
          } else {
            router.push('/my-lists')
          }
        } catch (error) {
          console.error('Error fetching values:', error)
          router.push('/my-lists')
        } finally {
          setIsLoading(false)
        }
      }
    }
    fetchValues()
  }, [user, params.id, router])

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin mx-auto"></div>
          <p className="text-gray-500">Loading your values...</p>
        </div>
      </div>
    )
  }

  if (!user || !values) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <ValuesPrioritization initialValues={values} listId={params.id} />
    </div>
  )
} 