'use client';

import { useEffect, useState } from 'react';
import './print.css';

interface Value {
  id: string;
  content: string;
  isHighlighted: boolean;
}

interface PrintData {
  listName: string;
  values: Value[];
  createdAt: string;
}

export default function PrintPage() {
  const [printData, setPrintData] = useState<PrintData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get values from localStorage
    const storedData = localStorage.getItem('printList');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setPrintData(parsedData);
        
        // Trigger print after data is loaded
        setTimeout(() => {
          window.print();
        }, 500);
      } catch (error) {
        console.error('Error parsing print data:', error);
        setError('Failed to load data for printing');
      }
    } else {
      setError('No data found to print');
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

  if (!printData) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-600 mb-4">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{printData.listName}</h1>
      <p className="text-sm text-gray-500 mb-8">
        Created on {new Date(printData.createdAt).toLocaleDateString()}
      </p>
      
      <div className="space-y-4">
        {printData.values.map((value, index) => (
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
        Printed on {new Date().toLocaleDateString()}
      </div>
    </div>
  );
} 