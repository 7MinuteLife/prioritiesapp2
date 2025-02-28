'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { generateValuesPDF } from '@/lib/utils/pdfGenerator';
import AIHelper from './AIHelper';
import Header from './Header';
import ValuesColumn from './ValuesColumn';
import SaveDialog from './SaveDialog';
import { useAuthCheck } from '@/lib/hooks/useAuthCheck';
import { useValuesDragDrop } from '@/lib/hooks/useValuesDragDrop';
import { useValuesSaveLoad } from '@/lib/hooks/useValuesSaveLoad';
import { useLocalStorageBackup } from '@/lib/hooks/useLocalStorageBackup';

// Initial values data
const PERSONAL_VALUES = [
  'Love', 'Integrity', 'Meditation', 'Kindness', 'Adventure',
  'Mental Health', 'Gratitude', 'Balance', 'Meaningful Work',
  'Stability', 'Freedom', 'Learning', 'Creativity', 'Excellence',
  'Being Present', 'Peace', 'Imagination', 'Family', 'Success'
];

const GROWTH_VALUES = [
  'Faith', 'Simplicity', 'Fun', 'Financial Freedom',
  'Laughter', 'Compassion', 'Generosity', 'Nature/Outdoors',
  'Curiosity', 'Order', 'Trust', 'Innovation',
  'Belonging', 'Making a Difference', 'Time',
  'Honesty', 'Nutrition', 'Growth', 'Connection'
];

const LIFE_VALUES = [
  'Friendships', 'Leadership', 'Security', 'Teamwork',
  'Community', 'Teaching', 'Giving', 'Resilience',
  'Travel', 'Relationships', 'Purpose', 'Achievement',
  'Self-Respect', 'Reach Full Potential', 'Health', 'Optimism',
  'Wisdom', 'Fitness', 'Energy'
];

// Create initial columns state
const createInitialColumns = () => ({
  column1: {
    id: 'column1',
    title: 'Personal Values',
    values: PERSONAL_VALUES.map((content, index) => ({ 
      id: `value-${index + 1}`, 
      content, 
      isHighlighted: false 
    })),
  },
  column2: {
    id: 'column2',
    title: 'Growth Values',
    values: GROWTH_VALUES.map((content, index) => ({ 
      id: `value-${index + 21}`, 
      content, 
      isHighlighted: false 
    })),
  },
  column3: {
    id: 'column3',
    title: 'Life Values',
    values: LIFE_VALUES.map((content, index) => ({ 
      id: `value-${index + 41}`, 
      content, 
      isHighlighted: false 
    })),
  },
  column4: {
    id: 'column4',
    title: 'Your Top 10 Priorities',
    values: [],
  },
});

// Local storage keys
const STORAGE_KEYS = {
  VALUES_BACKUP: 'values_backup'
};

export default function ValuesPrioritization() {
  // UI state
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [selectedList, setSelectedList] = useState<string>('');
  
  // Auth hook
  const { user, handleAuthAction } = useAuthCheck();
  const router = useRouter();
  
  // Drag and drop hook
  const { 
    columns, 
    setColumns, 
    onDragEnd, 
    handleValueClick 
  } = useValuesDragDrop(createInitialColumns());
  
  // Local storage backup hook
  const [
    backupData, 
    updateBackupData, 
    hasPendingChanges
  ] = useLocalStorageBackup(columns, {
    key: STORAGE_KEYS.VALUES_BACKUP,
    expiryHours: 24
  });
  
  // Save/load hook
  const { 
    isSaving,
    currentListName,
    setCurrentListName,
    savedLists,
    saveValuesAs,
    updateExistingList,
    loadList,
    loadSavedLists
  } = useValuesSaveLoad({
    userId: user?.uid || null,
    onSaveSuccess: () => {
      setShowSaveDialog(false);
      setHasPendingChanges(false);
    }
  });
  
  // Memoize selected values for AI helper
  const selectedValues = useMemo(() => {
    return columns.column4.values
      .filter(value => value.isHighlighted)
      .map(value => value.content);
  }, [columns.column4.values]);

  // Save to local storage as backup whenever columns change
  useEffect(() => {
    if (columns.column4.values.length > 0) {
      updateBackupData(columns);
    }
  }, [columns, updateBackupData]);

  // Load saved values when component mounts and user exists
  useEffect(() => {
    const loadSavedValues = async () => {
      if (!user?.uid) return;
      
      try {
        const params = new URLSearchParams(window.location.search);
        const listId = params.get('listId');
        
        if (listId) {
          await loadList(listId, columns, setColumns);
        }
      } catch (error) {
        console.error('Error loading saved values:', error);
        toast.error('Failed to load your saved values. Using local data instead.');
      }
    };

    loadSavedValues();
  }, [user?.uid, loadList, columns, setColumns]);

  // Load saved lists when user changes
  useEffect(() => {
    loadSavedLists();
  }, [user?.uid, loadSavedLists]);

  // Add a warning when leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasPendingChanges) {
        const message = 'You have unsaved changes. Are you sure you want to leave?';
        e.returnValue = message;
        return message;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasPendingChanges]);

  // Simplified save handler
  const handleSave = useCallback(() => {
    if (!user) {
      toast.error('Please sign in to save your values');
      return;
    }

    if (columns.column4.values.length === 0) {
      toast.error('Please add some priorities before saving');
      return;
    }

    // Show the save dialog
    setShowSaveDialog(true);
  }, [user, columns.column4.values.length]);

  // Handle save as
  const handleSaveAs = useCallback(async (name: string) => {
    await saveValuesAs(columns, name);
  }, [columns, saveValuesAs]);

  // Handle save existing
  const handleSaveExisting = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const listId = params.get('listId');
    
    if (listId) {
      await updateExistingList(columns, listId);
    } else {
      toast.error('No list ID found for update');
    }
  }, [columns, updateExistingList]);

  // Load list handler
  const handleLoadList = useCallback(async (listId: string) => {
    if (!listId) return;
    
    const success = await loadList(listId, columns, setColumns);
    if (success) {
      setSelectedList(listId);
    } else {
      setSelectedList('');
    }
  }, [loadList, columns, setColumns]);

  // Download handler
  const handleDownload = useCallback(async () => {
    const topValues = columns.column4.values.map(v => ({ content: v.content }));
    await generateValuesPDF(topValues);
  }, [columns.column4.values]);

  // Print handler
  const handlePrint = useCallback(() => {
    // Store only the column4 values for printing
    const valuesToPrint = columns.column4.values.map(v => ({
      id: v.id,
      content: v.content,
      isHighlighted: v.isHighlighted
    }));
    localStorage.setItem('print-list', JSON.stringify(valuesToPrint));
    window.open('/print', '_blank');
  }, [columns.column4.values]);

  // Save button component
  const SaveButton = useCallback(() => (
    <button
      onClick={handleSave}
      disabled={isSaving}
      className={`flex items-center gap-1 px-2 py-1 text-sm rounded-md transition-colors
        ${isSaving 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : 'bg-gray-900 text-white hover:bg-gray-800'}`}
    >
      <BookmarkIcon className="w-4 h-4" />
      <span>{isSaving ? 'Saving...' : 'Save'}</span>
    </button>
  ), [handleSave, isSaving]);

  return (
    <div className="min-h-screen bg-white">
      <Header 
        title="Prioritize Your Values"
        onSave={handleSave}
        isSaving={isSaving}
        onPrint={handlePrint}
        onDownload={handleDownload}
      />

      <div className="p-4 md:p-8 font-sans">
        {/* Mobile-first layout */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4 md:justify-center">
            {/* Column 4 always shows first on mobile */}
            <div className="w-full md:hidden mb-4">
              <div className="min-w-[250px] max-w-[350px] mx-auto">
                <ValuesColumn
                  columnId="column4"
                  title="Your Top 10 Priorities"
                  values={columns.column4.values}
                  onValueClick={handleValueClick}
                  isDestination={true}
                  actionButton={<SaveButton />}
                />
              </div>
            </div>

            {/* Main content area */}
            {Object.entries(columns).map(([columnId, column]) => (
              columnId !== 'column4' && (
                <ValuesColumn
                  key={columnId}
                  columnId={columnId}
                  title={column.title}
                  values={column.values}
                  onValueClick={handleValueClick}
                />
              )
            ))}

            {/* Column 4 for desktop view */}
            <div className="hidden md:block">
              <ValuesColumn
                columnId="column4"
                title="Your Top 10 Priorities"
                values={columns.column4.values}
                onValueClick={handleValueClick}
                isDestination={true}
                actionButton={<SaveButton />}
              />
            </div>
          </div>
        </DragDropContext>
      </div>

      {/* AI Helper */}
      {showAIHelper && (
        <AIHelper 
          selectedValues={selectedValues}
          isVisible={showAIHelper}
          onClose={() => setShowAIHelper(false)}
        />
      )}

      {/* Save dialog */}
      {showSaveDialog && (
        <SaveDialog
          currentListName={currentListName}
          isSaving={isSaving}
          onSaveExisting={handleSaveExisting}
          onSaveAs={handleSaveAs}
          onCancel={() => setShowSaveDialog(false)}
        />
      )}
    </div>
  );
} 