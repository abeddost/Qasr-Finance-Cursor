# Excel Analytics App

A modern React application for analyzing Excel financial data with interactive charts and insights.

## Features

- 📊 Interactive dashboard with multiple chart types
- 📈 Monthly comparison and balance trend analysis
- 💰 Summary cards with key financial metrics
- 📋 Data table with filtering capabilities
- 🧠 Smart insights generation
- 📱 Responsive design with dark mode support

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **File Processing**: XLSX library
- **Icons**: Lucide React

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Deployment on Vercel

This project is configured for easy deployment on Vercel:

### Option 1: Deploy via Vercel CLI
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

### Option 2: Deploy via GitHub
1. Push your code to a GitHub repository
2. Connect your GitHub repository to Vercel
3. Vercel will automatically detect the Vite configuration and deploy

### Option 3: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will automatically configure the build settings

## Build Configuration

The project includes:
- `vercel.json` - Vercel deployment configuration
- `.gitignore` - Git ignore patterns
- Optimized build process with TypeScript compilation

## Usage

1. Upload an Excel file with financial transactions
2. The app will automatically parse and analyze the data
3. View insights, charts, and summaries in the dashboard
4. Use filters to explore specific time periods or categories

## File Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Charts.tsx      # Chart components
│   ├── DataTable.tsx   # Data table
│   └── ...
├── utils/              # Utility functions
│   ├── excelParser.ts  # Excel parsing logic
│   └── insightsGenerator.ts
└── App.tsx            # Main app component
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
