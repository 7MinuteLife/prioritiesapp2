'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserPriorityLists, deleteUserList } from '@/lib/firebase/firebaseUtils';
import { useRouter } from 'next/navigation';
import { TrashIcon, PencilIcon, ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Header from '@/app/components/Header';
import { generateValuesPDF } from '@/lib/utils/pdfGenerator';

interface SavedList {
  id: string;
  listName: string;
  values: any;
  createdAt: string;
  updatedAt: string;
}

export default function SavedLists() {
  const [lists, setLists] = useState<SavedList[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadSavedLists();
  }, [user]);

  const loadSavedLists = async () => {
    if (user?.uid) {
      const savedLists = await getUserPriorityLists(user.uid);
      setLists(savedLists);
    }
  };

  const handleDelete = async (listId: string) => {
    if (confirm('Are you sure you want to delete this list?')) {
      await deleteUserList(user!.uid, listId);
      toast.success('List deleted');
      loadSavedLists();
    }
  };

  const handleEdit = (listId: string) => {
    router.push(`/?listId=${listId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header title="Saved Priority Lists" showActions={false} />
      
      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <div 
              key={list.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Make the preview area look like a vertical document/PDF */}
              <div 
                className="aspect-[1/1.4] bg-white p-4 sm:p-8 border-b flex items-center justify-center cursor-pointer 
                  hover:bg-gray-50 transition-colors relative"
                onClick={() => handleEdit(list.id)}
              >
                {/* Paper-like container */}
                <div className="w-full h-full bg-white shadow-md rounded-sm p-3 sm:p-6 flex flex-col">
                  {/* Title area */}
                  <div className="text-center mb-2 sm:mb-4 pb-2 sm:pb-4 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">{list.listName}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {new Date(list.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Values list - adjust gap for mobile */}
                  <div className="flex-1 flex flex-col gap-1 sm:gap-2">
                    {list.values?.column4?.values?.slice(0, 10).map((value: any, index: number) => (
                      <div 
                        key={value.id}
                        className="bg-[#18181B] text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs flex items-center gap-1 sm:gap-2"
                      >
                        <span className="w-4 sm:w-5 text-xs opacity-50 font-medium">
                          {(index + 1).toString().padStart(2, '0')}.
                        </span>
                        <span className="font-medium truncate text-xs">{value.content}</span>
                      </div>
                    ))}
                    {/* Adjust placeholder styles for mobile */}
                    {Array.from({ length: Math.max(0, 10 - (list.values?.column4?.values?.length || 0)) }).map((_, index) => (
                      <div 
                        key={`empty-${index}`}
                        className="border border-dashed border-gray-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs flex items-center gap-1 sm:gap-2 text-gray-400"
                      >
                        <span className="w-4 sm:w-5 text-xs opacity-50 font-medium">
                          {(index + (list.values?.column4?.values?.length || 0) + 1).toString().padStart(2, '0')}.
                        </span>
                        <span className="font-medium text-xs">Empty slot</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Page curl effect (optional) */}
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-transparent via-gray-100 to-gray-200 
                  rounded-tl-lg shadow-[-2px_-2px_3px_rgba(0,0,0,0.05)]"></div>
              </div>

              {/* List info and actions */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{list.listName}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        generateValuesPDF(list.values.column4.values.map((v: any) => v.content));
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full"
                      title="Download PDF"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Store the list to print in local storage
                        localStorage.setItem('print-list', JSON.stringify(list.values));
                        window.open('/print', '_blank');
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full"
                      title="Print"
                    >
                      <PrinterIcon className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(list.id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full"
                      title="Edit list"
                    >
                      <PencilIcon className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(list.id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full"
                      title="Delete list"
                    >
                      <TrashIcon className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Updated {new Date(list.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}

          {/* Add new list card */}
          <button
            onClick={() => router.push('/')}
            className="border-2 border-dashed border-gray-300 rounded-lg h-full min-h-[280px]
              flex flex-col items-center justify-center gap-2 text-gray-500
              hover:border-gray-400 hover:text-gray-600 transition-colors"
          >
            <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center">
              <span className="text-2xl">+</span>
            </div>
            <span className="font-medium">Create New List</span>
          </button>
        </div>
      </div>
    </div>
  );
} 