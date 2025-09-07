import React, { useMemo } from 'react';
import { useGridContext } from '../context/GridContext';

// Full-width compact status bar similar to AG Grid bottom bar
export const StatusBar: React.FC = () => {
  const { state } = useGridContext();
  const visibleCols = state.columnDefs.filter(c => !state.hiddenColumns.has(c.field)).length;
  const activeFiltersCount = Object.keys(state.filterModel).length;
  const selectedCount = state.selectedRows.size;

  const pivotStats = state.isPivotMode ? state.pivotConfiguration : null;

  const selectedAgg = useMemo(() => {
    if (selectedCount === 0) return null;
    // basic sum for profit & revenue if present
    const rows = Array.from(state.selectedRows).map(id => state.rowData[parseInt(id)]).filter(Boolean);
    const profitSum = rows.reduce((a,r)=> a + (parseFloat(r.profit)||0),0);
    const revenueSum = rows.reduce((a,r)=> a + (parseFloat(r.revenue)||0),0);
    return { profitSum, revenueSum };
  }, [selectedCount, state.selectedRows, state.rowData]);

  return (
    <div className="ag-status-bar flex items-center flex-wrap gap-x-6 gap-y-1 px-3 py-1 border-t border-gray-200 bg-gray-50 text-[11px] text-gray-600">
      <span className="font-medium">Rows: {state.rowData.length.toLocaleString()}</span>
      <span>Cols: {visibleCols}/{state.columnDefs.length}</span>
      {selectedCount > 0 && (
        <span className="text-blue-600">Selected: {selectedCount}</span>
      )}
      {activeFiltersCount > 0 && (
        <span className="text-orange-600">Filters: {activeFiltersCount}</span>
      )}
      {pivotStats && (
        <span className="text-purple-600">Pivot: RG {pivotStats.rowGroupCols.length} | P {pivotStats.pivotCols.length} | V {pivotStats.valueCols.length}</span>
      )}
      {selectedAgg && (
        <span className="text-green-600">Profit Σ ${selectedAgg.profitSum.toLocaleString()} / Rev Σ ${selectedAgg.revenueSum.toLocaleString()}</span>
      )}
    </div>
  );
};
