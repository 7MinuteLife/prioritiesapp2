'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { UserCircleIcon, PrinterIcon, PlusCircleIcon, ArrowDownTrayIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import ProfileDropdown from '@/app/components/ProfileDropdown';
import { generateValuesPDF } from '@/lib/utils/pdfGenerator';
import { saveUserValues, getUserValues } from '@/lib/firebase/firebaseUtils';
import { toast } from 'react-hot-toast';
import AIHelper from './AIHelper';

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
  console.log('Component mounted');
  const [columns, setColumns] = useState(initialColumns);
  const [isSaving, setIsSaving] = useState(false);
  const [showAIHelper, setShowAIHelper] = useState(false);
  const { user, signInWithGoogle, signOut } = useAuth();
  const router = useRouter();
  
  // Add this console log
  console.log('Auth state:', { user, hasSignIn: !!signInWithGoogle, hasSignOut: !!signOut });

  // Load saved values when component mounts
  useEffect(() => {
    const loadSavedValues = async () => {
      if (user?.uid) {
        const savedData = await getUserValues(user.uid);
        if (savedData?.values) {
          setColumns(savedData.values);
        }
      }
    };
    loadSavedValues();
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save your values');
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveUserValues(user.uid, columns);
      if (saved) {
        toast.success('Values saved successfully!');
      } else {
        toast.error('Failed to save values');
      }
    } catch (error) {
      console.error('Error saving values:', error);
      toast.error('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleValueClick = (columnId: string, valueId: string) => {
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
        
        if (valueIndex !== -1 && newColumns.column4.values.length < 10) {
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
            values: [...newColumns.column4.values, { ...value, isHighlighted: true }],
          };
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
    const topValues = columns.column4.values;
    const userName = user?.displayName || undefined;
    await generateValuesPDF(topValues, userName);
  };

  const getSelectedValues = () => {
    const column4Values = columns.column4.values;
    return column4Values.map(v => v.content);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Bar */}
      <div className="flex justify-between items-center bg-gray-900 text-white px-6 py-4">
        <h1 className="text-xl font-semibold">Prioritize Your Values</h1>
        
        <div className="flex items-center gap-4">
          <button
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            title="New"
          >
            <PlusCircleIcon className="w-6 h-6" />
          </button>

          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            title="Download PDF"
          >
            <ArrowDownTrayIcon className="w-6 h-6" />
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Save Values"
          >
            <BookmarkIcon className="w-5 h-5" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>

          <button
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            title="Print"
          >
            <PrinterIcon className="w-6 h-6" />
          </button>
          
          <ProfileDropdown />
        </div>
      </div>

      <div className="p-4 md:p-8 font-sans">
        {/* Mobile-first layout */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Column 4 always shows first on mobile */}
            <div className="w-full md:hidden mb-4">
              <div className="flex-1 min-w-[180px]">
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
                                border border-[#E4E4E7] transition-all duration-200"
                            >
                              <div className="grid grid-cols-2 gap-[2px] px-0.5">
                                <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                              </div>
                              <span className="text-sm font-semibold mr-2 w-8">
                                {(index + 1).toString().padStart(2, '0')}.
                              </span>
                              <span className="text-sm font-medium">{value.content}</span>
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
            <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4">
              {Object.entries(columns).map(([columnId, column]) => (
                columnId !== 'column4' && (
                  <div key={columnId} className="flex-1 min-w-[180px]">
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
                                    border border-[#E4E4E7] transition-all duration-200`}
                                  style={provided.draggableProps.style}
                                >
                                  <div className="grid grid-cols-2 gap-[2px] px-0.5">
                                    <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                    <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                    <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                    <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                    <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                    <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                  </div>
                                  <span className="text-sm font-medium">{value.content}</span>
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
              <div className="hidden md:block flex-1 min-w-[180px]">
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
                                border border-[#E4E4E7] transition-all duration-200"
                            >
                              <div className="grid grid-cols-2 gap-[2px] px-0.5">
                                <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                                <div className="w-[2px] h-[2px] rounded-full bg-current opacity-50"></div>
                              </div>
                              <span className="text-sm font-semibold mr-2 w-8">
                                {(index + 1).toString().padStart(2, '0')}.
                              </span>
                              <span className="text-sm font-medium">{value.content}</span>
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
    </div>
  );
} 