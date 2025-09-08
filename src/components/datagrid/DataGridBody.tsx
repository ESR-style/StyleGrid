import React, { useRef, useEffect } from 'react';
import { DataGridVirtualRow } from './DataGridVirtualRow';
import type { ColumnDef } from '../../types/grid';

interface DataGridBodyProps {
  processedData: any[];
  visibleColumns: ColumnDef[];
  getColumnWidth: (colId: string, defaultWidth?: number) => number;
  onRowSelect: (index: number) => void;
  onContextMenu: (e: React.MouseEvent, rowData?: any) => void;
  selectedRows: Set<string>;
  scaledRowHeight: number;
  zoom: number;
  totalWidth: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onScroll?: (scrollLeft: number) => void;
}

export const DataGridBody: React.FC<DataGridBodyProps> = ({
  processedData,
  visibleColumns,
  getColumnWidth,
  onRowSelect,
  onContextMenu,
  selectedRows,
  scaledRowHeight,
  zoom,
  totalWidth,
  containerRef,
  onScroll,
}) => {
  const listOuterRef = useRef<HTMLDivElement | null>(null);

  // Sync horizontal scroll
  useEffect(() => {
    const el = listOuterRef.current;
    if (!el || !onScroll) return;
    
    const handleScroll = () => {
      onScroll(el.scrollLeft);
    };
    
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [onScroll]);

  // Virtual list item data
  const itemData = {
    rows: processedData,
    columns: visibleColumns,
    getColumnWidth,
    onRowClick: onRowSelect,
    onContextMenu,
    selectedRows,
    rowHeight: scaledRowHeight,
    zoom
  };

  if (processedData.length === 0) {
    return (
      <div className="flex-1 ag-center-cols-viewport min-h-0">
        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
          No data to display
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 ag-center-cols-viewport min-h-0"
    >
      <div
        ref={listOuterRef}
        style={{ height: '100%', overflow: 'auto', width: '100%' }}
        className="ag-body-viewport relative z-10 flex-1"
      >
        <div style={{ 
          width: Math.max(totalWidth, containerRef.current?.clientWidth || 0), 
          position: 'relative', 
          zIndex: 10 
        }}>
          {processedData.map((_, index) => (
            <DataGridVirtualRow
              key={index}
              index={index}
              style={{ 
                height: scaledRowHeight, 
                width: '100%', 
                display: 'flex' 
              }}
              data={itemData}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
