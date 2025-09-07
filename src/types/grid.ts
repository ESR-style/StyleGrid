export interface ColumnDef {
  field: string;
  headerName?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  sortable?: boolean;
  filter?: boolean;
  filterType?: 'text' | 'number' | 'date' | 'set';
  cellRenderer?: (params: CellRendererParams) => React.ReactNode;
  valueGetter?: (params: ValueGetterParams) => any;
  valueSetter?: (params: ValueSetterParams) => boolean;
  valueFormatter?: (params: ValueFormatterParams) => string;
  comparator?: (valueA: any, valueB: any) => number;
  headerClass?: string;
  cellClass?: string;
  editable?: boolean;
  pinned?: 'left' | 'right';
  hide?: boolean;
  lockVisible?: boolean;
  checkboxSelection?: boolean;
  headerCheckboxSelection?: boolean;
  aggregationFunction?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  enablePivot?: boolean;
  enableRowGroup?: boolean;
  enableValue?: boolean;
}

export interface CellRendererParams {
  value: any;
  data: any;
  node: RowNode;
  column: ColumnDef;
  api: GridApi;
}

export interface ValueGetterParams {
  data: any;
  node: RowNode;
  column: ColumnDef;
}

export interface ValueSetterParams {
  oldValue: any;
  newValue: any;
  data: any;
  node: RowNode;
  column: ColumnDef;
}

export interface ValueFormatterParams {
  value: any;
  data: any;
  node: RowNode;
  column: ColumnDef;
}

export interface RowNode {
  id: string;
  data: any;
  rowIndex: number;
  level: number;
  expanded?: boolean;
  group?: boolean;
  parent?: RowNode;
  children?: RowNode[];
  selected?: boolean;
}

export interface GridOptions {
  columnDefs: ColumnDef[];
  rowData: any[];
  defaultColDef?: Partial<ColumnDef>;
  enableSorting?: boolean;
  enableFilter?: boolean;
  enableColResize?: boolean;
  enableRangeSelection?: boolean;
  enableRowSelection?: boolean;
  rowSelection?: 'single' | 'multiple';
  suppressRowClickSelection?: boolean;
  enableGrouping?: boolean;
  enablePivot?: boolean;
  autoGroupColumnDef?: Partial<ColumnDef>;
  groupDefaultExpanded?: number;
  suppressAggFuncInHeader?: boolean;
  animateRows?: boolean;
  enableRtl?: boolean;
  rowHeight?: number;
  headerHeight?: number;
  pagination?: boolean;
  paginationPageSize?: number;
  sideBar?: boolean;
  statusBar?: boolean;
  onGridReady?: (params: { api: GridApi }) => void;
  onRowSelected?: (event: RowSelectedEvent) => void;
  onSelectionChanged?: (event: SelectionChangedEvent) => void;
  onCellValueChanged?: (event: CellValueChangedEvent) => void;
  onRowClicked?: (event: RowClickedEvent) => void;
  onRowDoubleClicked?: (event: RowDoubleClickedEvent) => void;
  onCellClicked?: (event: CellClickedEvent) => void;
  onColumnResized?: (event: ColumnResizedEvent) => void;
  onSortChanged?: (event: SortChangedEvent) => void;
  onFilterChanged?: (event: FilterChangedEvent) => void;
}

export interface GridApi {
  setRowData: (rowData: any[]) => void;
  getSelectedRows: () => any[];
  getSelectedNodes: () => RowNode[];
  selectAll: () => void;
  deselectAll: () => void;
  exportDataAsCsv: (params?: any) => void;
  exportDataAsExcel: (params?: any) => void;
  setSortModel: (sortModel: SortModel[]) => void;
  getSortModel: () => SortModel[];
  setFilterModel: (filterModel: any) => void;
  getFilterModel: () => any;
  onFilterChanged: () => void;
  sizeColumnsToFit: () => void;
  autoSizeColumns: (colKeys: string[]) => void;
  setColumnVisible: (colKey: string, visible: boolean) => void;
  setColumnPinned: (colKey: string, pinned: 'left' | 'right' | null) => void;
  moveColumn: (key: string, toIndex: number) => void;
  showLoadingOverlay: () => void;
  hideOverlay: () => void;
  refreshCells: () => void;
  redrawRows: () => void;
  expandAll: () => void;
  collapseAll: () => void;
}

export interface SortModel {
  colId: string;
  sort: 'asc' | 'desc';
}

export interface FilterModel {
  [key: string]: any;
}

export interface RowSelectedEvent {
  node: RowNode;
  data: any;
  rowIndex: number;
  api: GridApi;
}

export interface SelectionChangedEvent {
  api: GridApi;
}

export interface CellValueChangedEvent {
  oldValue: any;
  newValue: any;
  data: any;
  node: RowNode;
  column: ColumnDef;
  api: GridApi;
}

export interface RowClickedEvent {
  node: RowNode;
  data: any;
  rowIndex: number;
  event: MouseEvent;
  api: GridApi;
}

export interface RowDoubleClickedEvent {
  node: RowNode;
  data: any;
  rowIndex: number;
  event: MouseEvent;
  api: GridApi;
}

export interface CellClickedEvent {
  value: any;
  data: any;
  node: RowNode;
  column: ColumnDef;
  rowIndex: number;
  event: MouseEvent;
  api: GridApi;
}

export interface ColumnResizedEvent {
  column: ColumnDef;
  finished: boolean;
  api: GridApi;
}

export interface SortChangedEvent {
  api: GridApi;
}

export interface FilterChangedEvent {
  api: GridApi;
}

export interface PivotConfiguration {
  rowGroupCols: string[];
  pivotCols: string[];
  valueCols: string[];
}

export interface GroupConfiguration {
  groupKeys: string[];
  expandedGroups: Set<string>;
}
