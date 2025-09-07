import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Plus, Minus, RefreshCw } from 'lucide-react';
// NOTE: Temporarily removed react-window usage due to broken import; using simple scroll list.
import { GridProvider, useGridContext } from '../context/GridContext';
import { GridHeader } from './GridHeader';
import { GridCell } from './GridCell';
import { ColumnFilter } from './ColumnFilter';
// Removed legacy GridSidebar usage for new DataAnalysis modal
import { StatusBar } from './StatusBar';
import { ContextMenu } from './ContextMenu';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { DataAnalysisModal } from './DataAnalysisModal';
import type { DataAnalysisConfig } from './DataAnalysisModal';
import type { GridOptions, ColumnDef, SortModel } from '../types/grid';

interface DataGridProps {
  options: GridOptions;
  className?: string;
}

export const DataGrid: React.FC<DataGridProps> = ({ options, className = '' }) => {
  return (
    <GridProvider options={options}>
  <div className={`ag-theme-alpine ag-grid-container h-full flex flex-1 flex-col min-h-0 ${className}`}>
        <GridContent />
      </div>
    </GridProvider>
  );
};

// Virtual row component optimized for performance
const VirtualRow = React.memo(({ index, style, data }: any) => {
  const { rows, columns, getColumnWidth, onRowClick, onContextMenu, selectedRows, rowHeight, zoom } = data;
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
            padding: `${Math.max(2, Math.round(2*zoom))}px ${Math.max(4, Math.round(4*zoom))}px`
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

VirtualRow.displayName = 'VirtualRow';

const GridContent: React.FC = () => {
  const { state, dispatch } = useGridContext();
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisConfig, setAnalysisConfig] = useState<DataAnalysisConfig | null>(null);
  const [analysisAggregates, setAnalysisAggregates] = useState<Record<string, number>>({});
  const [zoom, setZoom] = useState(1); // UI zoom (font + row height)
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    column?: ColumnDef;
    rowData?: any;
  } | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const listOuterRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Process data with filters, sorts, and grouping
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
          
          if (isNaN(cellValue) || filterValue === null || filterValue === undefined) return true;
          
          switch (condition) {
            case 'equals':
              return cellValue === filterValue;
            case 'notEquals':
              return cellValue !== filterValue;
            case 'greaterThan':
              return cellValue > filterValue;
            case 'greaterThanOrEqual':
              return cellValue >= filterValue;
            case 'lessThan':
              return cellValue < filterValue;
            case 'lessThanOrEqual':
              return cellValue <= filterValue;
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
      filteredData.sort((a, b) => {
        for (const sort of state.sortModel) {
          const column = state.columnDefs.find(col => col.field === sort.colId);
          if (!column) continue;

          let valueA = a[sort.colId];
          let valueB = b[sort.colId];

          // Use custom comparator if available
          if (column.comparator) {
            const result = column.comparator(valueA, valueB);
            if (result !== 0) {
              return sort.sort === 'asc' ? result : -result;
            }
            continue;
          }

          // Default comparison
          if (valueA === null || valueA === undefined) valueA = '';
          if (valueB === null || valueB === undefined) valueB = '';

          if (typeof valueA === 'string') valueA = valueA.toLowerCase();
          if (typeof valueB === 'string') valueB = valueB.toLowerCase();

          if (valueA < valueB) {
            return sort.sort === 'asc' ? -1 : 1;
          }
          if (valueA > valueB) {
            return sort.sort === 'asc' ? 1 : -1;
          }
        }
        return 0;
      });
    }

    return filteredData;
  }, [state.rowData, state.filterModel, state.sortModel, state.columnDefs]);

  // Compute analysis aggregates whenever config or data changes
  useEffect(() => {
    if (!analysisConfig) { setAnalysisAggregates({}); return; }
    const agg: Record<string, number> = {};
    for (const [field, type] of Object.entries(analysisConfig.aggregations)) {
      if (!type) continue;
      const values = processedData.map(r => parseFloat(r[field])).filter(v => !isNaN(v));
      if (values.length === 0) continue;
      switch (type) {
        case 'sum':
          agg[field] = values.reduce((a,b)=>a+b,0); break;
        case 'avg':
          agg[field] = values.reduce((a,b)=>a+b,0) / values.length; break;
        case 'min':
          agg[field] = Math.min(...values); break;
        case 'max':
          agg[field] = Math.max(...values); break;
        case 'count':
          agg[field] = values.length; break;
      }
    }
    // For contribution column ensure we have sum base
    if (analysisConfig.contributionColumn && !agg[analysisConfig.contributionColumn]) {
      const vals = processedData.map(r => parseFloat(r[analysisConfig.contributionColumn!])).filter(v => !isNaN(v));
      if (vals.length) {
        agg[analysisConfig.contributionColumn] = vals.reduce((a,b)=>a+b,0);
      }
    }
    setAnalysisAggregates(agg);
  }, [analysisConfig, processedData]);

  // Get visible columns in correct order
  const visibleColumns = useMemo(() => {
    const base = state.columnOrder
      .map(colId => state.columnDefs.find(col => col.field === colId))
      .filter((col): col is ColumnDef => col !== undefined && !state.hiddenColumns.has(col.field));
    if (analysisConfig) {
      let filtered = base.filter(c => analysisConfig.visibleColumns.includes(c.field));
      // Append contribution synthetic column
      if (analysisConfig.contributionColumn) {
        const contribField = analysisConfig.contributionColumn;
        const total = analysisAggregates[contribField];
        if (total && !isNaN(total)) {
          filtered = [
            ...filtered,
            {
              field: '__contribution__',
              headerName: '% of ' + (base.find(c=>c.field===contribField)?.headerName || contribField),
              width: 120,
              sortable: false,
              filter: false,
              resizable: true,
              valueFormatter: (p: any) => {
                const v = parseFloat(p.data?.[contribField]);
                if (isNaN(v) || !total) return '';
                return (v/total*100).toFixed(2) + '%';
              }
            } as ColumnDef
          ];
        }
      }
      return filtered;
    }
    return base;
  }, [state.columnDefs, state.columnOrder, state.hiddenColumns, analysisConfig, analysisAggregates, zoom]);

  const handleSort = useCallback((colId: string) => {
    const existingSort = state.sortModel.find(sort => sort.colId === colId);
    let newSortModel: SortModel[];
    if (!existingSort) {
      newSortModel = [...state.sortModel, { colId, sort: 'asc' }];
    } else if (existingSort.sort === 'asc') {
      newSortModel = state.sortModel.map(sort =>
        sort.colId === colId ? { ...sort, sort: 'desc' as const } : sort
      );
    } else {
      newSortModel = state.sortModel.filter(sort => sort.colId !== colId);
    }
    dispatch({ type: 'SET_SORT_MODEL', payload: newSortModel });
  }, [state.sortModel, dispatch]);

  // TRUE ZOOM: convert displayed width back to base width on resize
  const handleResize = useCallback((colId: string, displayedWidth: number) => {
    const baseWidth = Math.max(50, Math.round(displayedWidth / zoom));
    dispatch({ type: 'RESIZE_COLUMN', payload: { colId, width: baseWidth } });
  }, [dispatch, zoom]);

  const handlePin = useCallback((colId: string, pinned: 'left' | 'right' | null) => {
    dispatch({ type: 'PIN_COLUMN', payload: { colId, pinned } });
  }, [dispatch]);

  const handleHide = useCallback((colId: string) => {
    dispatch({ type: 'TOGGLE_COLUMN_VISIBILITY', payload: colId });
  }, [dispatch]);

  const handleFilterChange = useCallback((colId: string, filterValue: any) => {
    const newFilterModel = { ...state.filterModel };
    if (filterValue === null || filterValue === undefined || filterValue === '') {
      delete newFilterModel[colId];
    } else {
      newFilterModel[colId] = filterValue;
    }
    dispatch({ type: 'SET_FILTER_MODEL', payload: newFilterModel });
  }, [state.filterModel, dispatch]);

  const handleRowSelect = useCallback((rowIndex: number) => {
    dispatch({ type: 'TOGGLE_ROW_SELECTION', payload: rowIndex.toString() });
  }, [dispatch]);

  const handleContextMenu = useCallback((e: React.MouseEvent, rowData?: any) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      rowData
    });
  }, []);

  const getBaseWidth = useCallback((colId: string, defaultWidth: number = 150) => state.columnWidths[colId] || defaultWidth, [state.columnWidths]);
  const getColumnWidth = useCallback((colId: string, defaultWidth: number = 150) => Math.round(getBaseWidth(colId, defaultWidth) * zoom), [getBaseWidth, zoom]);

  // Calculate total width for horizontal scrolling
  const totalWidth = useMemo(() => {
    return visibleColumns.reduce((total, col) => total + getColumnWidth(col.field, col.width), 0);
  }, [visibleColumns, getColumnWidth]);

  // Sync horizontal scroll between header and virtualized body (react-window doesn't expose scrollLeft in its onScroll callback)
  useEffect(() => {
    const el = listOuterRef.current;
    if (!el) return;
    const sync = () => {
      if (headerRef.current) {
        headerRef.current.scrollLeft = el.scrollLeft;
      }
    };
    el.addEventListener('scroll', sync, { passive: true });
    return () => el.removeEventListener('scroll', sync);
  }, []);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Virtual list item data
  const scaledRowHeight = Math.max(18, Math.round(state.rowHeight * zoom));
  const itemData = useMemo(() => ({
    rows: processedData,
    columns: visibleColumns,
    getColumnWidth,
    onRowClick: handleRowSelect,
    onContextMenu: handleContextMenu,
    selectedRows: state.selectedRows,
    rowHeight: scaledRowHeight,
    zoom
  }), [processedData, visibleColumns, getColumnWidth, handleRowSelect, handleContextMenu, state.selectedRows, scaledRowHeight, zoom]);

  const baseHeaderHeight = 32; // base header height
  const headerHeight = Math.round(baseHeaderHeight * zoom);
  const toolbarHeight = 48; // top toolbar inside grid
  // Body will flex; no fixed constant height (enables fullscreen fill)

  return (
    <>
  <div className="flex-1 flex flex-col overflow-hidden bg-white relative min-h-0">
        {/* Toolbar */}
        <div className="ag-header flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50 shrink-0" style={{ height: toolbarHeight }}>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAnalysisOpen(true)}
              className="px-2 py-1 text-[11px] rounded bg-blue-600 text-white hover:bg-blue-700"
              title="Data Analysis"
            >
              Data Analysis
            </button>
            <span className="text-xs text-gray-600 font-medium">
              Showing {processedData.length} of {state.rowData.length} rows
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 border border-gray-300 rounded px-1 py-0.5 bg-white">
              <button
                onClick={() => setZoom(z => Math.max(0.6, parseFloat((z - 0.1).toFixed(2))))}
                className="p-1 hover:bg-gray-200 rounded"
                title="Zoom Out"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-[10px] w-10 text-center select-none">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(z => Math.min(1.8, parseFloat((z + 0.1).toFixed(2))))}
                className="p-1 hover:bg-gray-200 rounded"
                title="Zoom In"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1 hover:bg-gray-200 rounded"
                title="Reset Zoom"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
            <span className="text-xs text-gray-600">
              {state.selectedRows.size} selected
            </span>
            {state.selectedRows.size > 0 && (
              <button
                onClick={() => dispatch({ type: 'DESELECT_ALL_ROWS' })}
                className="text-xs text-blue-600 hover:underline"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>

  {/* Content area (logical scaling: widths, heights, font-size) */}
  <div className="flex flex-col flex-1 min-h-0">
        {/* Analysis summary bar */}
        {analysisConfig && Object.keys(analysisConfig.aggregations).length > 0 && (
          <div className="text-xs md:text-sm px-4 py-2 bg-indigo-50 border-b border-indigo-200 flex flex-wrap gap-x-6 gap-y-1 leading-snug">
            <span className="text-indigo-700 font-semibold pr-2">Aggregations:</span>
            {Object.entries(analysisConfig.aggregations).filter(([_,t])=>t).map(([field,type]) => {
              const val = analysisAggregates[field];
              const col = state.columnDefs.find(c=>c.field===field);
              if (val === undefined) return null;
              const label = (col?.headerName || field) + ' ' + type.toUpperCase();
              const formatted = ['sum','avg','min','max'].includes(type as any) ? val.toLocaleString(undefined,{maximumFractionDigits:2}) : val;
              return <span key={field} className="text-indigo-700 font-medium">{label}: <span className="font-semibold">{formatted}</span></span>;
            })}
            {analysisConfig.contributionColumn && analysisAggregates[analysisConfig.contributionColumn] !== undefined && (
              <span className="text-indigo-700">Total {(state.columnDefs.find(c=>c.field===analysisConfig.contributionColumn)?.headerName)||analysisConfig.contributionColumn}: {analysisAggregates[analysisConfig.contributionColumn].toLocaleString(undefined,{maximumFractionDigits:2})}</span>
            )}
          </div>
        )}

        {/* Header */}
        <div 
          ref={headerRef}
          className="ag-header overflow-hidden border-b border-gray-200 z-40 bg-gray-50 shrink-0 relative"
          style={{ height: headerHeight, overflowX: 'hidden', fontSize: `${12*zoom}px` }}
        >
          <div style={{ width: Math.max(totalWidth, containerRef.current?.clientWidth || 0) }}>
            <div className="flex">
              {visibleColumns.map(column => (
                <div 
                  key={column.field}
                  className="ag-header-cell relative z-40"
                  style={{ width: getColumnWidth(column.field, column.width), padding: `${Math.max(2, Math.round(2*zoom))}px ${Math.max(4, Math.round(4*zoom))}px` }}
                >
                  <GridHeader
                    column={column}
                    width={getColumnWidth(column.field, column.width)}
                    onResize={handleResize}
                    onSort={handleSort}
                    onPin={handlePin}
                    onHide={handleHide}
                  />
                  {column.filter && (
                    <div className="absolute top-0 right-0 px-1" style={{ transform: `scale(${zoom})`, transformOrigin: 'top right' }}>
                      <ColumnFilter
                        column={column}
                        data={state.rowData}
                        onFilterChange={handleFilterChange}
                        currentFilter={state.filterModel[column.field]}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Virtual Grid Body */}
        <div 
          ref={containerRef}
          className="flex-1 ag-center-cols-viewport min-h-0"
          style={{ }}
        >
          {processedData.length > 0 ? (
            <div
              ref={listOuterRef}
              style={{ height: '100%', overflow: 'auto', width: '100%' }}
              className="ag-body-viewport relative z-10 flex-1"
            >
              <div style={{ width: Math.max(totalWidth, containerRef.current?.clientWidth || 0), position: 'relative', zIndex: 10 }}>
                {processedData.map((_, index) => (
                  <VirtualRow
                    key={index}
                    index={index}
                    style={{ height: scaledRowHeight, width: '100%', display: 'flex' }}
                    data={itemData}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              No data to display
            </div>
          )}
        </div>

        {/* Loading overlay */}
        {state.loading && (
          <div className="ag-overlay-loading-wrapper">
            <div className="text-center">
              <div className="ag-loading-spinner mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading...</p>
            </div>
          </div>
        )}
  {/* Status Bar at bottom */}
  <div className="shrink-0"><StatusBar /></div>
        </div>{/* end zoom wrapper */}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          column={contextMenu.column}
          rowData={contextMenu.rowData}
          onClose={() => setContextMenu(null)}
          onAction={(action, data) => {
            console.log('Context menu action:', action, data);
            // Handle context menu actions here
          }}
        />
      )}

      {/* Data Analysis Modal */}
      <DataAnalysisModal
        isOpen={analysisOpen}
        onClose={() => setAnalysisOpen(false)}
        columns={state.columnDefs}
        initialConfig={analysisConfig}
        onApply={(cfg) => setAnalysisConfig(cfg)}
      />
    </>
  );
};
