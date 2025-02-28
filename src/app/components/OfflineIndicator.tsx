'use client';

import { useEffect, useState } from 'react';
import { WifiIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import useOfflineSync from '@/lib/hooks/useOfflineSync';

interface OfflineIndicatorProps {
  className?: string;
}

export default function OfflineIndicator({ className = '' }: OfflineIndicatorProps) {
  const { isOffline, isSyncing, hasPendingUpdates, forceSync } = useOfflineSync();
  const [isVisible, setIsVisible] = useState(false);

  // Only show the indicator if offline or has pending updates
  useEffect(() => {
    setIsVisible(isOffline || hasPendingUpdates);
  }, [isOffline, hasPendingUpdates]);

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg text-sm font-medium ${
        isOffline 
          ? 'bg-amber-50 text-amber-800 border border-amber-200' 
          : hasPendingUpdates 
            ? 'bg-blue-50 text-blue-800 border border-blue-200'
            : 'bg-white text-gray-800 border border-gray-200'
      }`}>
        {isOffline ? (
          <>
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
            <span>You're offline. Changes will be saved locally.</span>
          </>
        ) : hasPendingUpdates ? (
          <>
            <WifiIcon className="w-5 h-5 text-blue-500" />
            <span>You have pending changes to sync</span>
            <button
              onClick={forceSync}
              disabled={isSyncing}
              className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                isSyncing 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {isSyncing ? (
                <span className="flex items-center">
                  <ArrowPathIcon className="w-3 h-3 mr-1 animate-spin" />
                  Syncing...
                </span>
              ) : (
                'Sync Now'
              )}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
} 