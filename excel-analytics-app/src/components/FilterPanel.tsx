import { useState } from 'react'
import { Search, Filter, X, Calendar } from 'lucide-react'
import type { Transaction } from '../utils/excelParser'

interface FilterPanelProps {
  filters: {
    search: string
    startDate: string
    endDate: string
    categories: string[]
    partners: string[]
    transactionType: 'all' | 'income' | 'expense'
    minAmount: string
    maxAmount: string
    selectedMonth: string
  }
  onFiltersChange: (filters: FilterPanelProps['filters']) => void
  transactions: Transaction[]
}

const FilterPanel = ({ filters, onFiltersChange, transactions }: FilterPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Get unique categories and partners from transactions
  const categories = Array.from(new Set(transactions.map(t => t.category))).sort()
  const partners = Array.from(new Set(transactions.map(t => t.partner))).sort()
  
  // Get amount range from transactions
  const amounts = transactions.map(t => Math.abs(t.amount))
  const minAmount = amounts.length > 0 ? Math.min(...amounts) : 0
  const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0

  // Get available months from transactions
  const availableMonths = Array.from(new Set(
    transactions.map(t => {
      const date = new Date(t.date)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    })
  )).sort().map(monthKey => {
    const [year, month] = monthKey.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return {
      key: monthKey,
      label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }
  })

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    
    handleFilterChange('categories', newCategories)
  }

  const handlePartnerToggle = (partner: string) => {
    const newPartners = filters.partners.includes(partner)
      ? filters.partners.filter(p => p !== partner)
      : [...filters.partners, partner]
    
    handleFilterChange('partners', newPartners)
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      startDate: '',
      endDate: '',
      categories: [],
      partners: [],
      transactionType: 'all',
      minAmount: '',
      maxAmount: '',
      selectedMonth: ''
    })
  }

  const handleMonthSelect = (monthKey: string) => {
    if (monthKey === '') {
      handleFilterChange('selectedMonth', '')
      return
    }
    
    const [year, month] = monthKey.split('-')
    const startDate = `${year}-${month}-01`
    const endDate = `${year}-${month}-${new Date(parseInt(year), parseInt(month), 0).getDate()}`
    
    handleFilterChange('selectedMonth', monthKey)
    handleFilterChange('startDate', startDate)
    handleFilterChange('endDate', endDate)
  }

  const hasActiveFilters = filters.search || filters.startDate || filters.endDate || 
    filters.categories.length > 0 || filters.partners.length > 0 || 
    filters.transactionType !== 'all' || filters.minAmount || filters.maxAmount ||
    filters.selectedMonth

  return (
    <div className="card dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center space-x-1"
            >
              <X className="h-4 w-4" />
              <span>Clear all</span>
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>{isExpanded ? 'Hide' : 'Show'} Filters</span>
          </button>
        </div>
      </div>

      {/* Search Bar - Always Visible */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search transactions..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="input-field pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Expandable Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Quick Month Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Select Month
            </label>
            <select
              value={filters.selectedMonth}
              onChange={(e) => handleMonthSelect(e.target.value)}
              className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Months</option>
              {availableMonths.map(month => (
                <option key={month.key} value={month.key}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transaction Type
            </label>
            <select
              value={filters.transactionType}
              onChange={(e) => handleFilterChange('transactionType', e.target.value as 'all' | 'income' | 'expense')}
              className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Amount Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Min Amount
            </label>
            <input
              type="number"
              placeholder={`Min: $${minAmount.toFixed(0)}`}
              value={filters.minAmount}
              onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Amount
            </label>
            <input
              type="number"
              placeholder={`Max: $${maxAmount.toFixed(0)}`}
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              min="0"
            />
          </div>

          {/* Partners */}
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Partners
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 dark:bg-gray-700">
              {partners.map(partner => (
                <label key={partner} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    checked={filters.partners.includes(partner)}
                    onChange={() => handlePartnerToggle(partner)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{partner}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categories
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 dark:bg-gray-700">
              {categories.map(category => (
                <label key={category} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                Search: "{filters.search}"
              </span>
            )}
            {filters.transactionType !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                Type: {filters.transactionType}
              </span>
            )}
            {filters.startDate && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                From: {filters.startDate}
              </span>
            )}
            {filters.endDate && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                To: {filters.endDate}
              </span>
            )}
            {filters.partners.map(partner => (
              <span key={partner} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                Partner: {partner}
              </span>
            ))}
            {filters.categories.map(category => (
              <span key={category} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                {category}
              </span>
            ))}
            {filters.minAmount && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                Min: ${filters.minAmount}
              </span>
            )}
            {filters.maxAmount && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                Max: ${filters.maxAmount}
              </span>
            )}
            {filters.selectedMonth && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                <Calendar className="h-3 w-3 mr-1" />
                {availableMonths.find(m => m.key === filters.selectedMonth)?.label}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterPanel