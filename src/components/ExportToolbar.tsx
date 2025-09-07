import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, Printer, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useGridContext } from '../context/GridContext';
import type { ColumnDef } from '../types/grid';

interface ExportToolbarProps {
  processedData: any[];
  visibleColumns: ColumnDef[];
  className?: string;
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
  processedData,
  visibleColumns,
  className = ''
}) => {
  const { state } = useGridContext();
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get the data that should be exported (filtered and sorted)
  const getExportData = () => {
    return processedData.map(row => {
      const exportRow: any = {};
      visibleColumns.forEach(col => {
        let value = row[col.field];
        
        // Handle synthetic columns like contribution percentage
        if (col.field === '__contribution__' && col.valueFormatter) {
          value = col.valueFormatter({ data: row, value, node: null as any, column: col });
        } else if (col.valueFormatter) {
          value = col.valueFormatter({ value, data: row, node: null as any, column: col });
        } else if (col.valueGetter) {
          value = col.valueGetter({ data: row, node: { id: '', data: row, rowIndex: -1, level: 0 }, column: col });
        }
        
        exportRow[col.headerName || col.field] = value;
      });
      return exportRow;
    });
  };

  const exportToCSV = () => {
    const exportData = getExportData();
    if (exportData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = visibleColumns.map(col => col.headerName || col.field);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle values that might contain commas, quotes, or newlines
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    downloadFile(csvContent, 'grid-export.csv', 'text/csv');
  };

  const exportToExcel = () => {
    const exportData = getExportData();
    if (exportData.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Convert data to worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Auto-size columns based on content
      const colWidths = visibleColumns.map(col => {
        const headerLength = (col.headerName || col.field).length;
        const maxDataLength = Math.max(
          ...exportData.slice(0, 100).map(row => {
            const value = String(row[col.headerName || col.field] || '');
            return value.length;
          })
        );
        return { wch: Math.min(Math.max(headerLength, maxDataLength) + 2, 50) };
      });
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Grid Data');
      
      // Add metadata sheet
      const metaData = [
        { Property: 'Export Date', Value: new Date().toLocaleString() },
        { Property: 'Total Rows', Value: state.rowData.length },
        { Property: 'Filtered Rows', Value: processedData.length },
        { Property: 'Columns Exported', Value: visibleColumns.length },
        { Property: 'Filters Applied', Value: Object.keys(state.filterModel).length > 0 ? 'Yes' : 'No' },
        { Property: 'Sort Applied', Value: state.sortModel.length > 0 ? 'Yes' : 'No' }
      ];
      
      if (Object.keys(state.filterModel).length > 0) {
        metaData.push({ Property: 'Active Filters', Value: Object.keys(state.filterModel).join(', ') });
      }
      
      if (state.sortModel.length > 0) {
        const sortInfo = state.sortModel.map(s => `${s.colId} (${s.sort})`).join(', ');
        metaData.push({ Property: 'Sort Applied', Value: sortInfo });
      }

      const metaWs = XLSX.utils.json_to_sheet(metaData);
      metaWs['!cols'] = [{ wch: 20 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(wb, metaWs, 'Export Info');

      // Write file
      XLSX.writeFile(wb, 'grid-export.xlsx');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting to Excel. Please try again.');
    }
  };

  const printData = () => {
    const exportData = getExportData();
    if (exportData.length === 0) {
      alert('No data to print');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print data');
      return;
    }

    const headers = visibleColumns.map(col => col.headerName || col.field);
    
    // Generate HTML table for printing
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Grid Data Export</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #ddd;
            }
            .export-info {
              font-size: 12px;
              color: #666;
              margin-bottom: 20px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              font-size: 11px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 6px 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
              font-size: 12px;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .page-break {
              page-break-before: always;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Grid Data Export</h1>
            <div class="export-info">
              <p><strong>Export Date:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Total Rows:</strong> ${state.rowData.length} | <strong>Filtered Rows:</strong> ${processedData.length} | <strong>Columns:</strong> ${visibleColumns.length}</p>
              ${Object.keys(state.filterModel).length > 0 ? `<p><strong>Active Filters:</strong> ${Object.keys(state.filterModel).join(', ')}</p>` : ''}
              ${state.sortModel.length > 0 ? `<p><strong>Sort Applied:</strong> ${state.sortModel.map(s => `${s.colId} (${s.sort})`).join(', ')}</p>` : ''}
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${exportData.map(row => 
                `<tr>
                  ${headers.map(header => `<td>${String(row[header] || '')}</td>`).join('')}
                </tr>`
              ).join('')}
            </tbody>
          </table>
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex items-center space-x-1.5 ${className}`}>
      {/* Export Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowExportDropdown(!showExportDropdown)}
          className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 border border-blue-600"
          title="Export Data"
        >
          <Download className="w-3 h-3" />
          <span>Export</span>
          <ChevronDown className="w-2 h-2" />
        </button>
        
        {showExportDropdown && (
          <div 
            ref={dropdownRef}
            className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[100px]"
          >
            <button
              onClick={() => {
                exportToCSV();
                setShowExportDropdown(false);
              }}
              className="flex items-center space-x-2 w-full px-2 py-1.5 text-xs text-left hover:bg-gray-100 border-b border-gray-100"
            >
              <Download className="w-3 h-3" />
              <span>CSV</span>
            </button>
            
            <button
              onClick={() => {
                exportToExcel();
                setShowExportDropdown(false);
              }}
              className="flex items-center space-x-2 w-full px-2 py-1.5 text-xs text-left hover:bg-gray-100"
            >
              <FileSpreadsheet className="w-3 h-3" />
              <span>Excel</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Print Button */}
      <button
        onClick={printData}
        className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 border border-gray-600"
        title="Print Data"
      >
        <Printer className="w-3 h-3" />
        <span>Print</span>
      </button>
      
      <span className="text-xs text-gray-500 ml-1">
        {processedData.length !== state.rowData.length && 
          `${processedData.length}/${state.rowData.length}`
        }
        {processedData.length === state.rowData.length && 
          `${state.rowData.length} rows`
        }
      </span>
    </div>
  );
};
