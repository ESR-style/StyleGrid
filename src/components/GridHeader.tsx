import React from 'react';
import { ChevronDown, ChevronRight, MoreVertical } from 'lucide-react';
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
  const [showMenu, setShowMenu] = React.useState(false);
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

  const handleSort = () => {
    if (column.sortable) {
      onSort(column.field);
    }
  };

  const handleHeaderCheckboxChange = () => {
    if (state.selectedRows.size === state.rowData.length) {
      dispatch({ type: 'DESELECT_ALL_ROWS' });
    } else {
      dispatch({ type: 'SELECT_ALL_ROWS' });
    }
  };

  const isAllSelected = state.selectedRows.size === state.rowData.length && state.rowData.length > 0;
  const isPartiallySelected = state.selectedRows.size > 0 && state.selectedRows.size < state.rowData.length;

  return (
    <div
      className={`
        relative flex items-center h-full px-2 border-r border-gray-200 bg-gray-50 
        ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}
        ${column.headerClass || ''}
      `}
      style={{ width }}
      onClick={handleSort}
    >
      {column.checkboxSelection && (
        <div className="mr-2" onClick={e => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={input => {
              if (input) input.indeterminate = isPartiallySelected;
            }}
            onChange={handleHeaderCheckboxChange}
            className="rounded border-gray-300"
          />
        </div>
      )}

      <span className="flex-1 font-medium text-gray-900 text-sm truncate">
        {column.headerName || column.field}
      </span>

      {column.sortable && sortDirection && (
        <div className="ml-1 flex items-center">
          {sortDirection === 'asc' ? (
            <ChevronDown className="w-4 h-4 text-blue-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-blue-500 rotate-90" />
          )}
        </div>
      )}

      <div className="relative">
        <button
          className="ml-1 p-1 hover:bg-gray-200 rounded"
          onClick={e => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          <MoreVertical className="w-3 h-3 text-gray-500" />
        </button>

        {showMenu && (
          <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-40">
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
      </div>

      {column.resizable && (
        <div
          className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
          onMouseDown={handleMouseDown}
          style={{ backgroundColor: isResizing ? '#3b82f6' : 'transparent' }}
        />
      )}

      {showMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};
