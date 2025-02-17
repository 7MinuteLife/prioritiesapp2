'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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
  const [columns, setColumns] = useState(initialColumns);

  const handleValueClick = (columnId: string, valueId: string) => {
    setColumns(prevColumns => {
      const newColumns = { ...prevColumns };
      const column = { ...newColumns[columnId] };
      newColumns[columnId] = column;
      
      const valueIndex = column.values.findIndex(v => v.id === valueId);
      if (valueIndex !== -1) {
        const values = [...column.values];
        values[valueIndex] = {
          ...values[valueIndex],
          isHighlighted: !values[valueIndex].isHighlighted
        };
        column.values = values;
      }
      
      return newColumns;
    });
  };

  const onDragEnd = (result: any) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];

    const sourceValues = [...sourceColumn.values];
    const destValues = [...destColumn.values];

    const [removed] = sourceValues.splice(source.index, 1);
    destValues.splice(destination.index, 0, removed);

    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        values: sourceValues,
      },
      [destination.droppableId]: {
        ...destColumn,
        values: destValues,
      },
    });
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Prioritize Your Values</h1>
      <div className="flex gap-4 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="flex-1 min-w-[220px]">
              <h2 className="font-semibold text-lg mb-3">{column.title}</h2>
              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`p-2 rounded-lg min-h-[500px] ${
                      snapshot.isDraggingOver
                        ? 'bg-blue-50'
                        : 'bg-gray-50'
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
                            className={`p-2 mb-1 text-sm rounded-lg cursor-pointer select-none
                              ${snapshot.isDragging ? 'shadow-lg' : ''}
                              ${value.isHighlighted 
                                ? 'bg-gray-500 text-white' 
                                : 'bg-white hover:bg-gray-100'} 
                              border border-gray-200 transition-all duration-200`}
                          >
                            {value.content}
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
  );
} 