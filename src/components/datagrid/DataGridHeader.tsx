import React, { useRef } from 'react';
import { GridHeader } from './GridHeader';
import { ColumnFilter } from './ColumnFilter';
import type { ColumnDef } from '../../types/grid';

interface DataGridHeaderProps {
  visibleColumns: ColumnDef[];
  getColumnWidth: (colId: string, defaultWidth?: number) => number;
  totalWidth: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  onResize: (colId: string, displayedWidth: number) => void;
  onSort: (colId: string, multi?: boolean) => void;
  onFilterChange: (colId: string, filterValue: any) => void;
  filterModel: Record<string, any>;
  rowData: any[];
  scrollLeft?: number;
}

export const DataGridHeader: React.FC<DataGridHeaderProps> = ({
  visibleColumns,
  getColumnWidth,
  totalWidth,
  containerRef,
  zoom,
  onResize,
  onSort,
  onFilterChange,
  filterModel,
  rowData,
  scrollLeft = 0,
}) => {
  const headerRef = useRef<HTMLDivElement>(null);

  // Sync scroll position
  React.useEffect(() => {
    if (headerRef.current) {
      headerRef.current.scrollLeft = scrollLeft;
    }
  }, [scrollLeft]);

  const baseHeaderHeight = 32;
  const headerHeight = Math.round(baseHeaderHeight * zoom);

  return (
    <div 
      ref={headerRef}
      className="ag-header overflow-hidden border-b border-gray-200 z-40 bg-gray-50 shrink-0 relative"
      style={{ 
        height: headerHeight, 
        overflowX: 'hidden', 
        fontSize: `${12 * zoom}px` 
      }}
    >
      <div style={{ 
        width: Math.max(totalWidth, containerRef.current?.clientWidth || 0) 
      }}>
        <div className="flex">
          {visibleColumns.map(column => (
            <div 
              key={column.field}
              className="ag-header-cell relative z-40"
              style={{ 
                width: getColumnWidth(column.field, column.width), 
                padding: `${Math.max(2, Math.round(2 * zoom))}px ${Math.max(4, Math.round(4 * zoom))}px` 
              }}
            >
              <GridHeader
                column={column}
                width={getColumnWidth(column.field, column.width)}
                onResize={onResize}
                onSort={onSort}
              />
              
              {column.filter && (
                <div 
                  className="absolute top-0 right-0 px-1" 
                  style={{ 
                    transform: `scale(${zoom})`, 
                    transformOrigin: 'top right', 
                    pointerEvents: 'auto' 
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <ColumnFilter
                    column={column}
                    data={rowData}
                    onFilterChange={onFilterChange}
                    currentFilter={filterModel[column.field]}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
