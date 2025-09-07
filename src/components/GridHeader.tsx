import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useGridContext } from '../context/GridContext';
import type { ColumnDef } from '../types/grid';

interface GridHeaderProps {
  column: ColumnDef;
  width: number;
  onResize: (colId: string, width: number) => void;
  onSort: (colId: string) => void;
  onPin: (colId: string, pinned: 'left' | 'right' | null) => void;
  onHide: (colId: string) => void;
}

export const GridHeader: React.FC<GridHeaderProps> = ({
  column,
  width,
  onResize,
  onSort,
  onPin,
  onHide,
}) => {
  const { state, dispatch } = useGridContext();
  const [isResizing, setIsResizing] = React.useState(false);
  const [anyFilterOpen, setAnyFilterOpen] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: any) => setAnyFilterOpen(!!e.detail);
    window.addEventListener('grid-filter-open', handler as any);
    return () => window.removeEventListener('grid-filter-open', handler as any);
  }, []);
  
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

  return (
    <div className="relative flex items-center h-full bg-gray-50 border-b border-gray-200 px-2">
      <span className="flex-1 text-sm font-medium text-gray-700">
        {column.headerName}
      </span>

      {showMenu && (
        <div className="absolute top-full left-0 z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="py-1">
            {column.sortable && (
              <>
                <button
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  onClick={e => {
                    e.stopPropagation();
                    onSort(column.field);
                    setShowMenu(false);
                  }}
                >
                  Sort Ascending
                </button>
                <button
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  onClick={e => {
                    e.stopPropagation();
                    onSort(column.field);
                    setShowMenu(false);
                  }}
                >
                  Sort Descending
                </button>
                <hr className="my-1" />
              </>
            )}
            
            <button
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              onClick={e => {
                e.stopPropagation();
                onPin(column.field, 'left');
                setShowMenu(false);
              }}
            >
              Pin Left
            </button>
            <button
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              onClick={e => {
                e.stopPropagation();
                onPin(column.field, 'right');
                setShowMenu(false);
              }}
            >
              Pin Right
            </button>
            <button
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              onClick={e => {
                e.stopPropagation();
                onPin(column.field, null);
                setShowMenu(false);
              }}
            >
              No Pin
            </button>
            
            <hr className="my-1" />
            
            <button
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              onClick={e => {
                e.stopPropagation();
                onHide(column.field);
                setShowMenu(false);
              }}
            >
              Hide Column
            </button>
          </div>
        </div>
      )}

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
