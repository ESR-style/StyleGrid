import { useMemo } from 'react';
import type { ColumnDef, SortModel } from '../types/grid';

interface UseDataProcessingProps {
  rowData: any[];
  filterModel: Record<string, any>;
  sortModel: SortModel[];
  columnDefs: ColumnDef[];
}

export const useDataProcessing = ({
  rowData,
  filterModel,
  sortModel,
  columnDefs,
}: UseDataProcessingProps) => {
  const processedData = useMemo(() => {
    let filteredData = [...rowData];

    // Apply filters
    Object.entries(filterModel).forEach(([colId, filter]) => {
      if (!filter) return;

      const column = columnDefs.find(col => col.field === colId);
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

    // Apply sorting (stable, data-type aware, valueGetter aware, date & null handling)
    if (sortModel.length > 0) {
      // Map for stable sort fallback (original index)
      const originalIndexMap = new Map<any, number>();
      rowData.forEach((row, idx) => originalIndexMap.set(row, idx));

      const isNumeric = (val: any) => {
        if (val === null || val === undefined || val === '') return false;
        if (typeof val === 'number') return !isNaN(val);
        if (typeof val === 'string') return !isNaN(Number(val.trim()));
        return false;
      };

      const toComparable = (val: any, column: ColumnDef | undefined) => {
        if (val === null || val === undefined) return null;
        // Date handling: explicit date filterType OR Date instance
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
        for (const sort of sortModel) {
          const column = columnDefs.find(col => col.field === sort.colId);
          if (!column) continue;

          // Support valueGetter if provided
          let rawA: any = column.valueGetter
            ? column.valueGetter({ data: a, node: { id: '', data: a, rowIndex: -1, level: 0 }, column })
            : a[sort.colId];
          let rawB: any = column.valueGetter
            ? column.valueGetter({ data: b, node: { id: '', data: b, rowIndex: -1, level: 0 }, column })
            : b[sort.colId];

          // Custom comparator gets raw values
          if (column.comparator) {
            const cmp = column.comparator(rawA, rawB);
            if (cmp !== 0) return sort.sort === 'asc' ? cmp : -cmp;
            continue;
          }

          const valueA = toComparable(rawA, column);
          const valueB = toComparable(rawB, column);

          // Null / undefined ordering: always push nulls last in asc, first in desc
          const aNull = valueA === null || valueA === undefined;
          const bNull = valueB === null || valueB === undefined;
          if (aNull && bNull) continue;
          if (aNull && !bNull) return sort.sort === 'asc' ? 1 : -1;
          if (!aNull && bNull) return sort.sort === 'asc' ? -1 : 1;

          if (valueA! < valueB!) return sort.sort === 'asc' ? -1 : 1;
          if (valueA! > valueB!) return sort.sort === 'asc' ? 1 : -1;
          // else tie -> next sort instruction
        }
        // Stable fallback
        const idxA = originalIndexMap.get(a) ?? 0;
        const idxB = originalIndexMap.get(b) ?? 0;
        return idxA - idxB;
      });
    }

    return filteredData;
  }, [rowData, filterModel, sortModel, columnDefs]);

  return processedData;
};
