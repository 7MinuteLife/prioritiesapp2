'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { UserCircleIcon, PrinterIcon, PlusCircleIcon, ArrowDownTrayIcon, BookmarkIcon, FolderIcon, DocumentPlusIcon, FolderOpenIcon, Squares2X2Icon } from '@heroicons/react/24/outline'
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import ProfileDropdown from '@/app/components/ProfileDropdown';
import { generateValuesPDF } from '@/lib/utils/pdfGenerator';
import { saveUserValues, getUserValues, getUserPriorityLists } from '@/lib/firebase/firebaseUtils';
import { toast } from 'react-hot-toast';
import AIHelper from './AIHelper';
import Header from './Header';

// Define the structure for our value items
interface ValueItem {
  id: string;
  content: string;
  isHighlighted: boolean;
}

// Define the structure for our columns
interface Column {
  id: string;
  title: string;
  values: ValueItem[];
}

const initialColumns: { [key: string]: Column } = {
  column1: {
    id: 'column1',
    title: 'Personal Values',
    values: [
      'Love', 'Integrity', 'Meditation', 'Kindness', 'Adventure',
      'Mental Health', 'Gratitude', 'Balance', 'Meaningful Work',
      'Stability', 'Freedom', 'Learning', 'Creativity', 'Excellence',
      'Being Present', 'Peace', 'Imagination', 'Family', 'Success'
    ].map((content, index) => ({ 
      id: `value-${index + 1}`, 
      content, 
      isHighlighted: false 
    })),
  },
  column2: {
    id: 'column2',
    title: 'Growth Values',
    values: [
      'Faith', 'Simplicity', 'Fun', 'Financial Freedom',
      'Laughter', 'Compassion', 'Generosity', 'Nature/Outdoors',
      'Curiosity', 'Order', 'Trust', 'Innovation',
      'Belonging', 'Making a Difference', 'Time',
      'Honesty', 'Nutrition', 'Growth', 'Connection'
    ].map((content, index) => ({ 
      id: `value-${index + 21}`, 
      content, 
      isHighlighted: false 
    })),
  },
  column3: {
    id: 'column3',
    title: 'Life Values',
    values: [
      'Friendships', 'Leadership', 'Security', 'Teamwork',
      'Community', 'Teaching', 'Giving', 'Resilience',
      'Travel', 'Relationships', 'Purpose', 'Achievement',
      'Self-Respect', 'Reach Full Potential', 'Health', 'Optimism',
      'Wisdom', 'Fitness', 'Energy'
    ].map((content, index) => ({ 
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
};

export default function ValuesPrioritization() {
  const [columns, setColumns] = useState(initialColumns);
  const [isSaving, setIsSaving] = useState(false);
  const [showAIHelper, setShowAIHelper] = useState(false);
  const { user, signInWithGoogle, signOut } = useAuth();
  const router = useRouter();

  // Add logging for initial mount and data
  useEffect(() => {
    console.log('=== ValuesPrioritization Component ===');
    console.log('1. Initial Mount State:', {
      initialColumns,
      hasUser: !!user,
      userId: user?.uid
    });
  }, []);

  // Add logging for columns changes
  useEffect(() => {
    console.log('2. Columns Updated:', {
      totalColumns: Object.keys(columns).length,
      column4Items: columns.column4.values.length,
      timestamp: new Date().toISOString()
    });
  }, [columns]);

  // Single useEffect for component mount and auth state
  useEffect(() => {
    console.log('ValuesPrioritization - Mount Status:', {
      isInitialMount: true,
      hasUser: !!user,
      userId: user?.uid || 'not authenticated'
    });

    // Load saved values when component mounts and user exists
    const loadSavedValues = async () => {
      if (user?.uid) {
        const params = new URLSearchParams(window.location.search);
        const listId = params.get('listId');
        
        if (listId) {
          console.log('Loading saved values for list:', listId);
          const savedData = await getUserValues(user.uid, listId);
          console.log('Loaded data:', savedData);
          
          if (savedData?.values) {
            setColumns(savedData.values);
            setCurrentListName(savedData.listName);
          }
        }
      }
    };

    loadSavedValues();
  }, [user?.uid]); // Only depend on user.uid

  // Add this state at the top of your component
  const [saveAsName, setSaveAsName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // First, add this state for managing lists
  const [selectedList, setSelectedList] = useState<string>('');

  // Add listName to state
  const [currentListName, setCurrentListName] = useState('');

  // Add these new states
  const [showNewNameInput, setShowNewNameInput] = useState(false);

  // Modify handleSaveAs to include more logging
  const handleSaveAs = async () => {
    if (!user) {
      toast.error('Please sign in to save your values');
      return;
    }

    if (!saveAsName.trim()) {
      toast.error('Please enter a name for your priority list');
      return;
    }

    setIsSaving(true);
    try {
      const valuesToSave = columns.column4.values.map(v => ({
        content: v.content,
        id: v.id,
        isHighlighted: v.isHighlighted
      }));

      const saved = await saveUserValues(user.uid, valuesToSave, saveAsName);
      
      if (saved) {
        toast.success('Values saved successfully!');
        setShowSaveDialog(false);
        setSaveAsName('');
        setShowNewNameInput(false);
        router.push('/my-lists');
      } else {
        toast.error('Failed to save values');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(`Save failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Add logging to save function
  const handleSave = () => {
    if (!user) {
      toast.error('Please sign in to save your values');
      return;
    }

    if (columns.column4.values.length === 0) {
      toast.error('Please add some priorities before saving');
      return;
    }

    // Show the save dialog instead of saving directly
    setShowSaveDialog(true);
  };

  // Modify handleValueClick to include logging
  const handleValueClick = (columnId: string, valueId: string) => {
    console.log('3. Value Clicked:', {
      columnId,
      valueId,
      currentColumnState: columns[columnId].values.length
    });
    
    setColumns(prevColumns => {
      const newColumns = { ...prevColumns };
      
      // If clicking in column4, move the item back to its original column
      if (columnId === 'column4') {
        const column4 = newColumns[columnId];
        const valueIndex = column4.values.findIndex(v => v.id === valueId);
        
        if (valueIndex !== -1) {
          const value = column4.values[valueIndex];
          // Remove from column4 first
          const newColumn4Values = [...column4.values];
          newColumn4Values.splice(valueIndex, 1);
          newColumns[columnId] = {
            ...column4,
            values: newColumn4Values,
          };

          // Determine original column based on id range
          const idNumber = parseInt(value.id.split('-')[1]);
          let originalColumnId;
          if (idNumber >= 41) {
            originalColumnId = 'column3';
          } else if (idNumber >= 21) {
            originalColumnId = 'column2';
          } else {
            originalColumnId = 'column1';
          }

          // Add to original column
          const originalColumn = newColumns[originalColumnId];
          newColumns[originalColumnId] = {
            ...originalColumn,
            values: [...originalColumn.values, { ...value, isHighlighted: false }],
          };

          return newColumns;
        }
      } else {
        // When clicking a value in any other column, move it to column4 if there's space
        const sourceColumn = newColumns[columnId];
        const valueIndex = sourceColumn.values.findIndex(v => v.id === valueId);
        
        // Get current column4 length from the previous state
        const currentColumn4Length = prevColumns.column4.values.length;
        
        if (valueIndex !== -1 && currentColumn4Length < 10) {
          const value = sourceColumn.values[valueIndex];
          
          // Remove from source column
          const newSourceValues = [...sourceColumn.values];
          newSourceValues.splice(valueIndex, 1);
          newColumns[columnId] = {
            ...sourceColumn,
            values: newSourceValues,
          };

          // Add to column4
          newColumns.column4 = {
            ...newColumns.column4,
            values: [...prevColumns.column4.values, { ...value, isHighlighted: true }],
          };
        } else if (currentColumn4Length >= 10) {
          // Optionally add a toast message here when trying to add more than 10 items
          toast.error('Maximum of 10 priorities reached');
        }
      }
      
      return newColumns;
    });
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination || 
        (source.droppableId === destination.droppableId && 
         source.index === destination.index)
    ) {
      return;
    }

    const start = columns[source.droppableId];
    const finish = columns[destination.droppableId];

    if (start === finish) {
      // Moving within the same column
      const newValues = Array.from(start.values);
      const [removed] = newValues.splice(source.index, 1);
      newValues.splice(destination.index, 0, removed);

      setColumns(prev => ({
        ...prev,
        [source.droppableId]: {
          ...start,
          values: newValues,
        },
      }));
    } else {
      // Moving from one column to another
      const startValues = Array.from(start.values);
      const [removed] = startValues.splice(source.index, 1);
      
      const finishValues = Array.from(finish.values);
      finishValues.splice(destination.index, 0, {
        ...removed,
        isHighlighted: destination.droppableId === 'column4' ? true : removed.isHighlighted
      });

      setColumns(prev => ({
        ...prev,
        [source.droppableId]: {
          ...start,
          values: startValues,
        },
        [destination.droppableId]: {
          ...finish,
          values: finishValues,
        },
      }));
    }
  };

  const handleProfileClick = async () => {
    console.log('Profile clicked');
    try {
      if (user) {
        console.log('Attempting to sign out');
        await signOut();
      } else {
        console.log('Redirecting to login page');
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const handleDownload = async () => {
    const topValues = columns.column4.values.map(v => ({ content: v.content }));
    await generateValuesPDF(topValues);
  };

  const getSelectedValues = () => {
    const column4Values = columns.column4.values;
    return column4Values.map(v => v.content);
  };

  const [savedLists, setSavedLists] = useState<Array<{id: string, listName: string}>>([]);

  // Add this useEffect to load saved lists
  useEffect(() => {
    let mounted = true;
    
    const loadSavedLists = async () => {
      if (user?.uid) {
        try {
          const lists = await getUserPriorityLists(user.uid);
          if (mounted) {
            setSavedLists(lists);
            console.log('Saved lists:', lists);
          }
        } catch (error) {
          console.error('Error loading saved lists:', error);
        }
      }
    };
    
    loadSavedLists();
    
    return () => {
      mounted = false;
    };
  }, [user?.uid]); // Only depend on user.uid

  // Add this function to handle list loading
  const handleLoadList = async (listId: string) => {
    if (!listId) return;
    
    try {
      const data = await getUserValues(user!.uid, listId);
      if (data?.values) {
        // Add confirmation if there are unsaved changes
        if (columns.column4.values.length > 0) {
          if (window.confirm('Loading a new list will replace your current values. Continue?')) {
            setColumns(data.values);
            toast.success(`Loaded "${data.listName}" successfully!`);
            setSelectedList(listId);
          } else {
            // Reset dropdown if user cancels
            setSelectedList('');
          }
        } else {
          setColumns(data.values);
          toast.success(`Loaded "${data.listName}" successfully!`);
          setSelectedList(listId);
        }
      }
    } catch (error) {
      console.error('Error loading list:', error);
      toast.error('Failed to load list');
      setSelectedList('');
    }
  };

  // Add the handleSaveExisting function
  const handleSaveExisting = async () => {
    if (!user || !currentListName) return;

    setIsSaving(true);
    try {
      // Get listId from URL
      const params = new URLSearchParams(window.location.search);
      const listId = params.get('listId');
      
      if (!listId) {
        toast.error('Error: Could not find list to update');
        return;
      }

      const dataToSave = {
        column1: { ...columns.column1, values: columns.column1.values.map(v => ({ ...v })) },
        column2: { ...columns.column2, values: columns.column2.values.map(v => ({ ...v })) },
        column3: { ...columns.column3, values: columns.column3.values.map(v => ({ ...v })) },
        column4: { ...columns.column4, values: columns.column4.values.map(v => ({ ...v })) }
      };

      const saved = await saveUserValues(user.uid, dataToSave, currentListName, listId);
      
      if (saved) {
        toast.success('List updated successfully!');
        setShowSaveDialog(false);
      } else {
        toast.error('Failed to update list');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(`Update failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    // Store only the column4 values for printing
    const valuesToPrint = columns.column4.values.map(v => ({
      id: v.id,
      content: v.content,
      isHighlighted: v.isHighlighted
    }));
    localStorage.setItem('print-list', JSON.stringify(valuesToPrint));
    window.open('/print', '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        title="Prioritize Your Values"
        onSave={handleSave}
        isSaving={isSaving}
        onPrint={handlePrint}
        onDownload={() => generateValuesPDF(columns.column4.values.map(v => ({ content: v.content })))}
      />

      <div className="p-4 md:p-8 font-sans">
        {/* Mobile-first layout */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4 md:justify-center">
            {/* Column 4 always shows first on mobile */}
            <div className="w-full md:hidden mb-4">
              <div className="min-w-[250px] max-w-[350px] mx-auto">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">Your Top 10 Priorities</h2>
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
                </div>
                <Droppable droppableId="column4">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`p-1.5 rounded-lg min-h-[120px] ${
                        columns.column4.values.length === 0 
                          ? 'bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center' 
                          : 'bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {columns.column4.values.length === 0 && (
                        <div className="text-center text-gray-500">
                          <p className="mb-2">Click values below to add them here</p>
                          <p className="text-sm">Select up to 10 values in order of importance</p>
                        </div>
                      )}
                      {columns.column4.values.map((value, index) => (
                        <Draggable
                          key={value.id}
                          draggableId={value.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => handleValueClick('column4', value.id)}
                              className="p-2 mb-1 text-sm rounded-md cursor-pointer select-none flex items-center gap-2
                                bg-[#18181B] text-white hover:bg-[#27272A]
                                border border-[#E4E4E7] transition-all duration-200
                                whitespace-nowrap w-full"
                            >
                              <div className="grid grid-cols-2 gap-[2px] px-0.5 shrink-0">
                                <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                              </div>
                              <span className="text-sm font-semibold mr-2 w-8 shrink-0">
                                {(index + 1).toString().padStart(2, '0')}.
                              </span>
                              <span className="text-sm font-medium flex-1">{value.content}</span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>

            {/* Main content area */}
            {Object.entries(columns).map(([columnId, column]) => (
              columnId !== 'column4' && (
                <div key={columnId} className="flex-1 min-w-[250px] max-w-[350px]">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">{column.title}</h2>
                  <Droppable droppableId={columnId}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`p-1.5 rounded-lg min-h-[450px] ${
                          snapshot.isDraggingOver
                            ? 'bg-[#F4F4F5]'
                            : 'bg-[#FAFAFA]'
                        }`}
                      >
                        {column.values.map((value, index) => (
                          <Draggable
                            key={value.id}
                            draggableId={value.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => handleValueClick(columnId, value.id)}
                                className={`p-2 mb-1 text-sm rounded-md cursor-pointer select-none flex items-center gap-2
                                  ${snapshot.isDragging ? 'shadow-sm ring-1 ring-[#E4E4E7]' : ''}
                                  ${value.isHighlighted 
                                    ? 'bg-[#18181B] text-white' 
                                    : 'bg-white hover:bg-[#F4F4F5]'} 
                                  border border-[#E4E4E7] transition-all duration-200
                                  whitespace-nowrap w-full`}
                                style={provided.draggableProps.style}
                              >
                                <div className="grid grid-cols-2 gap-[2px] px-0.5 shrink-0">
                                  <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                  <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                  <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                  <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                  <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                  <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                </div>
                                <span className="text-sm font-medium flex-1">{value.content}</span>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            ))}

            {/* Column 4 for desktop view */}
            <div className="hidden md:block flex-1 min-w-[250px] max-w-[350px]">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-900">Your Top 10 Priorities</h2>
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
              </div>
              <Droppable droppableId="column4">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`p-1.5 rounded-lg min-h-[450px] ${
                      columns.column4.values.length === 0 
                        ? 'bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center' 
                        : 'bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {columns.column4.values.length === 0 && (
                      <div className="text-center text-gray-500">
                        <p className="mb-2">Click values or drag them here</p>
                        <p className="text-sm">Select up to 10 values in order of importance</p>
                      </div>
                    )}
                    {columns.column4.values.map((value, index) => (
                      <Draggable
                        key={value.id}
                        draggableId={value.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => handleValueClick('column4', value.id)}
                            className="p-2 mb-1 text-sm rounded-md cursor-pointer select-none flex items-center gap-2
                              bg-[#18181B] text-white hover:bg-[#27272A]
                              border border-[#E4E4E7] transition-all duration-200
                              whitespace-nowrap w-full"
                          >
                            <div className="grid grid-cols-2 gap-[2px] px-0.5 shrink-0">
                              <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                              <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                              <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                              <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                              <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                              <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                            </div>
                            <span className="text-sm font-semibold mr-2 w-8 shrink-0">
                              {(index + 1).toString().padStart(2, '0')}.
                            </span>
                            <span className="text-sm font-medium flex-1">{value.content}</span>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </DragDropContext>
      </div>

      {/* AI Helper temporarily disabled
      <AIHelper 
        selectedValues={getSelectedValues()}
        isVisible={showAIHelper}
        onClose={() => setShowAIHelper(false)}
      />
      */}

      {/* Add this JSX for the save dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Save Priority List</h3>
            {currentListName && !showNewNameInput ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Update "{currentListName}" or save as a new list
                </p>
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={handleSaveExisting}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                  >
                    {isSaving ? 'Updating...' : 'Update Existing'}
                  </button>
                  <button
                    onClick={() => setShowNewNameInput(true)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Save as New
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  {currentListName 
                    ? 'Enter a new name for your list'
                    : 'Give your list a meaningful name to help you remember its purpose.'}
                </p>
                <input
                  type="text"
                  value={saveAsName}
                  onChange={(e) => setSaveAsName(e.target.value)}
                  placeholder={currentListName ? `Copy of ${currentListName}` : "Enter a name for your list"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowSaveDialog(false);
                      setShowNewNameInput(false);
                      setSaveAsName('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAs}
                    disabled={isSaving || !saveAsName.trim()}
                    className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 