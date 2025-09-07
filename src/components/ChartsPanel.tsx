import React, { useMemo, useState } from 'react';
import { X, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart as RLChart, Line, PieChart as RPChart, Pie, Cell } from 'recharts';
import { useGridContext } from '../context/GridContext';

export interface ChartsPanelProps {
  open: boolean;
  onClose: () => void;
}

// Very small first version: pick X + numeric Y; supports bar / line / pie.
export const ChartsPanel: React.FC<ChartsPanelProps> = ({ open, onClose }) => {
  const { state } = useGridContext();
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [xCol, setXCol] = useState('');
  const [yCol, setYCol] = useState('');

  const numericCols = useMemo(() => state.columnDefs.filter(c => state.rowData.some(r => !isNaN(Number(r[c.field])))), [state.columnDefs, state.rowData]);
  const catCols = useMemo(() => state.columnDefs.filter(c => !numericCols.some(n => n.field === c.field)), [state.columnDefs, numericCols]);

  const data = useMemo(() => {
    if (!xCol) return [];
    if (chartType === 'pie') {
      const counts: Record<string, { name: string; value: number }> = {};
      state.rowData.forEach(r => {
        const key = String(r[xCol] ?? '');
        const val = yCol ? Number(r[yCol]) || 0 : 1;
        if (!counts[key]) counts[key] = { name: key, value: 0 };
        counts[key].value += val;
      });
      return Object.values(counts);
    }
    if (!yCol) return [];
    return state.rowData.map(r => ({ [xCol]: r[xCol], [yCol]: Number(r[yCol]) || 0 }));
  }, [state.rowData, xCol, yCol, chartType]);

  const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#0ea5e9','#8b5cf6','#14b8a6','#84cc16'];

  return (
    <div className={`w-full overflow-hidden transition-[max-height] duration-300 bg-white border-b border-gray-200 shadow-sm ${open ? 'max-h-[520px]' : 'max-h-0'}`}>\n      {open && (
        <div className="p-4 space-y-4">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><BarChart3 className="w-4 h-4"/> Charts</h3>
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" aria-label="Close charts"><X className="w-4 h-4"/></button>
          </div>

          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <span className="font-medium">Type:</span>
              {['bar','line','pie'].map(t => (
                <button key={t} onClick={() => setChartType(t as any)} className={`px-2 py-1 rounded border ${chartType===t?'bg-indigo-600 text-white border-indigo-600':'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{t}</button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">X:</span>
              <select value={xCol} onChange={e=>setXCol(e.target.value)} className="border-gray-300 rounded px-1 py-1">
                <option value="">Select</option>
                {catCols.map(c=> <option key={c.field} value={c.field}>{c.headerName||c.field}</option>)}
              </select>
            </div>
            {chartType !== 'pie' && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Y:</span>
                <select value={yCol} onChange={e=>setYCol(e.target.value)} className="border-gray-300 rounded px-1 py-1">
                  <option value="">Select</option>
                  {numericCols.map(c=> <option key={c.field} value={c.field}>{c.headerName||c.field}</option>)}
                </select>
              </div>
            )}
            {chartType==='pie' && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Value:</span>
                <select value={yCol} onChange={e=>setYCol(e.target.value)} className="border-gray-300 rounded px-1 py-1">
                  <option value="">Count</option>
                  {numericCols.map(c=> <option key={c.field} value={c.field}>Sum {c.headerName||c.field}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="h-72 w-full bg-white border border-gray-200 rounded">
            {data.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">Select columns to render chart</div>
            ) : chartType === 'bar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey={xCol} hide={false} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey={yCol} fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            ) : chartType === 'line' ? (
              <ResponsiveContainer width="100%" height="100%">
                <RLChart data={data}>
                  <XAxis dataKey={xCol} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey={yCol} stroke="#6366f1" strokeWidth={2} dot={false} />
                </RLChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RPChart>
                  <Pie data={data} outerRadius={110} dataKey="value" label>
                    {data.map((_,i)=>(<Cell key={i} fill={COLORS[i%COLORS.length]}/>))}
                  </Pie>
                  <Tooltip />
                </RPChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
