'use client';

import { 
  PlusCircleIcon, 
  DocumentPlusIcon, 
  Squares2X2Icon,
  ArrowDownTrayIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import ProfileDropdown from './ProfileDropdown';

interface HeaderProps {
  title: string;
  showActions?: boolean;
  onSave?: () => void;
  isSaving?: boolean;
  onPrint?: () => void;
  onDownload?: () => void;
}

export default function Header({ 
  title, 
  showActions = true,
  onSave,
  isSaving,
  onPrint,
  onDownload
}: HeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold">{title}</h1>
      
      <div className="flex items-center gap-2">
        {/* New list */}
        <button
          onClick={() => router.push('/')}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          title="New List"
        >
          <PlusCircleIcon className="w-6 h-6" />
        </button>

        {showActions && onSave && (
          <button
            onClick={onSave}
            disabled={isSaving}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            title="Save List"
          >
            <DocumentPlusIcon className="w-6 h-6" />
          </button>
        )}

        {/* View saved lists */}
        <button
          onClick={() => router.push('/saved-lists')}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          title="View Saved Lists"
        >
          <Squares2X2Icon className="w-6 h-6" />
        </button>

        {showActions && onDownload && (
          <button
            onClick={onDownload}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            title="Download PDF"
          >
            <ArrowDownTrayIcon className="w-6 h-6" />
          </button>
        )}

        {showActions && onPrint && (
          <button
            onClick={onPrint}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            title="Print"
          >
            <PrinterIcon className="w-6 h-6" />
          </button>
        )}

        <ProfileDropdown />
      </div>
    </div>
  );
} 