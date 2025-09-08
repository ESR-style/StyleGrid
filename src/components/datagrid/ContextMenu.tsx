import React, { useEffect, useRef } from 'react';
import { 
  Copy, 
  Download, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Pin, 
  Eye, 
  EyeOff,
  BarChart3
} from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  column?: any;
  rowData?: any;
  onAction: (action: string, data?: any) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  column,
  rowData,
  onAction,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleAction = (action: string, data?: any) => {
    onAction(action, data);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1"
      style={{ left: x, top: y }}
    >
      {/* Cell Actions */}
      {rowData && (
        <>
          <button
            onClick={() => handleAction('copy')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Copy className="w-4 h-4 mr-3" />
            Copy Cell
          </button>
          <button
            onClick={() => handleAction('copyRow')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Copy className="w-4 h-4 mr-3" />
            Copy Row
          </button>
          <hr className="my-1" />
        </>
      )}

      {/* Column Actions */}
      {column && (
        <>
          <button
            onClick={() => handleAction('sortAsc', column)}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <SortAsc className="w-4 h-4 mr-3" />
            Sort Ascending
          </button>
          <button
            onClick={() => handleAction('sortDesc', column)}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <SortDesc className="w-4 h-4 mr-3" />
            Sort Descending
          </button>
          <hr className="my-1" />
          
          <button
            onClick={() => handleAction('filter', column)}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Filter className="w-4 h-4 mr-3" />
            Filter
          </button>
          <hr className="my-1" />
          
          <button
            onClick={() => handleAction('pinLeft', column)}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Pin className="w-4 h-4 mr-3" />
            Pin Left
          </button>
          <button
            onClick={() => handleAction('pinRight', column)}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Pin className="w-4 h-4 mr-3" />
            Pin Right
          </button>
          <button
            onClick={() => handleAction('unpin', column)}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Pin className="w-4 h-4 mr-3" />
            Unpin
          </button>
          <hr className="my-1" />
          
          <button
            onClick={() => handleAction('hideColumn', column)}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <EyeOff className="w-4 h-4 mr-3" />
            Hide Column
          </button>
          <button
            onClick={() => handleAction('autoSize', column)}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <BarChart3 className="w-4 h-4 mr-3" />
            Auto Size Column
          </button>
          <hr className="my-1" />
        </>
      )}

      {/* General Actions */}
      <button
        onClick={() => handleAction('export')}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <Download className="w-4 h-4 mr-3" />
        Export Data
      </button>
      <button
        onClick={() => handleAction('selectAll')}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <Eye className="w-4 h-4 mr-3" />
        Select All
      </button>
    </div>
  );
};
