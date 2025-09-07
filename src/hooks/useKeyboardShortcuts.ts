import { useEffect } from 'react';
import { useGridContext } from '../context/GridContext';

export const useKeyboardShortcuts = () => {
  const { state, dispatch, api } = useGridContext();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const { ctrlKey, metaKey, shiftKey, altKey, key } = event;
      const cmdKey = ctrlKey || metaKey; // Support both Ctrl (Windows) and Cmd (Mac)

      // Select All: Ctrl/Cmd + A
      if (cmdKey && key === 'a' && !shiftKey && !altKey) {
        event.preventDefault();
        api.selectAll();
        return;
      }

      // Deselect All: Escape
      if (key === 'Escape') {
        event.preventDefault();
        api.deselectAll();
        return;
      }

      // Copy: Ctrl/Cmd + C
      if (cmdKey && key === 'c' && !shiftKey && !altKey) {
        event.preventDefault();
        const selectedRows = api.getSelectedRows();
        if (selectedRows.length > 0) {
          copyToClipboard(selectedRows, state.columnDefs);
        }
        return;
      }

      // Export CSV: Ctrl/Cmd + E
      if (cmdKey && key === 'e' && !shiftKey && !altKey) {
        event.preventDefault();
        api.exportDataAsCsv();
        return;
      }

      // Toggle Sidebar: Ctrl/Cmd + B
      if (cmdKey && key === 'b' && !shiftKey && !altKey) {
        event.preventDefault();
        // Dispatch action to toggle sidebar
        // This would need to be implemented in the grid context
        return;
      }

      // Refresh: Ctrl/Cmd + R (prevent browser refresh, do grid refresh instead)
      if (cmdKey && key === 'r' && !shiftKey && !altKey) {
        event.preventDefault();
        api.refreshCells();
        return;
      }

      // Find: Ctrl/Cmd + F
      if (cmdKey && key === 'f' && !shiftKey && !altKey) {
        event.preventDefault();
        // Focus on first filter input
        const firstFilterInput = document.querySelector('.column-filter input');
        if (firstFilterInput) {
          (firstFilterInput as HTMLInputElement).focus();
        }
        return;
      }

      // Column management shortcuts
      // Hide column: Alt + H
      if (altKey && key === 'h' && !cmdKey && !shiftKey) {
        event.preventDefault();
        // Implementation would depend on selected/focused column
        return;
      }

      // Pin left: Alt + L
      if (altKey && key === 'l' && !cmdKey && !shiftKey) {
        event.preventDefault();
        // Implementation would depend on selected/focused column
        return;
      }

      // Pin right: Alt + R
      if (altKey && key === 'r' && !cmdKey && !shiftKey) {
        event.preventDefault();
        // Implementation would depend on selected/focused column
        return;
      }

      // Auto-size columns: Ctrl/Cmd + Shift + A
      if (cmdKey && shiftKey && key === 'A' && !altKey) {
        event.preventDefault();
        const visibleColumns = state.columnDefs
          .filter(col => !state.hiddenColumns.has(col.field))
          .map(col => col.field);
        api.autoSizeColumns(visibleColumns);
        return;
      }

      // Size columns to fit: Ctrl/Cmd + Shift + F
      if (cmdKey && shiftKey && key === 'F' && !altKey) {
        event.preventDefault();
        api.sizeColumnsToFit();
        return;
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [state, dispatch, api]);
};

// Helper function to copy data to clipboard
const copyToClipboard = async (data: any[], columns: any[]) => {
  try {
    // Create CSV content
    const headers = columns.map(col => col.headerName || col.field).join('\t');
    const rows = data.map(row => 
      columns.map(col => {
        let value = row[col.field];
        if (col.valueFormatter) {
          value = col.valueFormatter({ value, data: row, node: null, column: col });
        }
        return String(value || '');
      }).join('\t')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    
    // Copy to clipboard
    await navigator.clipboard.writeText(csvContent);
    
    // Show notification (you could implement a toast system here)
    console.log(`Copied ${data.length} rows to clipboard`);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }
};

// Keyboard shortcuts help component
export const getKeyboardShortcuts = () => {
  return [
    { keys: ['Ctrl/Cmd', 'A'], description: 'Select all rows' },
    { keys: ['Escape'], description: 'Deselect all rows' },
    { keys: ['Ctrl/Cmd', 'C'], description: 'Copy selected rows' },
    { keys: ['Ctrl/Cmd', 'E'], description: 'Export to CSV' },
    { keys: ['Ctrl/Cmd', 'B'], description: 'Toggle sidebar' },
    { keys: ['Ctrl/Cmd', 'R'], description: 'Refresh grid' },
    { keys: ['Ctrl/Cmd', 'F'], description: 'Focus on search' },
    { keys: ['Ctrl/Cmd', 'Shift', 'A'], description: 'Auto-size all columns' },
    { keys: ['Ctrl/Cmd', 'Shift', 'F'], description: 'Fit columns to container' },
    { keys: ['Alt', 'H'], description: 'Hide focused column' },
    { keys: ['Alt', 'L'], description: 'Pin column left' },
    { keys: ['Alt', 'R'], description: 'Pin column right' },
  ];
};
