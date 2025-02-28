'use client';

import { Droppable, Draggable } from '@hello-pangea/dnd';

// Define the structure for our value items
interface ValueItem {
  id: string;
  content: string;
  isHighlighted: boolean;
}

interface ValuesColumnProps {
  columnId: string;
  title: string;
  values: ValueItem[];
  onValueClick: (columnId: string, valueId: string) => void;
  isDestination?: boolean;
  actionButton?: React.ReactNode;
}

export default function ValuesColumn({
  columnId,
  title,
  values,
  onValueClick,
  isDestination = false,
  actionButton
}: ValuesColumnProps) {
  return (
    <div className="flex-1 min-w-[250px] max-w-[350px]">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {actionButton}
      </div>
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`p-1.5 rounded-lg min-h-[450px] ${
              isDestination && values.length === 0 
                ? 'bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center' 
                : isDestination 
                  ? 'bg-gray-100 border border-gray-200'
                  : snapshot.isDraggingOver
                    ? 'bg-[#F4F4F5]'
                    : 'bg-[#FAFAFA]'
            }`}
          >
            {isDestination && values.length === 0 && (
              <div className="text-center text-gray-500">
                <p className="mb-2">Click values or drag them here</p>
                <p className="text-sm">Select up to 10 values in order of importance</p>
              </div>
            )}
            {values.map((value, index) => (
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
                    onClick={() => onValueClick(columnId, value.id)}
                    className={`p-2 mb-1 text-sm rounded-md cursor-pointer select-none flex items-center gap-2
                      ${snapshot.isDragging ? 'shadow-sm ring-1 ring-[#E4E4E7]' : ''}
                      ${isDestination || value.isHighlighted 
                        ? 'bg-[#18181B] text-white hover:bg-[#27272A]' 
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
                    {isDestination && (
                      <span className="text-sm font-semibold mr-2 w-8 shrink-0">
                        {(index + 1).toString().padStart(2, '0')}.
                      </span>
                    )}
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
  );
} 