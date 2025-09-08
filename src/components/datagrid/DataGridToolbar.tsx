import React from 'react';
import { Plus, Minus, RefreshCw, BarChart3 } from 'lucide-react';

interface DataGridToolbarProps {
  chartsOpen: boolean;
  onChartsToggle: () => void;
  onAnalysisOpen: () => void;
  processedDataLength: number;
  totalDataLength: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  selectedRowsCount: number;
  onClearSelection: () => void;
}

export const DataGridToolbar: React.FC<DataGridToolbarProps> = ({
  chartsOpen,
  onChartsToggle,
  onAnalysisOpen,
  processedDataLength,
  totalDataLength,
  zoom,
  onZoomChange,
  selectedRowsCount,
  onClearSelection,
}) => {
  const handleZoomOut = () => {
    onZoomChange(Math.max(0.6, parseFloat((zoom - 0.1).toFixed(2))));
  };

  const handleZoomIn = () => {
    onZoomChange(Math.min(1.8, parseFloat((zoom + 0.1).toFixed(2))));
  };

  const handleZoomReset = () => {
    onZoomChange(1);
  };

  return (
    <div className="ag-header flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50 shrink-0" style={{ height: 48 }}>
      <div className="flex items-center gap-3 whitespace-nowrap overflow-visible">
        {/* Charts toggle */}
        <button
          onClick={onChartsToggle}
          aria-pressed={chartsOpen}
          className={`flex items-center gap-1 px-3 py-1 text-[11px] rounded font-semibold transition-colors border shadow-sm ${
            chartsOpen 
              ? 'bg-green-600 border-green-700 text-white' 
              : 'bg-white border-indigo-300 text-indigo-700 hover:bg-indigo-50'
          }`}
          title={chartsOpen ? 'Hide Charts Panel' : 'Show Charts Panel'}
        >
          <BarChart3 className="w-3 h-3" />
          {chartsOpen ? 'Hide Charts' : 'Show Charts'}
        </button>

        {/* Analysis button */}
        <button
          onClick={onAnalysisOpen}
          className="px-2 py-1 text-[11px] rounded bg-blue-600 text-white hover:bg-blue-700"
          title="Data Analysis"
        >
          Data Analysis
        </button>

        <span className="text-xs text-gray-600 font-medium">
          Showing {processedDataLength} of {totalDataLength} rows
        </span>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 border border-gray-300 rounded px-1 py-0.5 bg-white">
          <button
            onClick={handleZoomOut}
            className="p-1 hover:bg-gray-200 rounded"
            title="Zoom Out"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-[10px] w-10 text-center select-none">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 hover:bg-gray-200 rounded"
            title="Zoom In"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            onClick={handleZoomReset}
            className="p-1 hover:bg-gray-200 rounded"
            title="Reset Zoom"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        <span className="text-xs text-gray-600">
          {selectedRowsCount} selected
        </span>

        {selectedRowsCount > 0 && (
          <button
            onClick={onClearSelection}
            className="text-xs text-blue-600 hover:underline"
          >
            Clear selection
          </button>
        )}
      </div>
    </div>
  );
};
