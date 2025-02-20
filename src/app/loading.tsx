import { Suspense } from 'react'

export default function Loading() {
  return (
    <Suspense>
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="space-y-4 text-center">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin"></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    </Suspense>
  )
} 