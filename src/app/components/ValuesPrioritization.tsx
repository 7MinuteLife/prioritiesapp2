'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { UserCircleIcon, PrinterIcon, PlusCircleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import ProfileDropdown from '@/app/components/ProfileDropdown';
import { generateValuesPDF } from '@/lib/utils/pdfGenerator';

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
      'Love', 'Friendships', 'Innovation', 'Empathy', 'Clear Direction',
      'Mental Health', 'Happiness', 'Authenticity', 'Meaningful work', 'Results',
      'Stability', 'Freedom', 'Communication', 'Kindness', 'Adventure',
      'Joy', 'Courage', 'Learning', 'Challenges', 'Passion'
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
      'Faith', 'Change', 'Simplicity', 'Fun', 'Balance',
      'Laughter', 'Originality', 'Compassion', 'Generosity', 'Nature/Outdoors',
      'Curiosity', 'Relationships', 'Accuracy', 'Productivity', 'Clarity',
      'Being Present', 'Peace', 'Excellence', 'Creativity', 'Belonging'
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
      'Family', 'Serving Others', 'Leadership', 'Solitude', 'Time',
      'Honesty', 'Nutrition', 'Growing', 'Mastery', 'Optimism',
      'Determination', 'Health', 'Significance', 'Teaching', 'Resilience',
      'Teamwork', 'Travel', 'Connecting', 'Recreation/Play', 'Making a Difference'
    ].map((content, index) => ({ 
      id: `value-${index + 41}`, 
      content, 
      isHighlighted: false 
    })),
  },
  column4: {
    id: 'column4',
    title: 'Your Top Values',
    values: [],
  },
};

export default function ValuesPrioritization() {
  console.log('Component mounted');
  const [columns, setColumns] = useState(initialColumns);
  const { user, signInWithGoogle, signOut } = useAuth();
  const router = useRouter();
  
  // Add this console log
  console.log('Auth state:', { user, hasSignIn: !!signInWithGoogle, hasSignOut: !!signOut });

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
        // Original highlight toggle behavior for other columns
        const column = { ...newColumns[columnId] };
        const valueIndex = column.values.findIndex(v => v.id === valueId);
        
        if (valueIndex !== -1) {
          const values = [...column.values];
          values[valueIndex] = {
            ...values[valueIndex],
            isHighlighted: !values[valueIndex].isHighlighted
          };
          column.values = values;
          newColumns[columnId] = column;
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
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            title="Print"
          >
            <PrinterIcon className="w-6 h-6" />
          </button>
          
          <ProfileDropdown />
        </div>
      </div>

      <div className="p-4 md:p-8 font-sans">
        <div className="flex gap-4 overflow-x-auto pb-4">
          <DragDropContext onDragEnd={onDragEnd}>
            {Object.entries(columns).map(([columnId, column]) => (
              <div key={columnId} className="flex-1 min-w-[220px]">
                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`p-2 rounded-lg min-h-[500px] ${
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
                              className={`p-2.5 mb-1 text-sm rounded-md cursor-pointer select-none flex items-center gap-3
                                ${snapshot.isDragging ? 'shadow-sm ring-1 ring-[#E4E4E7]' : ''}
                                ${columnId === 'column4' 
                                  ? 'bg-[#18181B] text-white hover:bg-[#27272A]' 
                                  : value.isHighlighted 
                                    ? 'bg-[#18181B] text-white' 
                                    : 'bg-white hover:bg-[#F4F4F5]'} 
                                border border-[#E4E4E7] transition-all duration-200`}
                              style={provided.draggableProps.style}
                            >
                              {columnId === 'column4' && (
                                <span className="text-sm font-semibold mr-2 w-8">
                                  {(index + 1).toString().padStart(2, '0')}.
                                </span>
                              )}
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
            ))}
          </DragDropContext>
        </div>
      </div>
    </div>
  );
} 