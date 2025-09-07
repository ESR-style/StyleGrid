import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import type { ColumnDef, GridOptions, GridApi, SortModel, FilterModel, PivotConfiguration, GroupConfiguration } from '../types/grid';

interface GridState {
  rowData: any[];
  originalRowData: any[];
  columnDefs: ColumnDef[];
  sortModel: SortModel[];
  filterModel: FilterModel;
  selectedRows: Set<string>;
  columnOrder: string[];
  columnWidths: Record<string, number>;
  pinnedColumns: Record<string, 'left' | 'right'>;
  hiddenColumns: Set<string>;
  groupConfiguration: GroupConfiguration;
  pivotConfiguration: PivotConfiguration;
  expandedGroups: Set<string>;
  isPivotMode: boolean;
  rowHeight: number;
  headerHeight: number;
  loading: boolean;
  error: string | null;
}

type GridAction =
  | { type: 'SET_ROW_DATA'; payload: any[] }
  | { type: 'SET_COLUMN_DEFS'; payload: ColumnDef[] }
  | { type: 'SET_SORT_MODEL'; payload: SortModel[] }
  | { type: 'SET_FILTER_MODEL'; payload: FilterModel }
  | { type: 'TOGGLE_ROW_SELECTION'; payload: string }
  | { type: 'SELECT_ALL_ROWS' }
  | { type: 'DESELECT_ALL_ROWS' }
  | { type: 'RESIZE_COLUMN'; payload: { colId: string; width: number } }
  | { type: 'REORDER_COLUMNS'; payload: string[] }
  | { type: 'PIN_COLUMN'; payload: { colId: string; pinned: 'left' | 'right' | null } }
  | { type: 'TOGGLE_COLUMN_VISIBILITY'; payload: string }
  | { type: 'SET_GROUP_CONFIGURATION'; payload: GroupConfiguration }
  | { type: 'SET_PIVOT_CONFIGURATION'; payload: PivotConfiguration }
  | { type: 'TOGGLE_GROUP_EXPANSION'; payload: string }
  | { type: 'TOGGLE_PIVOT_MODE'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: GridState = {
  rowData: [],
  originalRowData: [],
  columnDefs: [],
  sortModel: [],
  filterModel: {},
  selectedRows: new Set(),
  columnOrder: [],
  columnWidths: {},
  pinnedColumns: {},
  hiddenColumns: new Set(),
  groupConfiguration: { groupKeys: [], expandedGroups: new Set() },
  pivotConfiguration: { rowGroupCols: [], pivotCols: [], valueCols: [] },
  expandedGroups: new Set(),
  isPivotMode: false,
  rowHeight: 28,
  headerHeight: 32,
  loading: false,
  error: null,
};

function gridReducer(state: GridState, action: GridAction): GridState {
  switch (action.type) {
    case 'SET_ROW_DATA':
      return {
        ...state,
        rowData: action.payload,
        originalRowData: action.payload,
      };
    case 'SET_COLUMN_DEFS':
      return {
        ...state,
        columnDefs: action.payload,
        columnOrder: action.payload.map(col => col.field),
      };
    case 'SET_SORT_MODEL':
      return { ...state, sortModel: action.payload };
    case 'SET_FILTER_MODEL':
      return { ...state, filterModel: action.payload };
    case 'TOGGLE_ROW_SELECTION':
      const newSelectedRows = new Set(state.selectedRows);
      if (newSelectedRows.has(action.payload)) {
        newSelectedRows.delete(action.payload);
      } else {
        newSelectedRows.add(action.payload);
      }
      return { ...state, selectedRows: newSelectedRows };
    case 'SELECT_ALL_ROWS':
      return {
        ...state,
        selectedRows: new Set(state.rowData.map((_, index) => index.toString())),
      };
    case 'DESELECT_ALL_ROWS':
      return { ...state, selectedRows: new Set() };
    case 'RESIZE_COLUMN':
      return {
        ...state,
        columnWidths: {
          ...state.columnWidths,
          [action.payload.colId]: action.payload.width,
        },
      };
    case 'REORDER_COLUMNS':
      return { ...state, columnOrder: action.payload };
    case 'PIN_COLUMN':
      const newPinnedColumns = { ...state.pinnedColumns };
      if (action.payload.pinned) {
        newPinnedColumns[action.payload.colId] = action.payload.pinned;
      } else {
        delete newPinnedColumns[action.payload.colId];
      }
      return { ...state, pinnedColumns: newPinnedColumns };
    case 'TOGGLE_COLUMN_VISIBILITY':
      const newHiddenColumns = new Set(state.hiddenColumns);
      if (newHiddenColumns.has(action.payload)) {
        newHiddenColumns.delete(action.payload);
      } else {
        newHiddenColumns.add(action.payload);
      }
      return { ...state, hiddenColumns: newHiddenColumns };
    case 'SET_GROUP_CONFIGURATION':
      return { ...state, groupConfiguration: action.payload };
    case 'SET_PIVOT_CONFIGURATION':
      return { ...state, pivotConfiguration: action.payload };
    case 'TOGGLE_GROUP_EXPANSION':
      const newExpandedGroups = new Set(state.expandedGroups);
      if (newExpandedGroups.has(action.payload)) {
        newExpandedGroups.delete(action.payload);
      } else {
        newExpandedGroups.add(action.payload);
      }
      return { ...state, expandedGroups: newExpandedGroups };
    case 'TOGGLE_PIVOT_MODE':
      return { ...state, isPivotMode: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

interface GridContextType {
  state: GridState;
  dispatch: React.Dispatch<GridAction>;
  api: GridApi;
}

const GridContext = createContext<GridContextType | null>(null);

export const useGridContext = () => {
  const context = useContext(GridContext);
  if (!context) {
    throw new Error('useGridContext must be used within a GridProvider');
  }
  return context;
};

interface GridProviderProps {
  children: React.ReactNode;
  options: GridOptions;
}

export const GridProvider: React.FC<GridProviderProps> = ({ children, options }) => {
  const [state, dispatch] = useReducer(gridReducer, {
    ...initialState,
    columnDefs: options.columnDefs,
    rowData: options.rowData,
    originalRowData: options.rowData,
    columnOrder: options.columnDefs.map(col => col.field),
    rowHeight: options.rowHeight || 28,
    headerHeight: options.headerHeight || 32,
  });

  const apiRef = useRef<GridApi | null>(null);

  const api: GridApi = {
    setRowData: useCallback((rowData: any[]) => {
      dispatch({ type: 'SET_ROW_DATA', payload: rowData });
    }, []),

    getSelectedRows: useCallback(() => {
      return Array.from(state.selectedRows).map(rowId => state.rowData[parseInt(rowId)]);
    }, [state.selectedRows, state.rowData]),

    getSelectedNodes: useCallback(() => {
      return Array.from(state.selectedRows).map(rowId => ({
        id: rowId,
        data: state.rowData[parseInt(rowId)],
        rowIndex: parseInt(rowId),
        level: 0,
        selected: true,
      }));
    }, [state.selectedRows, state.rowData]),

    selectAll: useCallback(() => {
      dispatch({ type: 'SELECT_ALL_ROWS' });
    }, []),

    deselectAll: useCallback(() => {
      dispatch({ type: 'DESELECT_ALL_ROWS' });
    }, []),

    exportDataAsCsv: useCallback((_params?: any) => {
      const csvContent = generateCSV(state.rowData, state.columnDefs);
      downloadFile(csvContent, 'data.csv', 'text/csv');
    }, [state.rowData, state.columnDefs]),

    exportDataAsExcel: useCallback((_params?: any) => {
      // For now, export as CSV with .xlsx extension
      const csvContent = generateCSV(state.rowData, state.columnDefs);
      downloadFile(csvContent, 'data.xlsx', 'text/csv');
    }, [state.rowData, state.columnDefs]),

    setSortModel: useCallback((sortModel: SortModel[]) => {
      dispatch({ type: 'SET_SORT_MODEL', payload: sortModel });
    }, []),

    getSortModel: useCallback(() => {
      return state.sortModel;
    }, [state.sortModel]),

    setFilterModel: useCallback((filterModel: any) => {
      dispatch({ type: 'SET_FILTER_MODEL', payload: filterModel });
    }, []),

    getFilterModel: useCallback(() => {
      return state.filterModel;
    }, [state.filterModel]),

    onFilterChanged: useCallback(() => {
      // Trigger filter processing
      if (apiRef.current) {
        options.onFilterChanged?.({ api: apiRef.current });
      }
    }, [options]),

    sizeColumnsToFit: useCallback(() => {
      // Auto-size columns to fit container
      const container = document.querySelector('.ag-grid-container');
      if (container) {
        const containerWidth = container.clientWidth;
        const totalCols = state.columnDefs.filter(col => !state.hiddenColumns.has(col.field)).length;
        const avgWidth = Math.max(containerWidth / totalCols, 100);
        
        state.columnDefs.forEach(col => {
          if (!state.hiddenColumns.has(col.field)) {
            dispatch({ type: 'RESIZE_COLUMN', payload: { colId: col.field, width: avgWidth } });
          }
        });
      }
    }, [state.columnDefs, state.hiddenColumns]),

    autoSizeColumns: useCallback((colKeys: string[]) => {
      // Auto-size specific columns based on content
      colKeys.forEach(colKey => {
        const maxWidth = calculateColumnWidth(state.rowData, colKey);
        dispatch({ type: 'RESIZE_COLUMN', payload: { colId: colKey, width: maxWidth } });
      });
    }, [state.rowData]),

    setColumnVisible: useCallback((colKey: string, visible: boolean) => {
      if (!visible && !state.hiddenColumns.has(colKey)) {
        dispatch({ type: 'TOGGLE_COLUMN_VISIBILITY', payload: colKey });
      } else if (visible && state.hiddenColumns.has(colKey)) {
        dispatch({ type: 'TOGGLE_COLUMN_VISIBILITY', payload: colKey });
      }
    }, [state.hiddenColumns]),

    setColumnPinned: useCallback((colKey: string, pinned: 'left' | 'right' | null) => {
      dispatch({ type: 'PIN_COLUMN', payload: { colId: colKey, pinned } });
    }, []),

    moveColumn: useCallback((key: string, toIndex: number) => {
      const newOrder = [...state.columnOrder];
      const fromIndex = newOrder.indexOf(key);
      newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, key);
      dispatch({ type: 'REORDER_COLUMNS', payload: newOrder });
    }, [state.columnOrder]),

    showLoadingOverlay: useCallback(() => {
      dispatch({ type: 'SET_LOADING', payload: true });
    }, []),

    hideOverlay: useCallback(() => {
      dispatch({ type: 'SET_LOADING', payload: false });
    }, []),

    refreshCells: useCallback(() => {
      // Force re-render of cells
      dispatch({ type: 'SET_ROW_DATA', payload: [...state.rowData] });
    }, [state.rowData]),

    redrawRows: useCallback(() => {
      // Force re-render of rows
      dispatch({ type: 'SET_ROW_DATA', payload: [...state.rowData] });
    }, [state.rowData]),

    expandAll: useCallback(() => {
      const allGroupKeys = new Set<string>();
      // Add logic to find all group keys
      dispatch({ type: 'SET_GROUP_CONFIGURATION', payload: {
        ...state.groupConfiguration,
        expandedGroups: allGroupKeys
      }});
    }, [state.groupConfiguration]),

    collapseAll: useCallback(() => {
      dispatch({ type: 'SET_GROUP_CONFIGURATION', payload: {
        ...state.groupConfiguration,
        expandedGroups: new Set()
      }});
    }, [state.groupConfiguration]),
  };

  apiRef.current = api;

  useEffect(() => {
    options.onGridReady?.({ api });
  }, [api, options]);

  const contextValue: GridContextType = {
    state,
    dispatch,
    api,
  };

  return <GridContext.Provider value={contextValue}>{children}</GridContext.Provider>;
};

// Helper functions
function generateCSV(data: any[], columns: ColumnDef[]): string {
  const headers = columns.map(col => col.headerName || col.field).join(',');
  const rows = data.map(row => 
    columns.map(col => {
      let value = row[col.field];
      if (col.valueFormatter) {
        value = col.valueFormatter({ value, data: row, node: null as any, column: col });
      }
      return `"${String(value || '').replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [headers, ...rows].join('\n');
}

function downloadFile(content: string, filename: string, contentType: string): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function calculateColumnWidth(data: any[], field: string): number {
  const maxLength = Math.max(
    field.length,
    ...data.slice(0, 100).map(row => String(row[field] || '').length)
  );
  return Math.min(Math.max(maxLength * 8 + 20, 100), 300);
}
