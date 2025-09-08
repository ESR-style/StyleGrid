import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { GridProvider, useGridContext } from '../../context/GridContext';
import { DataGridToolbar } from './DataGridToolbar';
import { DataGridHeader } from './DataGridHeader';
import { DataGridBody } from './DataGridBody';
import { DataGridAnalysisSummary } from './DataGridAnalysisSummary';
import { StatusBar } from './StatusBar';
import { ChartsPanel } from '../ChartsPanel';
import { ContextMenu } from './ContextMenu';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useDataProcessing } from '../../hooks/useDataProcessing';
import { useVisibleColumns } from '../../hooks/useVisibleColumns';
import { useAnalysisAggregates } from '../../hooks/useAnalysisAggregates';
import { DataAnalysisModal } from './DataAnalysisModal';
import type { DataAnalysisConfig } from './DataAnalysisModal';
import type { GridOptions, ColumnDef, SortModel } from '../../types/grid';

interface DataGridProps {
  options: GridOptions;
  className?: string;
}

export const DataGrid: React.FC<DataGridProps> = ({ options, className = '' }) => {
  return (
    <GridProvider options={options}>
      <div className={`ag-theme-alpine ag-grid-container h-full flex flex-1 flex-col ${className}`} style={{ height: '100vh', overflow: 'auto' }}>
        <GridContent />
      </div>
    </GridProvider>
  );
};

const GridContent: React.FC = () => {
  const { state, dispatch } = useGridContext();
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [chartsOpen, setChartsOpen] = useState(false);
  const [analysisConfig, setAnalysisConfig] = useState<DataAnalysisConfig | null>(null);
  const [zoom, setZoom] = useState(1);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    column?: ColumnDef;
    rowData?: any;
  } | null>(null);
  const [headerScrollLeft, setHeaderScrollLeft] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Debug log for charts state
  console.log('Charts open state:', chartsOpen);

  // Chart toggle handler (functional to avoid stale closure + single point logging)
  const handleChartsToggle = useCallback(() => {
    setChartsOpen(prev => {
      const next = !prev;
      console.log('[Charts] toggled ->', next);
      return next;
    });
  }, []);

  // Process data with filters and sorting
  const processedData = useDataProcessing({
    rowData: state.rowData,
    filterModel: state.filterModel,
    sortModel: state.sortModel,
    columnDefs: state.columnDefs,
  });

  // Compute analysis aggregates
  const analysisAggregates = useAnalysisAggregates({
    analysisConfig,
    processedData,
  });

  // Get visible columns
  const visibleColumns = useVisibleColumns({
    columnDefs: state.columnDefs,
    columnOrder: state.columnOrder,
    hiddenColumns: state.hiddenColumns,
    analysisConfig,
    analysisAggregates,
  });

  const handleSort = useCallback((colId: string, multi?: boolean) => {
    const existingSort = state.sortModel.find(s => s.colId === colId);
    let newSortModel: SortModel[] = [];

    if (multi) {
      // Multi-sort (Shift): toggle cycle asc -> desc -> remove, always move to front for priority
      if (!existingSort) {
        newSortModel = [{ colId, sort: 'asc' as const }, ...state.sortModel];
      } else if (existingSort.sort === 'asc') {
        newSortModel = state.sortModel.map(s => s.colId === colId ? { ...s, sort: 'desc' as const } : s)
          .filter(Boolean);
        // Move updated column to front
        const updated = newSortModel.find(s => s.colId === colId)!;
        newSortModel = [updated, ...newSortModel.filter(s => s.colId !== colId)];
      } else {
        // remove
        newSortModel = state.sortModel.filter(s => s.colId !== colId);
      }
    } else {
      // Single column mode (no Shift): cycle asc -> desc -> none
      if (!existingSort) {
        newSortModel = [{ colId, sort: 'asc' }];
      } else if (existingSort.sort === 'asc') {
        newSortModel = [{ colId, sort: 'desc' }];
      } else {
        newSortModel = [];
      }
    }

    dispatch({ type: 'SET_SORT_MODEL', payload: newSortModel });
  }, [state.sortModel, dispatch]);

  // TRUE ZOOM: convert displayed width back to base width on resize
  const handleResize = useCallback((colId: string, displayedWidth: number) => {
    const baseWidth = Math.max(50, Math.round(displayedWidth / zoom));
    dispatch({ type: 'RESIZE_COLUMN', payload: { colId, width: baseWidth } });
  }, [dispatch, zoom]);

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

  const getBaseWidth = useCallback((colId: string, defaultWidth: number = 150) => 
    state.columnWidths[colId] || defaultWidth, [state.columnWidths]);
  
  const getColumnWidth = useCallback((colId: string, defaultWidth: number = 150) => 
    Math.round(getBaseWidth(colId, defaultWidth) * zoom), [getBaseWidth, zoom]);

  // Calculate total width for horizontal scrolling
  const totalWidth = useMemo(() => {
    return visibleColumns.reduce((total, col) => total + getColumnWidth(col.field, col.width), 0);
  }, [visibleColumns, getColumnWidth]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Virtual list calculations
  const scaledRowHeight = Math.max(18, Math.round(state.rowHeight * zoom));

  return (
    <>
      <div className="flex-1 flex flex-col bg-white relative" style={{ minHeight: '100%' }}>
        {/* Toolbar */}
        <DataGridToolbar
          chartsOpen={chartsOpen}
          onChartsToggle={handleChartsToggle}
          onAnalysisOpen={() => setAnalysisOpen(true)}
          processedDataLength={processedData.length}
          totalDataLength={state.rowData.length}
          zoom={zoom}
          onZoomChange={setZoom}
          selectedRowsCount={state.selectedRows.size}
          onClearSelection={() => dispatch({ type: 'DESELECT_ALL_ROWS' })}
        />

        {/* Charts Panel */}
        <ChartsPanel open={chartsOpen} onClose={() => setChartsOpen(false)} />

        {/* Content area */}
        <div className="flex flex-col flex-1 overflow-auto">
          {/* Analysis summary bar */}
          <DataGridAnalysisSummary
            analysisConfig={analysisConfig}
            analysisAggregates={analysisAggregates}
            columnDefs={state.columnDefs}
          />

          {/* Header */}
          <DataGridHeader
            visibleColumns={visibleColumns}
            getColumnWidth={getColumnWidth}
            totalWidth={totalWidth}
            containerRef={containerRef}
            zoom={zoom}
            onResize={handleResize}
            onSort={handleSort}
            onFilterChange={handleFilterChange}
            filterModel={state.filterModel}
            rowData={state.rowData}
            scrollLeft={headerScrollLeft}
          />

          {/* Grid Body */}
          <DataGridBody
            processedData={processedData}
            visibleColumns={visibleColumns}
            getColumnWidth={getColumnWidth}
            onRowSelect={handleRowSelect}
            onContextMenu={handleContextMenu}
            selectedRows={state.selectedRows}
            scaledRowHeight={scaledRowHeight}
            zoom={zoom}
            totalWidth={totalWidth}
            containerRef={containerRef}
            onScroll={setHeaderScrollLeft}
          />

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
        </div>
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
