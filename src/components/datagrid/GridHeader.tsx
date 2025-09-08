import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useGridContext } from '../../context/GridContext';
import type { ColumnDef } from '../../types/grid';

interface GridHeaderProps {
  column: ColumnDef;
  width: number;
  onResize: (colId: string, width: number) => void;
  // onSort now supports multi-sort when second arg true (Shift key)
  onSort: (colId: string, multi?: boolean) => void;
}

export const GridHeader: React.FC<GridHeaderProps> = ({
  column,
  width,
  onResize,
  onSort,
}) => {
  const { state } = useGridContext();
  const [isResizing, setIsResizing] = React.useState(false);
  
  const resizeStartRef = React.useRef<{ startX: number; startWidth: number } | null>(null);

  const sortDirection = state.sortModel.find(sort => sort.colId === column.field)?.sort;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartRef.current = {
      startX: e.clientX,
      startWidth: width,
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (resizeStartRef.current) {
        const delta = e.clientX - resizeStartRef.current.startX;
        const newWidth = Math.max(50, resizeStartRef.current.startWidth + delta);
        onResize(column.field, newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleColumnClick = (e: React.MouseEvent) => {
    // Prevent sorting during resize
    if (isResizing) {
      return;
    }
    
    // Only sort if column is sortable
    if (column.sortable) {
      e.preventDefault();
      e.stopPropagation();
      onSort(column.field, e.shiftKey); // Shift => multi-sort
    }
  };

  const getSortIcon = () => {
    if (!column.sortable || !sortDirection) return null;
    
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-blue-600" />
    ) : (
      <ChevronDown className="w-3 h-3 text-blue-600" />
    );
  };

  return (
    <div className="relative flex items-center h-full bg-gray-50 border-b border-gray-200 px-2">
      <div 
        className={`flex-1 flex items-center space-x-1 ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''} rounded px-1 py-1 transition-colors select-none`}
        onClick={handleColumnClick}
        onMouseDown={(e) => e.stopPropagation()} // Prevent interference with resize
        title={column.sortable ? `Click to sort by ${column.headerName || column.field}` : undefined}
        style={{ pointerEvents: 'auto' }}
      >
        <span className="text-sm font-medium text-gray-700 truncate">
          {column.headerName}
        </span>
        {getSortIcon()}
      </div>

      {column.resizable && (
        <div
          className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
          onMouseDown={handleMouseDown}
          style={{ backgroundColor: isResizing ? '#3b82f6' : 'transparent' }}
        />
      )}
    </div>
  );
};
