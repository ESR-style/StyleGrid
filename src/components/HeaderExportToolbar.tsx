import React, { useMemo } from 'react';
import { useGridContext } from '../context/GridContext';
import { ExportToolbar } from './ExportToolbar';
import type { ColumnDef } from '../types/grid';

export const HeaderExportToolbar: React.FC = () => {
  const { state } = useGridContext();

  // Process data with filters, sorts (same logic as in DataGrid)
  const processedData = useMemo(() => {
    let filteredData = [...state.rowData];

    // Apply filters
    Object.entries(state.filterModel).forEach(([colId, filter]) => {
      if (!filter) return;

      const column = state.columnDefs.find(col => col.field === colId);
      if (!column) return;

      filteredData = filteredData.filter(row => {
        const value = row[colId];
        
        if (column.filterType === 'text') {
          const filterValue = (filter as any).value?.toLowerCase() || '';
          const cellValue = String(value || '').toLowerCase();
          const condition = (filter as any).condition || 'contains';
          
          switch (condition) {
            case 'contains':
              return cellValue.includes(filterValue);
            case 'equals':
              return cellValue === filterValue;
            case 'startsWith':
              return cellValue.startsWith(filterValue);
            case 'endsWith':
              return cellValue.endsWith(filterValue);
            case 'notContains':
              return !cellValue.includes(filterValue);
            default:
              return true;
          }
        }
        
        if (column.filterType === 'number') {
          const filterValue = (filter as any).value;
          const cellValue = parseFloat(value);
          const condition = (filter as any).condition || 'equals';
          
          if (isNaN(cellValue)) return true;
          
          switch (condition) {
            case 'equals':
              if (filterValue === null || filterValue === undefined) return true;
              return cellValue === filterValue;
            case 'notEquals':
              if (filterValue === null || filterValue === undefined) return true;
              return cellValue !== filterValue;
            case 'greaterThan':
              if (filterValue === null || filterValue === undefined) return true;
              return cellValue > filterValue;
            case 'greaterThanOrEqual':
              if (filterValue === null || filterValue === undefined) return true;
              return cellValue >= filterValue;
            case 'lessThan':
              if (filterValue === null || filterValue === undefined) return true;
              return cellValue < filterValue;
            case 'lessThanOrEqual':
              if (filterValue === null || filterValue === undefined) return true;
              return cellValue <= filterValue;
            case 'inRange':
              const fromValue = (filter as any).from;
              const toValue = (filter as any).to;
              if (fromValue === null && toValue === null) return true;
              if (fromValue !== null && toValue !== null) {
                return cellValue >= fromValue && cellValue <= toValue;
              }
              if (fromValue !== null) {
                return cellValue >= fromValue;
              }
              if (toValue !== null) {
                return cellValue <= toValue;
              }
              return true;
            default:
              return true;
          }
        }
        
        if (column.filterType === 'set') {
          const selectedValues = (filter as any).values || [];
          if (selectedValues.length === 0) return true;
          return selectedValues.includes(String(value || ''));
        }
        
        return true;
      });
    });

    // Apply sorting
    if (state.sortModel.length > 0) {
      const originalIndexMap = new Map<any, number>();
      state.rowData.forEach((row, idx) => originalIndexMap.set(row, idx));

      const isNumeric = (val: any) => {
        if (val === null || val === undefined || val === '') return false;
        if (typeof val === 'number') return !isNaN(val);
        if (typeof val === 'string') return !isNaN(Number(val.trim()));
        return false;
      };

      const toComparable = (val: any, column: ColumnDef | undefined) => {
        if (val === null || val === undefined) return null;
        if (val instanceof Date) return val.getTime();
        if (column?.filterType === 'date') {
          if (val instanceof Date) return val.getTime();
          const t = Date.parse(val);
          return isNaN(t) ? null : t;
        }
        if (typeof val === 'boolean') return val ? 1 : 0;
        if (isNumeric(val)) return Number(val);
        return String(val).toLowerCase();
      };

      filteredData.sort((a, b) => {
        for (const sort of state.sortModel) {
          const column = state.columnDefs.find(col => col.field === sort.colId);
          if (!column) continue;

          let rawA: any = column.valueGetter
            ? column.valueGetter({ data: a, node: { id: '', data: a, rowIndex: -1, level: 0 }, column })
            : a[sort.colId];
          let rawB: any = column.valueGetter
            ? column.valueGetter({ data: b, node: { id: '', data: b, rowIndex: -1, level: 0 }, column })
            : b[sort.colId];

          if (column.comparator) {
            const cmp = column.comparator(rawA, rawB);
            if (cmp !== 0) return sort.sort === 'asc' ? cmp : -cmp;
            continue;
          }

          const valueA = toComparable(rawA, column);
          const valueB = toComparable(rawB, column);

          const aNull = valueA === null || valueA === undefined;
          const bNull = valueB === null || valueB === undefined;
          if (aNull && bNull) continue;
          if (aNull && !bNull) return sort.sort === 'asc' ? 1 : -1;
          if (!aNull && bNull) return sort.sort === 'asc' ? -1 : 1;

          if (valueA! < valueB!) return sort.sort === 'asc' ? -1 : 1;
          if (valueA! > valueB!) return sort.sort === 'asc' ? 1 : -1;
        }
        const idxA = originalIndexMap.get(a) ?? 0;
        const idxB = originalIndexMap.get(b) ?? 0;
        return idxA - idxB;
      });
    }

    return filteredData;
  }, [state.rowData, state.filterModel, state.sortModel, state.columnDefs]);

  // Get visible columns in correct order
  const visibleColumns = useMemo(() => {
    return state.columnOrder
      .map(colId => state.columnDefs.find(col => col.field === colId))
      .filter((col): col is ColumnDef => col !== undefined && !state.hiddenColumns.has(col.field));
  }, [state.columnDefs, state.columnOrder, state.hiddenColumns]);

  return (
    <ExportToolbar 
      processedData={processedData}
      visibleColumns={visibleColumns}
      className="scale-90"
    />
  );
};
