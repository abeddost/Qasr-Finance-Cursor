# Excel Analytics Web App

## Tech Stack

- **React** with Vite for fast development
- **SheetJS (xlsx)** for Excel file parsing
- **Recharts** for beautiful, responsive charts
- **Tailwind CSS** for modern styling
- **Lucide React** for icons

## Core Features

### 1. File Upload Component

- Drag-and-drop Excel file upload interface
- File validation (accept only .xlsx, .xls files)
- Parse Excel data using SheetJS library

### 2. Data Dashboard

Display multiple visualizations automatically based on financial transaction data:

- **Pie Chart**: Expense breakdown by category
- **Line Chart**: Income/Expense trends over time
- **Bar Chart**: Monthly comparison of income vs expenses
- **Summary Cards**: Total income, total expenses, balance, transaction count

### 3. Filtering & Search

- **Search bar**: Filter transactions by description/category
- **Date range filter**: Select start and end dates
- **Category filter**: Multi-select dropdown for categories
- **Amount range filter**: Min/max amount sliders
- Real-time filter application to both table and charts

### 4. Data Table

- Sortable columns (date, amount, category, description)
- Pagination for large datasets
- Responsive design for mobile/tablet/desktop

## File Structure

```
qasr-finance-app/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   ├── FileUpload.jsx
│   │   ├── Dashboard.jsx
│   │   ├── SummaryCards.jsx
│   │   ├── Charts.jsx
│   │   ├── FilterPanel.jsx
│   │   └── DataTable.jsx
│   └── utils/
│       └── excelParser.js
```

## Implementation Steps

1. Initialize React + Vite project with Tailwind CSS
2. Install dependencies (xlsx, recharts, lucide-react)
3. Create file upload component with drag-and-drop
4. Implement Excel parsing utility to extract transaction data
5. Build dashboard with summary cards and charts
6. Add filtering and search functionality
7. Create responsive data table with sorting/pagination
8. Polish UI with modern design and smooth transitions

### To-dos

- [ ] Initialize React + Vite project with Tailwind CSS and install all dependencies
- [ ] Create FileUpload component with drag-and-drop and Excel parsing
- [ ] Build Excel parser utility to extract and structure financial transaction data
- [ ] Implement Dashboard with summary cards and charts (pie, line, bar)
- [ ] Add FilterPanel with search, date range, category, and amount filters
- [ ] Create responsive DataTable with sorting and pagination
- [ ] Apply modern styling, animations, and responsive design

