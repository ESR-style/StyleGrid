import React from 'react';
import type { DataAnalysisConfig } from './DataAnalysisModal';
import type { ColumnDef } from '../../types/grid';

interface DataGridAnalysisSummaryProps {
  analysisConfig: DataAnalysisConfig | null;
  analysisAggregates: Record<string, number>;
  columnDefs: ColumnDef[];
}

export const DataGridAnalysisSummary: React.FC<DataGridAnalysisSummaryProps> = ({
  analysisConfig,
  analysisAggregates,
  columnDefs,
}) => {
  if (!analysisConfig || Object.keys(analysisConfig.aggregations).length === 0) {
    return null;
  }

  return (
    <div className="text-xs md:text-sm px-4 py-2 bg-indigo-50 border-b border-indigo-200 flex flex-wrap gap-x-6 gap-y-1 leading-snug">
      <span className="text-indigo-700 font-semibold pr-2">Aggregations:</span>
      
      {Object.entries(analysisConfig.aggregations)
        .filter(([_, type]) => type)
        .map(([field, type]) => {
          const val = analysisAggregates[field];
          const col = columnDefs.find(c => c.field === field);
          
          if (val === undefined) return null;
          
          const label = (col?.headerName || field) + ' ' + type.toUpperCase();
          const formatted = ['sum', 'avg', 'min', 'max'].includes(type as any) 
            ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) 
            : val;
            
          return (
            <span key={field} className="text-indigo-700 font-medium">
              {label}: <span className="font-semibold">{formatted}</span>
            </span>
          );
        })}
      
      {analysisConfig.contributionColumn && 
       analysisAggregates[analysisConfig.contributionColumn] !== undefined && (
        <span className="text-indigo-700">
          Total {(columnDefs.find(c => c.field === analysisConfig.contributionColumn)?.headerName) || analysisConfig.contributionColumn}: {' '}
          {analysisAggregates[analysisConfig.contributionColumn].toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
      )}
    </div>
  );
};
