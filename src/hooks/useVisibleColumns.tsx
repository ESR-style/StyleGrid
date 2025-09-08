import { useMemo } from 'react';
import type { ColumnDef } from '../types/grid';
import type { DataAnalysisConfig } from '../components/datagrid/DataAnalysisModal';

interface UseVisibleColumnsProps {
  columnDefs: ColumnDef[];
  columnOrder: string[];
  hiddenColumns: Set<string>;
  analysisConfig: DataAnalysisConfig | null;
  analysisAggregates: Record<string, number>;
}

export const useVisibleColumns = ({
  columnDefs,
  columnOrder,
  hiddenColumns,
  analysisConfig,
  analysisAggregates,
}: UseVisibleColumnsProps) => {
  const visibleColumns = useMemo(() => {
    const base = columnOrder
      .map(colId => columnDefs.find(col => col.field === colId))
      .filter((col): col is ColumnDef => col !== undefined && !hiddenColumns.has(col.field));
    
    if (analysisConfig) {
      let filtered = base.filter(c => analysisConfig.visibleColumns.includes(c.field));
      
      // Append contribution synthetic column
      if (analysisConfig.contributionColumn) {
        const contribField = analysisConfig.contributionColumn;
        const total = analysisAggregates[contribField];
        
        if (total && !isNaN(total)) {
          filtered = [
            ...filtered,
            {
              field: '__contribution__',
              headerName: '% of ' + (base.find(c => c.field === contribField)?.headerName || contribField),
              width: 120,
              sortable: false,
              filter: false,
              resizable: true,
              valueFormatter: (p: any) => {
                const v = parseFloat(p.data?.[contribField]);
                if (isNaN(v) || !total) return '';
                return (v / total * 100).toFixed(2) + '%';
              }
            } as ColumnDef
          ];
        }
      }
      return filtered;
    }
    
    return base;
  }, [columnDefs, columnOrder, hiddenColumns, analysisConfig, analysisAggregates]);

  return visibleColumns;
};
