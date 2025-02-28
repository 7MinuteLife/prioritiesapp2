'use client';

import { useState } from 'react';

interface SaveDialogProps {
  currentListName?: string;
  isSaving: boolean;
  onSaveExisting: () => void;
  onSaveAs: (name: string) => void;
  onCancel: () => void;
}

export default function SaveDialog({
  currentListName,
  isSaving,
  onSaveExisting,
  onSaveAs,
  onCancel
}: SaveDialogProps) {
  const [showNewNameInput, setShowNewNameInput] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');

  const handleSaveAs = () => {
    if (saveAsName.trim()) {
      onSaveAs(saveAsName);
    }
  };

  return (
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
                onClick={onSaveExisting}
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
                  onCancel();
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
  );
} 