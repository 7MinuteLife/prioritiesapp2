'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { getUserPriorityLists, deleteUserList } from '@/lib/firebase/firebaseUtils'
import { useRouter } from 'next/navigation'
import { ArrowDownTrayIcon, PrinterIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import Navigation from '@/app/components/Navigation'
import { generateValuesPDF } from '@/lib/utils/pdfGenerator'

interface PriorityList {
  id: string
  listName: string
  values: {
    column4: {
      values: Array<{
        content: string
        id: string
        isHighlighted: boolean
      }>
    }
  }
  createdAt: string
  updatedAt: string
}

export default function MyListsPage() {
  const [lists, setLists] = useState<PriorityList[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    async function fetchLists() {
      if (!user) return
      
      try {
        const userLists = await getUserPriorityLists(user.uid)
        setLists(userLists)
      } catch (error) {
        console.error('Error fetching lists:', error)
        toast.error('Failed to load your lists')
      } finally {
        setIsLoading(false)
      }
    }

    if (!loading) {
      fetchLists()
    }
  }, [user, loading, router])

  const handleDelete = async (listId: string) => {
    if (!user) return
    if (!confirm('Are you sure you want to delete this list? This action cannot be undone.')) return

    try {
      await deleteUserList(user.uid, listId)
      setLists(lists.filter(list => list.id !== listId))
      toast.success('List deleted successfully')
    } catch (error) {
      console.error('Error deleting list:', error)
      toast.error('Failed to delete list')
    }
  }

  const handleEdit = (listId: string) => {
    router.push(`/values/${listId}`)
  }

  const handleCreateNew = () => {
    router.push('/values')
  }

  const handleDownload = async (list: PriorityList) => {
    try {
      await generateValuesPDF(list.values.column4.values)
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to download PDF')
    }
  }

  const handlePrint = (list: PriorityList) => {
    localStorage.setItem('print-list', JSON.stringify(list.values))
    window.open('/print', '_blank')
  }

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F3]">
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin mx-auto"></div>
          <p className="text-gray-500">Loading your lists...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Lists</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and organize your priority lists
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Create New List
            </button>
          </div>

          {/* Grid of Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lists.map((list) => (
              <div 
                key={list.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
              >
                {/* Preview Area */}
                <div 
                  onClick={() => handleEdit(list.id)}
                  className="aspect-[1/1.4] p-6 cursor-pointer hover:bg-gray-50 transition-colors border-b relative"
                >
                  {/* Paper-like container */}
                  <div className="w-full h-full bg-white shadow-sm rounded-lg border border-gray-100 p-4 flex flex-col">
                    {/* Title area */}
                    <div className="text-center mb-6 pb-3 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900 truncate px-4">{list.listName}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(list.updatedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Values preview */}
                    <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                      {list.values?.column4?.values?.length > 0 ? (
                        <>
                          {list.values.column4.values.map((value, index) => (
                            <div 
                              key={value.id}
                              className="bg-gray-900 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-2 min-h-[32px]"
                            >
                              <span className="w-6 text-xs opacity-50 font-medium shrink-0">
                                {(index + 1).toString().padStart(2, '0')}.
                              </span>
                              <span className="font-medium truncate flex-1">{value.content}</span>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                          No values added yet
                        </div>
                      )}
                    </div>

                    {/* Page curl effect */}
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-transparent via-gray-100 to-gray-200 rounded-tl-lg opacity-50"></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 py-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 pr-4">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{list.listName}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Updated {new Date(list.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(list)
                        }}
                        className="p-1.5 hover:bg-white rounded-full transition-colors"
                        title="Download PDF"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePrint(list)
                        }}
                        className="p-1.5 hover:bg-white rounded-full transition-colors"
                        title="Print"
                      >
                        <PrinterIcon className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(list.id)
                        }}
                        className="p-1.5 hover:bg-white rounded-full transition-colors"
                        title="Edit list"
                      >
                        <PencilIcon className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(list.id)
                        }}
                        className="p-1.5 hover:bg-white rounded-full transition-colors"
                        title="Delete list"
                      >
                        <TrashIcon className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Create New List Card */}
            <button
              onClick={handleCreateNew}
              className="border-2 border-dashed border-gray-300 rounded-xl aspect-[1/1.4]
                flex flex-col items-center justify-center gap-3 text-gray-500 bg-white
                hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
            >
              <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center">
                <PlusIcon className="w-6 h-6" />
              </div>
              <span className="font-medium">Create New List</span>
            </button>
          </div>

          {/* Empty State */}
          {lists.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <PlusIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No lists yet</h3>
              <p className="text-gray-500 mb-4">Create your first priority list to get started</p>
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Create New List
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 