import React from 'react';
import { GridCell } from './GridCell';
import type { ColumnDef } from '../../types/grid';

interface VirtualRowData {
  rows: any[];
  columns: ColumnDef[];
  getColumnWidth: (colId: string, defaultWidth?: number) => number;
  onRowClick: (index: number) => void;
  onContextMenu: (e: React.MouseEvent, rowData?: any) => void;
  selectedRows: Set<string>;
  rowHeight: number;
  zoom: number;
}

interface DataGridVirtualRowProps {
  index: number;
  style: React.CSSProperties;
  data: VirtualRowData;
}

export const DataGridVirtualRow = React.memo<DataGridVirtualRowProps>(({ 
  index, 
  style, 
  data 
}) => {
  const { 
    rows, 
    columns, 
    getColumnWidth, 
    onRowClick, 
    onContextMenu, 
    selectedRows, 
    rowHeight, 
    zoom 
  } = data;
  
  const rowData = rows[index];
  const isSelected = selectedRows.has(index.toString());

  return (
    <div 
      style={style}
      className={`ag-row flex ${isSelected ? 'ag-row-selected' : ''} ${index % 2 === 0 ? '' : 'ag-row-odd'}`}
      onClick={() => onRowClick(index)}
      onContextMenu={(e) => onContextMenu(e, rowData)}
    >
      {columns.map((column: ColumnDef) => (
        <div 
          key={column.field}
          className="ag-cell"
          style={{ 
            width: getColumnWidth(column.field, column.width), 
            minWidth: getColumnWidth(column.field, column.width),
            height: rowHeight,
            lineHeight: `${rowHeight - 8}px`,
            fontSize: `${12 * zoom}px`,
            padding: `${Math.max(2, Math.round(2 * zoom))}px ${Math.max(4, Math.round(4 * zoom))}px`
          }}
        >
          <GridCell 
            column={column}
            data={rowData}
            rowIndex={index}
            value={rowData[column.field]}
            width={getColumnWidth(column.field, column.width)}
            isSelected={isSelected}
            onCellClick={() => {}}
            onRowSelect={() => {}}
          />
        </div>
      ))}
    </div>
  );
});

DataGridVirtualRow.displayName = 'DataGridVirtualRow';
