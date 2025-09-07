import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Calendar, Check } from 'lucide-react';
import type { ColumnDef } from '../types/grid';

interface FilterProps {
  column: ColumnDef;
  data: any[];
  onFilterChange: (colId: string, filterValue: any) => void;
  currentFilter: any;
}

export const ColumnFilter: React.FC<FilterProps> = ({
  column,
  data,
  onFilterChange,
  currentFilter,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState(currentFilter || '');
  const filterRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [portalPos, setPortalPos] = useState<{top:number;left:number;width:number}>({top:0,left:0,width:0});
  const [positionCalculated, setPositionCalculated] = useState(false);
  const portalContentRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      const portalWidth = Math.max(r.width, 260);
      const viewportWidth = window.innerWidth;
      
      let left = r.left + window.scrollX;
      
      // Check if portal would go off-screen to the right
      if (left + portalWidth > viewportWidth) {
        // Position it to the left of the trigger button
        left = r.right + window.scrollX - portalWidth;
      }
      
      // Ensure it doesn't go off-screen to the left
      if (left < 0) {
        left = 10; // 10px margin from left edge
      }
      
      setPortalPos({ 
        top: r.bottom + window.scrollY, 
        left: left, 
        width: r.width 
      });
      setPositionCalculated(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) return;
      const target = event.target as Node;
      if (
        triggerRef.current &&
        portalContentRef.current &&
        !triggerRef.current.contains(target) &&
        !portalContentRef.current.contains(target)
      ) {
        setIsOpen(false);
        setPositionCalculated(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => { 
      if (e.key === 'Escape') {
        setIsOpen(false);
        setPositionCalculated(false);
      }
    };
    const handleReposition = () => {
      if (triggerRef.current && isOpen) {
        calculatePosition();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [isOpen]);

  const handleFilterChange = (value: any) => {
    setFilterValue(value);
    onFilterChange(column.field, value);
  };

  if (!column.filter) return null;

  return (
    <div className="relative z-50" ref={filterRef}>
      <button
        ref={triggerRef}
        className={`
          p-1 rounded hover:bg-gray-200 transition-colors
          ${filterValue ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}
        `}
        onClick={() => {
          const next = !isOpen;
          if (next) {
            calculatePosition();
          } else {
            setPositionCalculated(false);
          }
          setIsOpen(next);
          window.dispatchEvent(new CustomEvent('grid-filter-open', { detail: next }));
        }}
        title="Filter"
      >
        <Search className="w-3 h-3" />
      </button>
      {isOpen && positionCalculated && createPortal(
        <div
          ref={portalContentRef}
          className="bg-white border border-gray-200 rounded-md shadow-lg z-[9999] min-w-64 fixed"
          style={{ top: portalPos.top + 4, left: portalPos.left, width: Math.max(portalPos.width, 260) }}
        >
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-sm text-gray-900">
                Filter {column.headerName || column.field}
              </span>
              <button
                onClick={() => { setIsOpen(false); window.dispatchEvent(new CustomEvent('grid-filter-open', { detail: false })); }}
                className="text-gray-400 hover:text-gray-600"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {column.filterType === 'text' && (
              <TextFilter
                value={filterValue}
                onChange={handleFilterChange}
                placeholder={`Search ${column.headerName || column.field}...`}
              />
            )}
            {column.filterType === 'number' && (
              <NumberFilter
                value={filterValue}
                onChange={handleFilterChange}
                placeholder={`Filter ${column.headerName || column.field}...`}
              />
            )}
            {column.filterType === 'date' && (
              <DateFilter
                value={filterValue}
                onChange={handleFilterChange}
              />
            )}
            {column.filterType === 'set' && (
              <SetFilter
                column={column}
                data={data}
                value={filterValue}
                onChange={handleFilterChange}
              />
            )}
          </div>
  </div>,
        document.body
      )}
    </div>
  );
};

interface TextFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const TextFilter: React.FC<TextFilterProps> = ({ value, onChange, placeholder }) => {
  const [condition, setCondition] = useState((value as any)?.condition || 'contains');
  const [inputValue, setInputValue] = useState((value as any)?.value || '');

  useEffect(() => {
    onChange({ condition, value: inputValue } as any);
  }, [condition, inputValue]); // Removed onChange from dependencies to prevent flash

  return (
    <div className="space-y-2">
      <select
        value={condition}
        onChange={e => setCondition(e.target.value)}
        className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
      >
        <option value="contains">Contains</option>
        <option value="equals">Equals</option>
        <option value="startsWith">Starts with</option>
        <option value="endsWith">Ends with</option>
        <option value="notContains">Does not contain</option>
      </select>
      <input
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
      />
    </div>
  );
};

interface NumberFilterProps {
  value: any;
  onChange: (value: any) => void;
  placeholder: string;
}

const NumberFilter: React.FC<NumberFilterProps> = ({ value, onChange, placeholder }) => {
  const [condition, setCondition] = useState(value?.condition || 'equals');
  const [inputValue, setInputValue] = useState(value?.value || '');

  useEffect(() => {
    onChange({ condition, value: inputValue ? parseFloat(inputValue) : null });
  }, [condition, inputValue]); // Removed onChange from dependencies to prevent flash

  return (
    <div className="space-y-2">
      <select
        value={condition}
        onChange={e => setCondition(e.target.value)}
        className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
      >
        <option value="equals">Equals</option>
        <option value="notEquals">Not equals</option>
        <option value="greaterThan">Greater than</option>
        <option value="greaterThanOrEqual">Greater than or equal</option>
        <option value="lessThan">Less than</option>
        <option value="lessThanOrEqual">Less than or equal</option>
        <option value="inRange">In range</option>
      </select>
      {condition === 'inRange' ? (
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="From"
            className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
          />
          <input
            type="number"
            placeholder="To"
            className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
      ) : (
        <input
          type="number"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
        />
      )}
    </div>
  );
};

interface DateFilterProps {
  value: any;
  onChange: (value: any) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ value, onChange }) => {
  const [condition, setCondition] = useState(value?.condition || 'equals');
  const [inputValue, setInputValue] = useState(value?.value || '');

  useEffect(() => {
    onChange({ condition, value: inputValue });
  }, [condition, inputValue]); // Removed onChange from dependencies to prevent flash

  return (
    <div className="space-y-2">
      <select
        value={condition}
        onChange={e => setCondition(e.target.value)}
        className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
      >
        <option value="equals">Equals</option>
        <option value="before">Before</option>
        <option value="after">After</option>
        <option value="inRange">In range</option>
      </select>
      
      <div className="relative">
        <input
          type="date"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
        />
        <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

interface SetFilterProps {
  column: ColumnDef;
  data: any[];
  value: any;
  onChange: (value: any) => void;
}

const SetFilter: React.FC<SetFilterProps> = ({ column, data, value, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState<Set<string>>(
    new Set(value?.values || [])
  );

  const uniqueValues = Array.from(
    new Set(data.map(row => String(row[column.field] || '')).filter(v => v))
  ).sort();

  const filteredValues = uniqueValues.filter(val => 
    val.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    onChange({ values: Array.from(selectedValues) });
  }, [selectedValues]); // Removed onChange from dependencies to prevent flash

  const toggleValue = (val: string) => {
    const newSelected = new Set(selectedValues);
    if (newSelected.has(val)) {
      newSelected.delete(val);
    } else {
      newSelected.add(val);
    }
    setSelectedValues(newSelected);
  };

  const selectAll = () => {
    setSelectedValues(new Set(filteredValues));
  };

  const selectNone = () => {
    setSelectedValues(new Set());
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Search values..."
        className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
      />
      
      <div className="flex space-x-2 text-xs">
        <button
          onClick={selectAll}
          className="text-blue-600 hover:underline"
        >
          Select All
        </button>
        <button
          onClick={selectNone}
          className="text-blue-600 hover:underline"
        >
          Select None
        </button>
      </div>

      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded">
        {filteredValues.map(val => (
          <label
            key={val}
            className="flex items-center px-2 py-1 hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedValues.has(val)}
              onChange={() => toggleValue(val)}
              className="mr-2 rounded border-gray-300"
            />
            <span className="text-sm truncate flex-1">{val}</span>
            {selectedValues.has(val) && (
              <Check className="w-3 h-3 text-green-600" />
            )}
          </label>
        ))}
      </div>
      
      <div className="text-xs text-gray-500">
        {selectedValues.size} of {filteredValues.length} selected
      </div>
    </div>
  );
};

