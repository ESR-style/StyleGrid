import { useState, useRef } from 'react';
import { DataGrid } from './components/DataGrid';
import { generateMockData, mockColumnDefs } from './data/mockData';
import type { GridOptions } from './types/grid';
import { Maximize2, Minimize2 } from 'lucide-react';

const DemoApp = () => {
  const [rowData] = useState(() => generateMockData(100)); // Reduced from 1000 to 100
  const [currentDemo, setCurrentDemo] = useState<'default' | 'pivot' | 'financial' | 'sales'>('default');

  const createDemoOptions = (demoType: string): GridOptions => {
    const baseOptions: GridOptions = {
      columnDefs: mockColumnDefs as any,
      rowData,
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
        console.log(`${demoType} demo grid ready!`, params);
        
        // Apply demo-specific configurations
        switch (demoType) {
          case 'pivot':
            // Auto-configure pivot mode
            params.api.setSortModel([{ colId: 'department', sort: 'asc' }]);
            break;
          case 'financial':
            // Focus on financial columns
            params.api.setSortModel([{ colId: 'revenue', sort: 'desc' }]);
            break;
          case 'sales':
            // Sales performance view
            params.api.setSortModel([{ colId: 'projects', sort: 'desc' }]);
            break;
        }
      },
    };

    return baseOptions;
  };

  const demos = [
    { id: 'default', name: 'All Features' },
    { id: 'pivot', name: 'Pivot' },
    { id: 'financial', name: 'Financial' },
    { id: 'sales', name: 'Sales' },
  ];

  const [fullscreen, setFullscreen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    setFullscreen(f => !f);
  };

  return (
  <div className={`flex flex-col ${fullscreen ? 'fixed inset-0 bg-gray-900 overflow-hidden' : 'min-h-screen bg-gray-100'}`}>
      <div className="flex items-center px-4 py-2 bg-white border-b border-gray-200 space-x-4 text-sm">
        <div className="font-semibold text-gray-800">SelfAG Grid Demos:</div>
        {demos.map(d => (
          <button
            key={d.id}
            onClick={() => setCurrentDemo(d.id as any)}
            className={`px-3 py-1 rounded ${currentDemo === d.id ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >{d.name}</button>
        ))}
        <div className="ml-auto flex items-center space-x-2">
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
            <DataGrid 
              key={currentDemo + ':' + statusFilter}
              options={{
                ...createDemoOptions(currentDemo),
                rowData: rowData.filter(r => statusFilter==='All' ? true : r.status === statusFilter)
              }}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoApp;
