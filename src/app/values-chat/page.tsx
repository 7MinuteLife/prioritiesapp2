'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ValuesChatInterface from '@/app/components/ValuesChatInterface';
import { saveUserValues, getUserPriorityLists } from '@/lib/firebase/firebaseUtils';
import clsx from 'clsx';

interface Value {
  id: number;
  name: string;
}

export default function ValuesChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [values, setValues] = useState<Value[]>([
    { id: 1, name: 'Friendships' },
    { id: 2, name: 'Fun' },
    { id: 3, name: 'Security' },
    { id: 4, name: 'Generosity' },
    { id: 5, name: 'Compassion' },
    { id: 6, name: 'Financial Freedom' },
    { id: 7, name: 'Integrity' },
    { id: 8, name: 'Kindness' },
    { id: 9, name: 'Mental Health' },
    { id: 10, name: 'Gratitude' },
  ]);

  // Handle authentication redirect
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    const loadValues = async () => {
      if (!user) return;
      
      const lists = await getUserPriorityLists(user.uid);
      if (lists.length > 0) {
        const latestList = lists.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0];

        if (latestList.values?.column4?.values) {
          const loadedValues = latestList.values.column4.values.map((v, index) => ({
            id: index + 1,
            name: v.content,
          }));
          setValues(loadedValues);
        }
      }
    };

    loadValues();
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-80 bg-gray-100 overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">{user.displayName || 'Your Values'}</h2>
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
          </div>
          <div className="space-y-3">
            {values.map((value) => (
              <button
                key={value.id}
                onClick={() => setSelectedValue(value.name)}
                className={clsx(
                  'w-full bg-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md',
                  selectedValue === value.name ? 'ring-2 ring-blue-500' : ''
                )}
              >
                <div className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm font-medium">
                      {value.id < 10 ? `0${value.id}` : value.id}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{value.name}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {!selectedValue ? (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center max-w-xl px-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Chat with Your Values
              </h1>
              <p className="text-gray-600 mb-8">
                Select a value from the sidebar to start exploring its significance in your life
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Reflect</h3>
                  <p className="text-sm text-gray-600">Explore how your values shape your decisions and actions</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Align</h3>
                  <p className="text-sm text-gray-600">Learn to better align your life with your core values</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ValuesChatInterface selectedValue={selectedValue} />
        )}
      </div>
    </div>
  );
} 