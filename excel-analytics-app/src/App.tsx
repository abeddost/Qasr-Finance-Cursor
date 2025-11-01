import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import FileUpload from './components/FileUpload'
import Dashboard from './components/Dashboard'
import FilterPanel from './components/FilterPanel'
import DataTable from './components/DataTable'
import SmartInsights from './components/SmartInsights'
import type { Transaction } from './utils/excelParser'

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error; errorInfo?: React.ErrorInfo }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    console.error('ErrorBoundary caught error:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error)
    console.error('Error info:', errorInfo)
    console.error('Component stack:', errorInfo.componentStack)
    
    // Log additional debugging info
    console.error('Current state:', this.state)
    console.error('Error stack:', error.stack)
    
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              There was an error displaying the dashboard. Please try uploading your file again.
            </p>
            
            {/* Debug info in development */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <h3 className="text-sm font-medium text-red-800 mb-2">Debug Info:</h3>
                <p className="text-xs text-red-700 mb-1">
                  <strong>Error:</strong> {this.state.error.message}
                </p>
                <p className="text-xs text-red-700">
                  <strong>Stack:</strong> {this.state.error.stack?.split('\n')[0]}
                </p>
              </div>
            )}
            
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined, errorInfo: undefined })
                window.location.reload()
              }}
              className="btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [currentView, setCurrentView] = useState<'dashboard' | 'insights'>('dashboard')
  const [darkMode, setDarkMode] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    categories: [] as string[],
    partners: [] as string[],
    transactionType: 'all' as 'all' | 'income' | 'expense',
    minAmount: '',
    maxAmount: '',
    selectedMonth: ''
  })

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const handleFileUpload = (data: Transaction[]) => {
    setTransactions(data)
    setFilteredTransactions(data)
  }

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    
    let filtered = transactions

    // Apply search filter
    if (newFilters.search) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(newFilters.search.toLowerCase()) ||
        t.category.toLowerCase().includes(newFilters.search.toLowerCase()) ||
        t.partner.toLowerCase().includes(newFilters.search.toLowerCase())
      )
    }

    // Apply date range filter
    // Normalize dates for comparison (handle both YYYY-MM-DD and other formats)
    if (newFilters.startDate) {
      try {
        const startDate = new Date(newFilters.startDate + 'T00:00:00')
        filtered = filtered.filter(t => {
          try {
            // Transaction date is already in YYYY-MM-DD format
            const transDate = new Date(t.date + 'T00:00:00')
            return !isNaN(transDate.getTime()) && transDate >= startDate
          } catch {
            return false
          }
        })
      } catch (error) {
        console.warn('Error filtering by start date:', error)
      }
    }
    if (newFilters.endDate) {
      try {
        // Set end date to end of day (23:59:59) to include the entire day
        const endDate = new Date(newFilters.endDate + 'T23:59:59')
        filtered = filtered.filter(t => {
          try {
            // Transaction date is already in YYYY-MM-DD format
            const transDate = new Date(t.date + 'T00:00:00')
            return !isNaN(transDate.getTime()) && transDate <= endDate
          } catch {
            return false
          }
        })
      } catch (error) {
        console.warn('Error filtering by end date:', error)
      }
    }

    // Apply category filter (categories are now "incoming" and "outgoing")
    // Map "incoming" to "income" and "outgoing" to "expense"
    if (newFilters.categories.length > 0) {
      const categoryTypes = newFilters.categories.map(cat => {
        if (cat === 'incoming') return 'income'
        if (cat === 'outgoing') return 'expense'
        return cat
      })
      filtered = filtered.filter(t => categoryTypes.includes(t.type))
    }

    // Apply partner filter
    if (newFilters.partners.length > 0) {
      filtered = filtered.filter(t => newFilters.partners.includes(t.partner))
    }

    // Apply transaction type filter
    if (newFilters.transactionType !== 'all') {
      filtered = filtered.filter(t => t.type === newFilters.transactionType)
    }

    // Apply amount range filter
    if (newFilters.minAmount) {
      filtered = filtered.filter(t => Math.abs(t.amount) >= parseFloat(newFilters.minAmount))
    }
    if (newFilters.maxAmount) {
      filtered = filtered.filter(t => Math.abs(t.amount) <= parseFloat(newFilters.maxAmount))
    }

    setFilteredTransactions(filtered)
  }

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode)
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        {transactions.length > 0 && (
          <Sidebar
            currentView={currentView}
            onViewChange={setCurrentView}
            darkMode={darkMode}
            onDarkModeToggle={handleDarkModeToggle}
          />
        )}

        {/* Main Content */}
        <div className={`flex-1 ${transactions.length > 0 ? 'ml-64' : ''}`}>
          <div className="container mx-auto px-4 py-8">
            {transactions.length === 0 ? (
              <>
                <header className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    Excel Analytics Dashboard
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Upload your Excel file to visualize financial data with interactive charts
                  </p>
                </header>
                <FileUpload onFileUpload={handleFileUpload} />
              </>
            ) : (
              <>
                {/* Dashboard View - Combined with Transactions */}
                {currentView === 'dashboard' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                          Dashboard
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          Analyzing {transactions.length} transactions
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setTransactions([])
                          setFilteredTransactions([])
                          setCurrentView('dashboard')
                        }}
                        className="btn-secondary"
                      >
                        Upload New File
                      </button>
                    </div>

                    {/* Shared Filter Panel */}
                    <FilterPanel 
                      filters={filters} 
                      onFiltersChange={handleFiltersChange}
                      transactions={transactions}
                    />

                    {/* Dashboard Components */}
                    <Dashboard transactions={filteredTransactions} allTransactions={transactions} />

                    {/* Transactions Table */}
                    <div className="mt-10">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Transactions
                      </h3>
                      <DataTable transactions={filteredTransactions} />
                    </div>
                  </div>
                )}

                {/* Insights View */}
                {currentView === 'insights' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                          Insights
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          Smart analytics and recommendations
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setTransactions([])
                          setFilteredTransactions([])
                          setCurrentView('dashboard')
                        }}
                        className="btn-secondary"
                      >
                        Upload New File
                      </button>
                    </div>

                    <SmartInsights transactions={filteredTransactions} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App