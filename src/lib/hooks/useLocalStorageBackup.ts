'use client';

import { useState, useEffect } from 'react';

// Constants
const DEFAULT_BACKUP_EXPIRY_HOURS = 24;

interface UseLocalStorageBackupOptions {
  key: string;
  expiryHours?: number;
}

/**
 * Custom hook for managing local storage backups with expiration
 */
export function useLocalStorageBackup<T>(
  initialData: T,
  options: UseLocalStorageBackupOptions
): [T, (data: T) => void, boolean] {
  const { key, expiryHours = DEFAULT_BACKUP_EXPIRY_HOURS } = options;
  const [data, setData] = useState<T>(initialData);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const backup = localStorage.getItem(key);
      if (backup) {
        const { data: savedData, timestamp } = JSON.parse(backup);
        
        // Only use backup if it's not expired
        const backupTime = new Date(timestamp);
        const now = new Date();
        const hoursSinceBackup = (now.getTime() - backupTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceBackup < expiryHours) {
          setData(savedData);
        }
      }
    } catch (error) {
      console.error(`Failed to load backup from localStorage for key ${key}:`, error);
    }
  }, [key, expiryHours]);

  // Save to local storage whenever data changes
  const updateData = (newData: T) => {
    setData(newData);
    try {
      localStorage.setItem(key, JSON.stringify({
        data: newData,
        timestamp: new Date().toISOString()
      }));
      setHasPendingChanges(true);
    } catch (error) {
      console.error(`Failed to save backup to localStorage for key ${key}:`, error);
    }
  };

  return [data, updateData, hasPendingChanges];
} 