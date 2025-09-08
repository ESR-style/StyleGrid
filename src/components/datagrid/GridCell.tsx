import React from 'react';
import { useGridContext } from '../../context/GridContext';
import type { ColumnDef } from '../../types/grid';

interface GridCellProps {
  column: ColumnDef;
  data: any;
  rowIndex: number;
  value: any;
  width: number;
  isSelected: boolean;
  onCellClick: (column: ColumnDef, data: any, rowIndex: number, event: React.MouseEvent) => void;
  onRowSelect: (rowIndex: number) => void;
}

export const GridCell: React.FC<GridCellProps> = ({
  column,
  data,
  rowIndex,
  value,
  width,
  isSelected,
  onCellClick,
  onRowSelect,
}) => {
  const { state } = useGridContext();

  const handleClick = (e: React.MouseEvent) => {
    onCellClick(column, data, rowIndex, e);
  };

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRowSelect(rowIndex);
  };

  const renderCellContent = () => {
    if (column.cellRenderer) {
      const renderedContent = column.cellRenderer({
        value,
        data,
        node: {
          id: rowIndex.toString(),
          data,
          rowIndex,
          level: 0,
          selected: isSelected,
        },
        column,
        api: state as any,
      });
      
      if (typeof renderedContent === 'string') {
        return <div dangerouslySetInnerHTML={{ __html: renderedContent }} />;
      }
      return renderedContent;
    }

    if (column.valueFormatter) {
      return column.valueFormatter({
        value,
        data,
        node: {
          id: rowIndex.toString(),
          data,
          rowIndex,
          level: 0,
        },
        column,
      });
    }

    return String(value || '');
  };

  const getCellClass = () => {
    if (typeof column.cellClass === 'function') {
      return (column.cellClass as any)({ value, data, node: { id: rowIndex.toString(), data, rowIndex, level: 0 }, column });
    }
    return column.cellClass || '';
  };

  const cellClass = getCellClass();

  return (
    <div
      className={`
        flex items-center px-2 h-full border-r border-gray-200 cursor-pointer
        ${isSelected ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}
        ${cellClass}
      `}
      style={{ width }}
      onClick={handleClick}
    >
      {column.checkboxSelection && (
        <div className="mr-2" onClick={handleCheckboxChange}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}} // Handled by onClick
            className="rounded border-gray-300"
          />
        </div>
      )}
      
      <div className="flex-1 truncate text-sm">
        {renderCellContent()}
      </div>
    </div>
  );
};
