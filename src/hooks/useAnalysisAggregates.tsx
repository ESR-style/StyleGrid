import { useEffect, useState } from 'react';
import type { DataAnalysisConfig } from '../components/datagrid/DataAnalysisModal';

interface UseAnalysisAggregatesProps {
  analysisConfig: DataAnalysisConfig | null;
  processedData: any[];
}

export const useAnalysisAggregates = ({
  analysisConfig,
  processedData,
}: UseAnalysisAggregatesProps) => {
  const [analysisAggregates, setAnalysisAggregates] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!analysisConfig) { 
      setAnalysisAggregates({}); 
      return; 
    }
    
    const agg: Record<string, number> = {};
    
    for (const [field, type] of Object.entries(analysisConfig.aggregations)) {
      if (!type) continue;
      
      const values = processedData
        .map(r => parseFloat(r[field]))
        .filter(v => !isNaN(v));
        
      if (values.length === 0) continue;
      
      switch (type) {
        case 'sum':
          agg[field] = values.reduce((a, b) => a + b, 0); 
          break;
        case 'avg':
          agg[field] = values.reduce((a, b) => a + b, 0) / values.length; 
          break;
        case 'min':
          agg[field] = Math.min(...values); 
          break;
        case 'max':
          agg[field] = Math.max(...values); 
          break;
        case 'count':
          agg[field] = values.length; 
          break;
      }
    }
    
    // For contribution column ensure we have sum base
    if (analysisConfig.contributionColumn && !agg[analysisConfig.contributionColumn]) {
      const vals = processedData
        .map(r => parseFloat(r[analysisConfig.contributionColumn!]))
        .filter(v => !isNaN(v));
        
      if (vals.length) {
        agg[analysisConfig.contributionColumn] = vals.reduce((a, b) => a + b, 0);
      }
    }
    
    setAnalysisAggregates(agg);
  }, [analysisConfig, processedData]);

  return analysisAggregates;
};
