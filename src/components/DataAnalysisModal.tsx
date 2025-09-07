import React, { useState, useMemo } from 'react';
import type { ColumnDef } from '../types/grid';

export type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'count';

interface DataAnalysisConfig {
  visibleColumns: string[];
  aggregations: Record<string, AggregationType>;
  contributionColumn?: string; // if set and exactly one numeric column chosen for contribution
}

interface DataAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnDef[];
  onApply: (config: DataAnalysisConfig) => void;
  initialConfig?: DataAnalysisConfig | null;
}

export const DataAnalysisModal: React.FC<DataAnalysisModalProps> = ({
  isOpen,
  onClose,
  columns,
  onApply,
  initialConfig
}) => {
  const numericColumns = useMemo(() => columns.filter(c => c.enableValue || c.filterType === 'number'), [columns]);
  const [selectedCols, setSelectedCols] = useState<string[]>(() => initialConfig?.visibleColumns || columns.map(c => c.field));
  const [aggregations, setAggregations] = useState<Record<string, AggregationType>>(() => initialConfig?.aggregations || {});
  const [contributionCol, setContributionCol] = useState<string | undefined>(initialConfig?.contributionColumn);

  if (!isOpen) return null;

  const toggleCol = (field: string) => {
    setSelectedCols(prev => prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]);
  };

  const setAgg = (field: string, agg: AggregationType) => {
    setAggregations(prev => ({ ...prev, [field]: agg }));
  };

  const apply = () => {
    const config: DataAnalysisConfig = {
      visibleColumns: selectedCols,
      aggregations,
      contributionColumn: contributionCol && selectedCols.includes(contributionCol) ? contributionCol : undefined
    };
    onApply(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-6 overflow-auto">
      <div className="bg-white w-full max-w-4xl rounded shadow-lg border border-gray-200 flex flex-col max-h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-800 text-sm">Data Analysis</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm">✕</button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-[11px] leading-snug text-blue-700">
            <strong className="font-semibold">How it works:</strong> 1) Choose which columns to show. 2) Pick aggregations for numeric columns to see a summary bar. 3) (Optional) Pick a contribution column to add a % of total column. Click Apply to update the grid. Re-open to adjust anytime.
          </div>
          <section>
            <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Visible Columns</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
              {columns.map(col => (
                <label key={col.field} className="flex items-center space-x-1 p-1 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCols.includes(col.field)}
                    onChange={() => toggleCol(col.field)}
                  />
                  <span className="truncate">{col.headerName || col.field}</span>
                </label>
              ))}
            </div>
          </section>
          <section>
            <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Aggregations</h3>
            {numericColumns.length === 0 && <div className="text-xs text-gray-500">No numeric columns available.</div>}
            <div className="space-y-2">
              {numericColumns.map(col => (
                <div key={col.field} className="flex items-center text-xs gap-2">
                  <span className="w-32 truncate text-gray-700">{col.headerName || col.field}</span>
                  <select
                    value={aggregations[col.field] || ''}
                    onChange={e => setAgg(col.field, e.target.value as AggregationType)}
                    className="border-gray-300 rounded px-2 py-1 text-xs"
                  >
                    <option value="">(none)</option>
                    <option value="sum">Sum</option>
                    <option value="avg">Average</option>
                    <option value="min">Min</option>
                    <option value="max">Max</option>
                    <option value="count">Count</option>
                  </select>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Row Contribution Column</h3>
            <div className="flex items-center gap-2 text-xs">
              <select
                value={contributionCol || ''}
                onChange={e => setContributionCol(e.target.value || undefined)}
                className="border-gray-300 rounded px-2 py-1 text-xs"
              >
                <option value="">(disabled)</option>
                {numericColumns.map(col => (
                  <option key={col.field} value={col.field}>{col.headerName || col.field}</option>
                ))}
              </select>
              <span className="text-gray-500">Adds % of total column</span>
            </div>
          </section>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
          <button onClick={onClose} className="text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-100">Cancel</button>
          <button onClick={apply} className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Apply</button>
        </div>
      </div>
    </div>
  );
};

export type { DataAnalysisConfig };