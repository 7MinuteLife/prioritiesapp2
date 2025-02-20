'use client';

import { useEffect, useState } from 'react';
import './print.css';

interface Value {
  id: string;
  content: string;
  isHighlighted: boolean;
}

interface Values {
  column4: {
    values: Value[];
  };
}

export default function PrintPage() {
  const [values, setValues] = useState<Value[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get values from localStorage
    const storedValues = localStorage.getItem('print-list');
    if (storedValues) {
      try {
        const parsedValues = JSON.parse(storedValues);
        // Handle both data structures: direct values array or nested object
        const valuesList = Array.isArray(parsedValues) ? parsedValues : 
          parsedValues?.column4?.values ? parsedValues.column4.values :
          parsedValues?.values?.column4?.values ? parsedValues.values.column4.values : [];
        
        setValues(valuesList);
        
        // Trigger print after values are loaded
        setTimeout(() => {
          window.print();
        }, 500);
      } catch (error) {
        console.error('Error parsing values:', error);
        setError('Failed to load values for printing');
      }
    } else {
      setError('No values found to print');
    }
  }, []);

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Priority Values</h1>
      
      <div className="space-y-4">
        {values.map((value, index) => (
          <div 
            key={value.id || index}
            className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200"
          >
            <span className="text-lg font-semibold text-gray-500 w-8">
              {(index + 1).toString().padStart(2, '0')}.
            </span>
            <span className="text-xl font-medium text-gray-900">
              {value.content}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 text-sm text-gray-500 text-center">
        Generated on {new Date().toLocaleDateString()}
      </div>
    </div>
  );
} 