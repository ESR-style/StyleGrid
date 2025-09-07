import React, { useMemo, useState } from 'react';
import { X, BarChart3, BarChart4, LineChart, TrendingUp, PieChart, Donut, Radar } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart as RLChart, 
  Line, 
  PieChart as RPChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Doughnut, PolarArea, Radar as RadarChart } from 'react-chartjs-2';
import { useGridContext } from '../context/GridContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

export interface ChartsPanelProps {
  open: boolean;
  onClose: () => void;
}

type ChartType = 'bar' | 'stackedBar' | 'line' | 'area' | 'pie' | 'donut' | 'polarArea' | 'radar';

interface ChartTypeConfig {
  id: ChartType;
  label: string;
  icon: React.ReactNode;
}

const chartTypes: ChartTypeConfig[] = [
  { id: 'bar', label: 'BAR', icon: <BarChart3 className="w-3 h-3" /> },
  { id: 'stackedBar', label: 'STACKED BAR', icon: <BarChart4 className="w-3 h-3" /> },
  { id: 'line', label: 'LINE', icon: <LineChart className="w-3 h-3" /> },
  { id: 'area', label: 'AREA', icon: <TrendingUp className="w-3 h-3" /> },
  { id: 'pie', label: 'PIE', icon: <PieChart className="w-3 h-3" /> },
  { id: 'donut', label: 'DONUT', icon: <Donut className="w-3 h-3" /> },
  { id: 'polarArea', label: 'POLAR AREA', icon: <PieChart className="w-3 h-3" /> },
  { id: 'radar', label: 'RADAR', icon: <Radar className="w-3 h-3" /> },
];

export const ChartsPanel: React.FC<ChartsPanelProps> = ({ open, onClose }) => {
  const { state } = useGridContext();
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [labelField, setLabelField] = useState('');
  const [valueField, setValueField] = useState('');

  // Get all columns for label selection
  const allColumns = useMemo(() => state.columnDefs, [state.columnDefs]);
  
  // Get numeric columns for value selection
  const numericColumns = useMemo(() => 
    state.columnDefs.filter(c => 
      state.rowData.some(r => !isNaN(Number(r[c.field])) && r[c.field] !== null && r[c.field] !== '')
    ), 
    [state.columnDefs, state.rowData]
  );

  // Process data for charts
  const chartData = useMemo(() => {
    if (!labelField) return [];

    const dataMap = new Map<string, number>();
    
    state.rowData.forEach(row => {
      const label = String(row[labelField] ?? 'Unknown');
      let value = 1; // Default count
      
      if (valueField) {
        const numValue = Number(row[valueField]);
        value = isNaN(numValue) ? 0 : numValue;
      }
      
      dataMap.set(label, (dataMap.get(label) || 0) + value);
    });

    return Array.from(dataMap.entries()).map(([name, value]) => ({
      name,
      value,
      [labelField]: name,
      [valueField || 'count']: value
    }));
  }, [state.rowData, labelField, valueField]);

  // Chart.js data format for specialized charts
  const chartJSData = useMemo(() => {
    const labels = chartData.map(d => d.name);
    const values = chartData.map(d => d.value);
    const colors = [
      '#663399', // Purple (Acme Manufacturing)
      '#ff9900', // Orange (Fujiyama) 
      '#66cc66', // Green (Beta Distributor)
      '#ff6666',
      '#6699ff',
      '#ffcc66',
      '#cc66ff',
      '#66ffcc'
    ];

    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, values.length),
        borderColor: colors.slice(0, values.length),
        borderWidth: 1
      }]
    };
  }, [chartData]);

  const COLORS = ['#663399', '#ff9900', '#66cc66', '#ff6666', '#6699ff', '#ffcc66', '#cc66ff', '#66ffcc'];

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
          Select label field to render chart
        </div>
      );
    }

    const chartTitle = `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} - Data Visualization`;

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#663399" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'stackedBar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" stackId="a" fill="#663399" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RLChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#663399" strokeWidth={2} dot={{ fill: '#663399' }} />
            </RLChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#663399" fill="#663399" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <div className="h-full flex flex-col">
            <div className="text-center font-medium text-sm text-gray-700 mb-4">{chartTitle}</div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <RPChart>
                  <Pie 
                    data={chartData} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={100} 
                    dataKey="value" 
                    label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(1)}%`}
                    labelLine={false}
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RPChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center flex-wrap gap-4 mt-2">
              {chartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'donut':
        return (
          <div className="h-full flex flex-col">
            <div className="text-center font-medium text-sm text-gray-700 mb-4">{chartTitle}</div>
            <div className="flex-1">
              <Doughnut 
                data={chartJSData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />
            </div>
            <div className="flex justify-center flex-wrap gap-4 mt-2">
              {chartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'polarArea':
        return (
          <div className="h-full flex flex-col">
            <div className="text-center font-medium text-sm text-gray-700 mb-4">{chartTitle}</div>
            <div className="flex-1">
              <PolarArea 
                data={chartJSData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />
            </div>
            <div className="flex justify-center flex-wrap gap-4 mt-2">
              {chartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'radar':
        return (
          <div className="h-full flex flex-col">
            <div className="text-center font-medium text-sm text-gray-700 mb-4">{chartTitle}</div>
            <div className="flex-1">
              <RadarChart 
                data={chartJSData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    r: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
            <div className="flex justify-center flex-wrap gap-4 mt-2">
              {chartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <div className="h-full flex items-center justify-center text-gray-400 text-sm">Chart type not implemented</div>;
    }
  };

  return (
    <div className={`w-full transition-[max-height] duration-300 bg-white border-b border-gray-200 shadow-sm ${open ? 'max-h-[700px] overflow-y-auto' : 'max-h-0 overflow-hidden'}`}>
      {open && (
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-700">Data Visualization</h3>
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" aria-label="Close charts">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Field Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label field</label>
              <select 
                value={labelField} 
                onChange={e => setLabelField(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select the field to use for categories</option>
                {allColumns.map(col => (
                  <option key={col.field} value={col.field}>
                    {col.headerName || col.field}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value field</label>
              <select 
                value={valueField} 
                onChange={e => setValueField(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Count (default)</option>
                {numericColumns.map(col => (
                  <option key={col.field} value={col.field}>
                    {col.headerName || col.field}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chart Type Selection */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Select Chart Type:</div>
            <div className="flex flex-wrap gap-2">
              {chartTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setChartType(type.id)}
                  className={`flex items-center gap-1 px-3 py-2 text-xs font-medium rounded border transition-colors ${
                    chartType === type.id
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {type.icon}
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Display */}
          <div className="h-96 w-full bg-white border border-gray-200 rounded-lg p-4">
            {renderChart()}
          </div>
        </div>
      )}
    </div>
  );
};
