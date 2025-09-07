import { useState, useRef, useMemo } from 'react';
import { DataGridContent } from './components/DataGridContent';
import { HeaderExportToolbar } from './components/HeaderExportToolbar';
import { GridProvider } from './context/GridContext';
import { generateMockData, mockColumnDefs } from './data/mockData';
import type { GridOptions } from './types/grid';
import { Maximize2, Minimize2 } from 'lucide-react';

const DemoApp = () => {
  const [rowData] = useState(() => generateMockData(100)); // Reduced from 1000 to 100
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredRowData = useMemo(() => {
    return rowData.filter(r => statusFilter === 'All' ? true : r.status === statusFilter);
  }, [rowData, statusFilter]);

  const createGridOptions = (): GridOptions => {
    const options: GridOptions = {
      columnDefs: mockColumnDefs as any,
      rowData: filteredRowData,
      defaultColDef: {
        width: 150,
        resizable: true,
        sortable: true,
        filter: true,
      },
      enableSorting: true,
      enableFilter: true,
      enableColResize: true,
      enableRangeSelection: true,
      enableRowSelection: true,
      rowSelection: 'multiple',
      enableGrouping: true,
      enablePivot: true,
      animateRows: true,
      rowHeight: 32,
      headerHeight: 36,
      sideBar: true,
      statusBar: true,
      onGridReady: (params) => {
        console.log('Grid ready!', params);
      },
    };

    return options;
  };

  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    setFullscreen(f => !f);
  };

  return (
    <GridProvider key={statusFilter} options={createGridOptions()}>
      <div className={`flex flex-col ${fullscreen ? 'fixed inset-0 bg-gray-900 overflow-hidden' : 'min-h-screen bg-gray-100'}`}>
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 space-x-4 text-sm">
          <div className="flex items-center space-x-3">
            <HeaderExportToolbar />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Rows: {rowData.length}</span>
            <span className="text-gray-500">Cols: {mockColumnDefs.length}</span>
            <button
              onClick={toggleFullscreen}
              className="p-1 rounded hover:bg-gray-200"
              title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >{fullscreen ? <Minimize2 className="w-4 h-4"/> : <Maximize2 className="w-4 h-4"/>}</button>
          </div>
        </div>

      {/* Quick status filters */}
      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs">
        <span className="text-gray-600 font-medium">Status:</span>
        {['All','On Hold','In Transit','Completed','To Do'].map(s => (
          <button 
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-2 py-1 rounded border text-gray-700 hover:bg-blue-50 ${statusFilter===s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div ref={containerRef} className={`flex-1 ${fullscreen ? 'p-0' : 'p-4'} flex flex-col min-h-0`}>  
        <div 
          className={`bg-white border border-gray-300 ${fullscreen ? 'rounded-none flex-1' : 'rounded-md shadow-sm'} flex flex-col min-h-0`}
          style={!fullscreen ? { height: 600 } : undefined}
        >
          <div className="flex-1 min-h-0">
            <DataGridContent className="h-full" />
          </div>
        </div>
        </div>
      </div>
    </GridProvider>
  );
};

export default DemoApp;
