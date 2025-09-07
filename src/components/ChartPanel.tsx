import React, { useState, useMemo } from 'react';
import { X, BarChart3, PieChart, LineChart, AreaChart, ScatterChart, Activity } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  AreaChart as RechartsAreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ScatterChart as RechartsScatterChart,
  Scatter,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useGridContext } from '../context/GridContext';

interface ChartPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'scatter' | 'radar';

const CHART_TYPES = [
  { type: 'bar' as ChartType, name: 'Bar Chart', icon: BarChart3 },
  { type: 'line' as ChartType, name: 'Line Chart', icon: LineChart },
  { type: 'area' as ChartType, name: 'Area Chart', icon: AreaChart },
  { type: 'pie' as ChartType, name: 'Pie Chart', icon: PieChart },
  { type: 'scatter' as ChartType, name: 'Scatter Plot', icon: ScatterChart },
  { type: 'radar' as ChartType, name: 'Radar Chart', icon: Activity }
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'];

export const ChartPanel: React.FC<ChartPanelProps> = ({ isOpen, onClose }) => {
  console.log('ChartPanel rendered with isOpen:', isOpen);
  
  const { state } = useGridContext();
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('bar');
  const [selectedXAxis, setSelectedXAxis] = useState<string>('');
  const [selectedYAxis, setSelectedYAxis] = useState<string>('');
  const [selectedGroupBy, setSelectedGroupBy] = useState<string>('');

  // Get numeric and categorical columns
  const numericColumns = useMemo(() => {
    return state.columnDefs.filter(col => 
      col.filterType === 'number' || 
      state.rowData.some(row => typeof row[col.field] === 'number' || !isNaN(Number(row[col.field])))
    );
  }, [state.columnDefs, state.rowData]);

  const categoricalColumns = useMemo(() => {
    return state.columnDefs.filter(col => 
      col.filterType === 'text' || col.filterType === 'set' ||
      !numericColumns.some(numCol => numCol.field === col.field)
    );
  }, [state.columnDefs, numericColumns]);

  // Process data for charts
  const chartData = useMemo(() => {
    if (!selectedXAxis || (!selectedYAxis && selectedChartType !== 'pie')) return [];

    let processedData = [...state.rowData];

    if (selectedChartType === 'pie') {
      // For pie charts, group by X-axis and count occurrences or sum Y-axis
      const grouped = processedData.reduce((acc, row) => {
        const key = String(row[selectedXAxis] || 'Unknown');
        if (!acc[key]) {
          acc[key] = { name: key, value: 0, count: 0 };
        }
        if (selectedYAxis) {
          const value = parseFloat(row[selectedYAxis]) || 0;
          acc[key].value += value;
        } else {
          acc[key].value += 1; // Count occurrences
        }
        acc[key].count += 1;
        return acc;
      }, {} as Record<string, { name: string; value: number; count: number }>);

      return Object.values(grouped);
    } else if (selectedChartType === 'radar') {
      // For radar charts, we need multiple numeric values for each category
      if (!selectedGroupBy) return [];
      
      const grouped = processedData.reduce((acc, row) => {
        const key = String(row[selectedGroupBy] || 'Unknown');
        if (!acc[key]) {
          acc[key] = { subject: key };
        }
        
        // Add numeric values from all numeric columns
        numericColumns.forEach(col => {
          const value = parseFloat(row[col.field]) || 0;
          if (!acc[key][col.field]) {
            acc[key][col.field] = 0;
          }
          acc[key][col.field] += value;
        });
        
        return acc;
      }, {} as Record<string, any>);

      return Object.values(grouped);
    } else {
      // For other chart types, prepare data with X and Y values
      if (selectedGroupBy) {
        // Group by a third dimension
        const grouped = processedData.reduce((acc, row) => {
          const xVal = row[selectedXAxis];
          const yVal = parseFloat(row[selectedYAxis]) || 0;
          const groupVal = String(row[selectedGroupBy] || 'Unknown');
          
          const key = String(xVal || 'Unknown');
          if (!acc[key]) {
            acc[key] = { [selectedXAxis]: xVal };
          }
          
          if (!acc[key][groupVal]) {
            acc[key][groupVal] = 0;
          }
          acc[key][groupVal] += yVal;
          
          return acc;
        }, {} as Record<string, any>);

        return Object.values(grouped);
      } else {
        return processedData.map(row => ({
          [selectedXAxis]: row[selectedXAxis],
          [selectedYAxis]: parseFloat(row[selectedYAxis]) || 0,
          ...row
        }));
      }
    }
  }, [state.rowData, selectedXAxis, selectedYAxis, selectedGroupBy, selectedChartType, numericColumns]);

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No data available for the selected configuration</p>
        </div>
      );
    }

    switch (selectedChartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={selectedXAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedGroupBy ? (
                // Multiple bars for grouped data
                Object.keys(chartData[0] || {})
                  .filter(key => key !== selectedXAxis && typeof chartData[0][key] === 'number')
                  .map((key, index) => (
                    <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} />
                  ))
              ) : (
                <Bar dataKey={selectedYAxis} fill={COLORS[0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={selectedXAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedGroupBy ? (
                Object.keys(chartData[0] || {})
                  .filter(key => key !== selectedXAxis && typeof chartData[0][key] === 'number')
                  .map((key, index) => (
                    <Line key={key} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} />
                  ))
              ) : (
                <Line type="monotone" dataKey={selectedYAxis} stroke={COLORS[0]} />
              )}
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsAreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={selectedXAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedGroupBy ? (
                Object.keys(chartData[0] || {})
                  .filter(key => key !== selectedXAxis && typeof chartData[0][key] === 'number')
                  .map((key, index) => (
                    <Area key={key} type="monotone" dataKey={key} stackId="1" fill={COLORS[index % COLORS.length]} />
                  ))
              ) : (
                <Area type="monotone" dataKey={selectedYAxis} fill={COLORS[0]} />
              )}
            </RechartsAreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsScatterChart data={chartData}>
              <CartesianGrid />
              <XAxis dataKey={selectedXAxis} />
              <YAxis dataKey={selectedYAxis} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name={`${selectedXAxis} vs ${selectedYAxis}`} data={chartData} fill={COLORS[0]} />
            </RechartsScatterChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsRadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Tooltip />
              <Legend />
              {numericColumns.slice(0, 5).map((col, index) => (
                <Radar
                  key={col.field}
                  name={col.headerName || col.field}
                  dataKey={col.field}
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.6}
                />
              ))}
            </RechartsRadarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`w-full shrink-0 bg-white transition-[max-height,padding] duration-300 ease-in-out overflow-hidden ${
        isOpen ? 'max-h-[900px] p-4 pt-5 space-y-4 border-b border-gray-200 shadow-inner' : 'max-h-0 p-0 border-b border-transparent'
      }`}
    >
      <div className="text-[10px] text-gray-400 select-none">Charts open: {isOpen.toString()}</div>
      <div style={{ display: isOpen ? 'block' : 'none' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Charts</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            title="Close Charts Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Chart Type Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Chart Type</label>
        <div className="flex flex-wrap gap-2">
          {CHART_TYPES.map(({ type, name, icon: Icon }) => (
            <button
              key={type}
              onClick={() => setSelectedChartType(type)}
              className={`flex items-center space-x-2 px-3 py-2 rounded border transition-colors ${
                selectedChartType === type
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Column Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* X-Axis Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {selectedChartType === 'pie' ? 'Category' : 'X-Axis'}
          </label>
          <select
            value={selectedXAxis}
            onChange={(e) => setSelectedXAxis(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select column...</option>
            {(selectedChartType === 'scatter' ? numericColumns : categoricalColumns).map(col => (
              <option key={col.field} value={col.field}>
                {col.headerName || col.field}
              </option>
            ))}
          </select>
        </div>

        {/* Y-Axis Selection */}
        {selectedChartType !== 'pie' && selectedChartType !== 'radar' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Y-Axis</label>
            <select
              value={selectedYAxis}
              onChange={(e) => setSelectedYAxis(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select column...</option>
              {numericColumns.map(col => (
                <option key={col.field} value={col.field}>
                  {col.headerName || col.field}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Group By Selection */}
        {(selectedChartType === 'bar' || selectedChartType === 'line' || selectedChartType === 'area' || selectedChartType === 'radar') && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {selectedChartType === 'radar' ? 'Group By (Required)' : 'Group By (Optional)'}
            </label>
            <select
              value={selectedGroupBy}
              onChange={(e) => setSelectedGroupBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              {categoricalColumns.map(col => (
                <option key={col.field} value={col.field}>
                  {col.headerName || col.field}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* For Pie Chart Y-Axis (optional) */}
        {selectedChartType === 'pie' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Value (Optional)</label>
            <select
              value={selectedYAxis}
              onChange={(e) => setSelectedYAxis(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Count occurrences</option>
              {numericColumns.map(col => (
                <option key={col.field} value={col.field}>
                  Sum of {col.headerName || col.field}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Chart Display */}
      <div className="h-96 bg-gray-50 border border-gray-200 rounded p-4">
        {renderChart()}
      </div>
      </div>
    </div>
  );
};
