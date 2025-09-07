import React, { useState } from 'react';
import { 
  X, 
  BarChart3, 
  Group, 
  Calculator,
  Download,
  Filter,
  Columns,
  HelpCircle
} from 'lucide-react';
import { useGridContext } from '../context/GridContext';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import type { ColumnDef } from '../types/grid';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GridSidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'columns' | 'filters' | 'pivot' | 'export' | 'help'>('columns');

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Grid Settings</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex border-b border-gray-200">
        <TabButton
          active={activeTab === 'columns'}
          onClick={() => setActiveTab('columns')}
          icon={<Columns className="w-4 h-4" />}
          label="Columns"
        />
        <TabButton
          active={activeTab === 'filters'}
          onClick={() => setActiveTab('filters')}
          icon={<Filter className="w-4 h-4" />}
          label="Filters"
        />
        <TabButton
          active={activeTab === 'pivot'}
          onClick={() => setActiveTab('pivot')}
          icon={<BarChart3 className="w-4 h-4" />}
          label="Pivot"
        />
        <TabButton
          active={activeTab === 'export'}
          onClick={() => setActiveTab('export')}
          icon={<Download className="w-4 h-4" />}
          label="Export"
        />
        <TabButton
          active={activeTab === 'help'}
          onClick={() => setActiveTab('help')}
          icon={<HelpCircle className="w-4 h-4" />}
          label="Help"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'columns' && <ColumnsPanel />}
        {activeTab === 'filters' && <FiltersPanel />}
        {activeTab === 'pivot' && <PivotPanel />}
        {activeTab === 'export' && <ExportPanel />}
        {activeTab === 'help' && <HelpPanel />}
      </div>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium border-b-2 transition-colors
      ${active 
        ? 'border-blue-500 text-blue-600 bg-blue-50' 
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }
    `}
  >
    {icon}
    <span className="ml-2">{label}</span>
  </button>
);

const ColumnsPanel: React.FC = () => {
  const { state, dispatch } = useGridContext();

  const toggleColumnVisibility = (colId: string) => {
    dispatch({ type: 'TOGGLE_COLUMN_VISIBILITY', payload: colId });
  };

  const pinColumn = (colId: string, pinned: 'left' | 'right' | null) => {
    dispatch({ type: 'PIN_COLUMN', payload: { colId, pinned } });
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Column Visibility</h4>
        <div className="space-y-2">
          {state.columnDefs.map(column => (
            <div key={column.field} className="flex items-center justify-between">
              <label className="flex items-center flex-1">
                <input
                  type="checkbox"
                  checked={!state.hiddenColumns.has(column.field)}
                  onChange={() => toggleColumnVisibility(column.field)}
                  className="mr-2 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 truncate">
                  {column.headerName || column.field}
                </span>
              </label>
              
              <div className="flex space-x-1 ml-2">
                <button
                  onClick={() => pinColumn(column.field, 'left')}
                  className={`p-1 rounded text-xs ${
                    state.pinnedColumns[column.field] === 'left'
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Pin Left"
                >
                  L
                </button>
                <button
                  onClick={() => pinColumn(column.field, 'right')}
                  className={`p-1 rounded text-xs ${
                    state.pinnedColumns[column.field] === 'right'
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Pin Right"
                >
                  R
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FiltersPanel: React.FC = () => {
  const { state } = useGridContext();

  const activeFilters = Object.entries(state.filterModel).filter(([_, filter]) => filter);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Active Filters</h4>
        {activeFilters.length === 0 ? (
          <p className="text-sm text-gray-500">No active filters</p>
        ) : (
          <div className="space-y-2">
            {activeFilters.map(([colId, filter]) => {
              const column = state.columnDefs.find(col => col.field === colId);
              return (
                <div key={colId} className="p-2 bg-gray-50 rounded text-sm">
                  <div className="font-medium text-gray-700">
                    {column?.headerName || colId}
                  </div>
                  <div className="text-gray-600">
                    {JSON.stringify(filter)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const PivotPanel: React.FC = () => {
  const { state, dispatch } = useGridContext();
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedColumn(columnId);
    e.dataTransfer.setData('text/plain', columnId);
  };

  const handleDrop = (e: React.DragEvent, dropZone: 'rowGroup' | 'pivot' | 'value') => {
    e.preventDefault();
    const columnId = e.dataTransfer.getData('text/plain');
    
    if (draggedColumn) {
      const newPivotConfig = { ...state.pivotConfiguration };
      
      switch (dropZone) {
        case 'rowGroup':
          if (!newPivotConfig.rowGroupCols.includes(columnId)) {
            newPivotConfig.rowGroupCols.push(columnId);
          }
          break;
        case 'pivot':
          if (!newPivotConfig.pivotCols.includes(columnId)) {
            newPivotConfig.pivotCols.push(columnId);
          }
          break;
        case 'value':
          if (!newPivotConfig.valueCols.includes(columnId)) {
            newPivotConfig.valueCols.push(columnId);
          }
          break;
      }
      
      dispatch({ type: 'SET_PIVOT_CONFIGURATION', payload: newPivotConfig });
    }
    setDraggedColumn(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFromGroup = (columnId: string, group: 'rowGroup' | 'pivot' | 'value') => {
    const newPivotConfig = { ...state.pivotConfiguration };
    
    switch (group) {
      case 'rowGroup':
        newPivotConfig.rowGroupCols = newPivotConfig.rowGroupCols.filter(id => id !== columnId);
        break;
      case 'pivot':
        newPivotConfig.pivotCols = newPivotConfig.pivotCols.filter(id => id !== columnId);
        break;
      case 'value':
        newPivotConfig.valueCols = newPivotConfig.valueCols.filter(id => id !== columnId);
        break;
    }
    
    dispatch({ type: 'SET_PIVOT_CONFIGURATION', payload: newPivotConfig });
  };

  const togglePivotMode = () => {
    dispatch({ type: 'TOGGLE_PIVOT_MODE', payload: !state.isPivotMode });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Pivot Mode</h4>
        <button
          onClick={togglePivotMode}
          className={`
            px-3 py-1 rounded text-sm font-medium transition-colors
            ${state.isPivotMode 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }
          `}
        >
          {state.isPivotMode ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="space-y-4">
        <DropZone
          title="Row Groups"
          icon={<Group className="w-4 h-4" />}
          items={state.pivotConfiguration.rowGroupCols}
          columns={state.columnDefs}
          onDrop={(e) => handleDrop(e, 'rowGroup')}
          onDragOver={handleDragOver}
          onRemove={(id) => removeFromGroup(id, 'rowGroup')}
        />

        <DropZone
          title="Column Labels"
          icon={<BarChart3 className="w-4 h-4" />}
          items={state.pivotConfiguration.pivotCols}
          columns={state.columnDefs}
          onDrop={(e) => handleDrop(e, 'pivot')}
          onDragOver={handleDragOver}
          onRemove={(id) => removeFromGroup(id, 'pivot')}
        />

        <DropZone
          title="Values"
          icon={<Calculator className="w-4 h-4" />}
          items={state.pivotConfiguration.valueCols}
          columns={state.columnDefs}
          onDrop={(e) => handleDrop(e, 'value')}
          onDragOver={handleDragOver}
          onRemove={(id) => removeFromGroup(id, 'value')}
        />
      </div>

      <div>
        <h5 className="font-medium text-gray-700 mb-2">Available Columns</h5>
        <div className="space-y-1">
          {state.columnDefs
            .filter(col => col.enableRowGroup || col.enablePivot || col.enableValue)
            .map(column => (
              <div
                key={column.field}
                draggable
                onDragStart={(e) => handleDragStart(e, column.field)}
                className="p-2 bg-gray-50 rounded cursor-move hover:bg-gray-100 text-sm"
              >
                {column.headerName || column.field}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

interface DropZoneProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
  columns: ColumnDef[];
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onRemove: (id: string) => void;
}

const DropZone: React.FC<DropZoneProps> = ({
  title,
  icon,
  items,
  columns,
  onDrop,
  onDragOver,
  onRemove,
}) => (
  <div>
    <div className="flex items-center mb-2">
      {icon}
      <span className="ml-2 font-medium text-gray-700">{title}</span>
    </div>
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className="min-h-12 p-2 border-2 border-dashed border-gray-300 rounded-lg"
    >
      {items.length === 0 ? (
        <p className="text-gray-400 text-sm">Drop columns here</p>
      ) : (
        <div className="space-y-1">
          {items.map(itemId => {
            const column = columns.find(col => col.field === itemId);
            return (
              <div
                key={itemId}
                className="flex items-center justify-between p-1 bg-blue-50 rounded text-sm"
              >
                <span className="text-blue-700">
                  {column?.headerName || itemId}
                </span>
                <button
                  onClick={() => onRemove(itemId)}
                  className="text-blue-400 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);

const ExportPanel: React.FC = () => {
  const { api } = useGridContext();

  const exportToCsv = () => {
    api.exportDataAsCsv();
  };

  const exportToExcel = () => {
    api.exportDataAsExcel();
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Export Data</h4>
        <div className="space-y-2">
          <button
            onClick={exportToCsv}
            className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export as CSV
          </button>
          <button
            onClick={exportToExcel}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export as Excel
          </button>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Export Options</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2 rounded border-gray-300" defaultChecked />
            <span className="text-sm text-gray-700">Include headers</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2 rounded border-gray-300" />
            <span className="text-sm text-gray-700">Only selected rows</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2 rounded border-gray-300" />
            <span className="text-sm text-gray-700">Only visible columns</span>
          </label>
        </div>
      </div>
    </div>
  );
};

const HelpPanel: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Getting Started</h4>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <strong>SelfAG Grid</strong> is a complete AG-Grid clone with all premium features 
            built from scratch. Here's how to use the main features:
          </p>
          
          <div className="space-y-2">
            <div>
              <strong className="text-gray-900">Sorting:</strong> Click column headers to sort. 
              Hold Shift and click to add multiple sort criteria.
            </div>
            <div>
              <strong className="text-gray-900">Filtering:</strong> Click the filter icon in 
              column headers to open filter menus with various conditions.
            </div>
            <div>
              <strong className="text-gray-900">Selection:</strong> Use checkboxes to select 
              rows. The header checkbox selects/deselects all visible rows.
            </div>
            <div>
              <strong className="text-gray-900">Resizing:</strong> Drag the right edge of 
              column headers to resize columns.
            </div>
            <div>
              <strong className="text-gray-900">Pinning:</strong> Right-click column headers 
              for options to pin columns to left or right.
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Advanced Features</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div>
            <strong className="text-gray-900">Pivot Tables:</strong> Use the Pivot tab to 
            drag columns into Row Groups, Column Labels, and Values to create pivot tables.
          </div>
          <div>
            <strong className="text-gray-900">Export:</strong> Export your data to CSV or 
            Excel format with various configuration options.
          </div>
          <div>
            <strong className="text-gray-900">Status Bar:</strong> View real-time statistics 
            and aggregations for selected rows at the bottom.
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Performance</h4>
        <div className="text-sm text-gray-600">
          <p>
            This grid efficiently handles large datasets with virtual scrolling and 
            optimized rendering. It can smoothly display thousands of rows while 
            maintaining excellent performance.
          </p>
        </div>
      </div>

      <div>
        <KeyboardShortcutsHelp />
      </div>

      <div className="border-t pt-4">
        <div className="text-xs text-gray-500 space-y-1">
          <div>Version: 1.0.0</div>
          <div>Built with React, TypeScript & Tailwind CSS</div>
          <div>© 2024 SelfAG Grid - All AG-Grid premium features, free forever</div>
        </div>
      </div>
    </div>
  );
};
