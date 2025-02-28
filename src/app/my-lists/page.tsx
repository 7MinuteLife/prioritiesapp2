'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { getUserPriorityListsApi } from '@/lib/api/firebaseApi'
import { useRouter } from 'next/navigation'
import { ArrowDownTrayIcon, PrinterIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { generateValuesPDF } from '@/lib/utils/pdfGenerator'
import { PriorityList } from '@/lib/types'
import { User } from 'firebase/auth'

export default function MyListsPage() {
  const [lists, setLists] = useState<PriorityList[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [firestoreAvailable, setFirestoreAvailable] = useState(true)
  const { user, loading } = useAuth()
  const router = useRouter()

  // Function to fetch lists
  const fetchLists = async () => {
    if (!user) return
    
    setIsLoading(true)
    
    try {
      console.log('Fetching lists for user:', user.uid)
      const userLists = await getUserPriorityListsApi(user.uid)
      console.log('Fetched lists:', userLists)
      
      // Check if any lists are local
      const hasLocalLists = userLists.some((list: any) => list.isLocal)
      if (hasLocalLists) {
        setFirestoreAvailable(false)
      }
      
      setLists(userLists)
    } catch (error) {
      console.error('Error fetching lists:', error)
      toast.error('Failed to load your lists')
      setFirestoreAvailable(false)
      setLists([]) // Set empty array to avoid infinite loading
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (!loading && user) {
      fetchLists()
    }
  }, [user, loading, router])

  const handleDelete = async (listId: string) => {
    if (!user) return
    if (!confirm('Are you sure you want to delete this list? This action cannot be undone.')) return

    try {
      // Check if it's a local list
      if (listId.startsWith('local-')) {
        // Delete from local storage
        const localLists = JSON.parse(localStorage.getItem('local_priority_lists') || '[]');
        const updatedLists = localLists.filter((list: any) => list.listId !== listId);
        localStorage.setItem('local_priority_lists', JSON.stringify(updatedLists));
        
        // Update state
        setLists(lists.filter(list => list.id !== listId));
        toast.success('List deleted successfully');
        return;
      }
      
      // Delete from Firestore
      const response = await fetch(`/api/firebase/delete-list?userId=${encodeURIComponent(user.uid)}&listId=${encodeURIComponent(listId)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete list');
      }
      
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
      await generateValuesPDF(list.values?.column4?.values || [], list.listName)
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to download PDF')
    }
  }

  // Function to handle printing a list
  const handlePrint = (list: PriorityList) => {
    try {
      // Store the current list in localStorage for the print page to access
      const printData = {
        listName: list.listName,
        values: list.values?.column4?.values || [],
        createdAt: list.createdAt
      }
      localStorage.setItem('printList', JSON.stringify(printData))
      
      // Open the print page in a new tab
      window.open('/print', '_blank')
    } catch (error) {
      console.error('Error preparing list for print:', error)
      toast.error('Failed to prepare list for printing')
    }
  }

  // Debug component for development only
  const DebugInfo = ({ user, loading, lists, isLoading, firestoreAvailable, fetchLists }: {
    user: User | null;
    loading: boolean;
    lists: PriorityList[];
    isLoading: boolean;
    firestoreAvailable: boolean;
    fetchLists: () => Promise<void>;
  }) => {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }, []);

    if (process.env.NODE_ENV !== 'development') {
      return null;
    }

    return (
      <div className="mt-8 p-4 border border-gray-300 rounded-md bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Debug Info</h3>
        <div className="space-y-1 text-sm">
          <p>User ID: {user?.uid || 'Not logged in'}</p>
          <p>Auth Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Firestore Available: {firestoreAvailable ? 'Yes' : 'No'}</p>
          <p>Lists Count: {lists.length}</p>
          <p>Lists Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p>Online Status: {isOnline ? 'Online' : 'Offline'}</p>
          <button 
            onClick={() => fetchLists()} 
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Lists
          </button>
        </div>
      </div>
    );
  };

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

          {/* Firestore Status Banner */}
          {!firestoreAvailable && (
            <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Firestore Connection Issue</h3>
                  <div className="mt-1 text-sm text-amber-700">
                    <p>
                      Your lists are currently being saved to local storage. To enable cloud storage and sync across devices:
                    </p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Ensure Firestore is enabled in your Firebase project</li>
                      <li>Check your internet connection</li>
                      <li>Your data will be automatically synced when connection is restored</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid of Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lists.map((list) => (
              <div 
                key={list.id}
                className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border ${list.isLocal ? 'border-amber-200' : 'border-gray-100'}`}
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
                        {list.isLocal && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                            Local
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Values preview */}
                    <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                      {list.values?.column4?.values && list.values.column4.values.length > 0 ? (
                        <>
                          {list.values.column4.values.slice(0, 5).map((value, index) => (
                            <div 
                              key={value.id || index}
                              className="bg-gray-900 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-2 min-h-[32px]"
                            >
                              <span className="w-6 text-xs opacity-50 font-medium shrink-0">
                                {(index + 1).toString().padStart(2, '0')}.
                              </span>
                              <span className="font-medium truncate flex-1">{value.content}</span>
                            </div>
                          ))}
                          {list.values.column4.values.length > 5 && (
                            <div className="text-center text-xs text-gray-500 mt-1">
                              +{list.values.column4.values.length - 5} more values
                            </div>
                          )}
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
      <DebugInfo 
        user={user}
        loading={loading}
        lists={lists}
        isLoading={isLoading}
        firestoreAvailable={firestoreAvailable}
        fetchLists={fetchLists}
      />
    </div>
  )
} 