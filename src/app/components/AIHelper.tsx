import { useState, useEffect } from 'react';
import { useCompletion } from 'ai/react';
import { XMarkIcon, ArrowPathIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface AIHelperProps {
  selectedValues: string[];
  isVisible: boolean;
  onClose: () => void;
}

export default function AIHelper({ selectedValues, isVisible, onClose }: AIHelperProps) {
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const { complete, completion, isLoading, error: completionError } = useCompletion({
    api: '/api/claude',
    onError: (err) => {
      console.error('Completion error:', err);
      setError('Failed to get AI response. Please try again.');
      toast.error('Failed to get AI response');
    },
  });

  useEffect(() => {
    if (selectedValues.length > 0) {
      setError(null);
      complete(JSON.stringify({ values: selectedValues }))
        .catch(err => {
          console.error('Error completing values:', err);
          setError('Failed to process values');
        });
    }
  }, [selectedValues, complete]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setError(null);
    complete(JSON.stringify({ 
      values: selectedValues,
      question: input.trim()
    }))
      .catch(err => {
        console.error('Error submitting question:', err);
        setError('Failed to send question');
      });
    setInput('');
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg transition-all duration-300 ${
      minimized ? 'h-12' : 'h-96'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-900 text-white rounded-t-lg cursor-pointer"
           onClick={() => setMinimized(!minimized)}>
        <h3 className="text-sm font-medium">AI Values Assistant</h3>
        <div className="flex items-center gap-2">
          {isLoading && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
          <XMarkIcon 
            className="w-4 h-4 hover:text-gray-300" 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          />
        </div>
      </div>

      {/* Content */}
      {!minimized && (
        <>
          <div className="p-4 h-[calc(100%-108px)] overflow-y-auto">
            {error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : isLoading ? (
              <p className="text-sm text-gray-500">Thinking about your values...</p>
            ) : completion ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{completion}</p>
            ) : selectedValues.length === 0 ? (
              <p className="text-sm text-gray-500">Select some values to get insights...</p>
            ) : (
              <p className="text-sm text-gray-500">Ask me anything about your values...</p>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your values..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`p-2 rounded-lg ${
                  isLoading || !input.trim() 
                    ? 'bg-gray-100 text-gray-400' 
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
} 