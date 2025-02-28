'use client';

import { useState, useCallback } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { toast } from 'react-hot-toast';

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

// Define the structure for columns state
interface ColumnsState {
  [key: string]: Column;
}

/**
 * Custom hook for handling values drag and drop functionality
 */
export function useValuesDragDrop(initialColumns: ColumnsState) {
  const [columns, setColumns] = useState<ColumnsState>(initialColumns);

  /**
   * Handle drag end event
   */
  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination } = result;

    // Return if dropped outside or at the same position
    if (!destination || 
        (source.droppableId === destination.droppableId && 
         source.index === destination.index)
    ) {
      return;
    }

    setColumns(prev => {
      const start = prev[source.droppableId];
      const finish = prev[destination.droppableId];
      
      if (start === finish) {
        // Moving within the same column
        const newValues = Array.from(start.values);
        const [removed] = newValues.splice(source.index, 1);
        newValues.splice(destination.index, 0, removed);

        return {
          ...prev,
          [source.droppableId]: {
            ...start,
            values: newValues,
          },
        };
      } else {
        // Moving from one column to another
        const startValues = Array.from(start.values);
        const [removed] = startValues.splice(source.index, 1);
        
        const finishValues = Array.from(finish.values);
        
        // Check if destination is column4 and it already has 10 items
        if (destination.droppableId === 'column4' && finishValues.length >= 10) {
          toast.error('Maximum of 10 priorities reached');
          return prev;
        }
        
        finishValues.splice(destination.index, 0, {
          ...removed,
          isHighlighted: destination.droppableId === 'column4' ? true : removed.isHighlighted
        });

        return {
          ...prev,
          [source.droppableId]: {
            ...start,
            values: startValues,
          },
          [destination.droppableId]: {
            ...finish,
            values: finishValues,
          },
        };
      }
    });
  }, []);

  /**
   * Handle value click event
   */
  const handleValueClick = useCallback((columnId: string, valueId: string) => {
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
  }, []);

  return {
    columns,
    setColumns,
    onDragEnd,
    handleValueClick
  };
} 