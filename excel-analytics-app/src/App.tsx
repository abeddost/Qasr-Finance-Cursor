import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import FileUpload from './components/FileUpload'
import Dashboard from './components/Dashboard'
import FilterPanel from './components/FilterPanel'
import DataTable from './components/DataTable'
import SmartInsights from './components/SmartInsights'
import type { Transaction } from './utils/excelParser'

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [currentView, setCurrentView] = useState<'dashboard' | 'transactions' | 'insights'>('dashboard')
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
    if (newFilters.startDate) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(newFilters.startDate))
    }
    if (newFilters.endDate) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(newFilters.endDate))
    }

    // Apply category filter
    if (newFilters.categories.length > 0) {
      filtered = filtered.filter(t => newFilters.categories.includes(t.category))
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
              {/* Dashboard View */}
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

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Dashboard Overview
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Your financial analytics at a glance
                    </p>
                  </div>

                  <FilterPanel 
                    filters={filters} 
                    onFiltersChange={handleFiltersChange}
                    transactions={transactions}
                  />

                  <Dashboard transactions={filteredTransactions} allTransactions={transactions} />
                </div>
              )}

              {/* Transactions View */}
              {currentView === 'transactions' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Transactions
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        View and manage all your transactions
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

                  <FilterPanel 
                    filters={filters} 
                    onFiltersChange={handleFiltersChange}
                    transactions={transactions}
                  />

                  <DataTable transactions={filteredTransactions} />
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
  )
}

export default App