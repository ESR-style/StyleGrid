# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# SelfAG Grid - Complete AG-Grid Clone

A comprehensive data grid component built from scratch with React, TypeScript, and Tailwind CSS. This project replicates all major features of AG-Grid including pivot tables, advanced filtering, sorting, grouping, and much more.

## 🚀 Features

### Core Grid Features
- ✅ **Column Management**: Resize, reorder, pin (left/right), hide/show columns
- ✅ **Sorting**: Single and multi-column sorting with custom comparators  
- ✅ **Filtering**: Advanced filters (text, number, date, set filters)
- ✅ **Row Selection**: Single and multi-row selection with checkbox support
- ✅ **Cell Rendering**: Custom cell renderers and value formatters
- ✅ **Keyboard Navigation**: Full keyboard accessibility
- ✅ **Virtual Scrolling**: Handles large datasets efficiently

### Advanced Features
- ✅ **Pivot Tables**: Drag & drop pivot configuration
- ✅ **Row Grouping**: Hierarchical data grouping with aggregations
- ✅ **Data Export**: Export to CSV and Excel formats
- ✅ **Context Menus**: Right-click menus for quick actions
- ✅ **Status Bar**: Real-time aggregations and statistics
- ✅ **Sidebar Panel**: Column management, filters, pivot configuration
- ✅ **Pagination**: Built-in pagination with customizable page sizes
- ✅ **Loading States**: Loading overlays and error handling

### Premium Features (Typically Paid in AG-Grid)
- ✅ **Advanced Filtering**: Set filters, date range filters, number range filters
- ✅ **Pivot Mode**: Full pivot table functionality
- ✅ **Row Grouping**: Expandable/collapsible groups
- ✅ **Aggregation Functions**: Sum, Average, Count, Min, Max
- ✅ **Column Pinning**: Pin columns to left or right
- ✅ **Export Functions**: Multiple export formats
- ✅ **Side Bar**: Configurable tool panel

## 🛠 Tech Stack

- **React 18+** - Modern React with hooks
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Vite** - Fast build tool
- **clsx** - Conditional styling
- **date-fns** - Date utilities

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd selfaggrid

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎯 Usage

### Basic Grid Setup

```tsx
import { DataGrid } from './components/DataGrid';
import { generateMockData, mockColumnDefs } from './data/mockData';

const App = () => {
  const gridOptions = {
    columnDefs: mockColumnDefs,
    rowData: generateMockData(1000),
    enableSorting: true,
    enableFilter: true,
    enableRowSelection: true,
    rowSelection: 'multiple',
    enablePivot: true,
    enableGrouping: true,
  };

  return <DataGrid options={gridOptions} />;
};
```

## 🎮 Grid API

The grid provides a comprehensive API for programmatic control:

```tsx
// Get grid API instance
const handleGridReady = (params) => {
  const api = params.api;
  
  // Selection
  api.selectAll();
  api.deselectAll();
  api.getSelectedRows();
  
  // Sorting
  api.setSortModel([{ colId: 'name', sort: 'asc' }]);
  api.getSortModel();
  
  // Filtering
  api.setFilterModel({ name: { condition: 'contains', value: 'John' } });
  api.getFilterModel();
  
  // Export
  api.exportDataAsCsv();
  api.exportDataAsExcel();
  
  // Columns
  api.sizeColumnsToFit();
  api.autoSizeColumns(['name', 'salary']);
  api.setColumnVisible('email', false);
  api.setColumnPinned('name', 'left');
  
  // Data
  api.setRowData(newData);
  api.refreshCells();
};
```

## 🎨 Demo Features

The live demo showcases:

1. **Large Dataset**: 1000 rows with 20+ columns of realistic business data
2. **All Filter Types**: Text, number, date, and set filters with multiple conditions
3. **Pivot Tables**: Full drag & drop pivot configuration with aggregations
4. **Export Functions**: CSV and Excel export with customizable options
5. **Advanced Selection**: Multi-row selection with real-time aggregations
6. **Professional UI**: AG-Grid styled interface with modern design
7. **Responsive Design**: Works perfectly on desktop and mobile devices

## 🚀 Performance

- **Virtual Scrolling**: Efficiently handles 10,000+ rows
- **Optimized Rendering**: Only renders visible cells
- **Memoized Calculations**: Smart re-computation of aggregations
- **Debounced Filtering**: Smooth filtering experience
- **Lazy Loading**: On-demand feature loading

## 📊 Feature Comparison

| Feature | AG-Grid Community | AG-Grid Enterprise | SelfAG Grid |
|---------|-------------------|-------------------|-------------|
| Basic Grid | ✅ | ✅ | ✅ |
| Sorting & Filtering | ✅ | ✅ | ✅ |
| Cell Renderers | ✅ | ✅ | ✅ |
| CSV Export | ✅ | ✅ | ✅ |
| Pivot Tables | ❌ | ✅ | ✅ |
| Row Grouping | ❌ | ✅ | ✅ |
| Set Filters | ❌ | ✅ | ✅ |
| Side Bar | ❌ | ✅ | ✅ |
| Excel Export | ❌ | ✅ | ✅ |
| Column Pinning | ❌ | ✅ | ✅ |
| **Cost** | **Free** | **$1000+ /year** | **Free** |

## 🎯 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 License

MIT License - feel free to use in your projects!

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**

*This project demonstrates that you can build enterprise-grade data grid functionality without expensive licensing fees. All AG-Grid premium features have been recreated from scratch with modern web technologies.*

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
