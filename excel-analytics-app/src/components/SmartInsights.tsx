import { useState } from 'react'
import { TrendingUp, AlertTriangle, Target, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import type { Transaction } from '../utils/excelParser'
import { generateInsights, type Insight } from '../utils/insightsGenerator'

interface SmartInsightsProps {
  transactions: Transaction[]
}

const SmartInsights = ({ transactions }: SmartInsightsProps) => {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null)
  
  const insights = generateInsights(transactions)

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'achievement':
        return <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
      case 'trend':
        return <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      case 'recommendation':
        return <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      default:
        return <Lightbulb className="h-5 w-5 text-gray-600 dark:text-gray-400" />
    }
  }

  const getInsightBorderColor = (type: Insight['type']) => {
    switch (type) {
      case 'achievement':
        return 'border-l-green-500 dark:border-l-green-400'
      case 'warning':
        return 'border-l-red-500 dark:border-l-red-400'
      case 'trend':
        return 'border-l-blue-500 dark:border-l-blue-400'
      case 'recommendation':
        return 'border-l-yellow-500 dark:border-l-yellow-400'
      default:
        return 'border-l-gray-500 dark:border-l-gray-400'
    }
  }

  const getInsightBgColor = (type: Insight['type']) => {
    switch (type) {
      case 'achievement':
        return 'bg-green-50 dark:bg-green-900/20'
      case 'warning':
        return 'bg-red-50 dark:bg-red-900/20'
      case 'trend':
        return 'bg-blue-50 dark:bg-blue-900/20'
      case 'recommendation':
        return 'bg-yellow-50 dark:bg-yellow-900/20'
      default:
        return 'bg-gray-50 dark:bg-gray-900/20'
    }
  }

  if (insights.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Smart Insights
        </h3>
        <div className="text-center py-8">
          <Lightbulb className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Upload transaction data to get personalized insights and recommendations
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Smart Insights
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            AI-powered analytics and recommendations based on your data
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {insights.length} insights
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`border-l-4 ${getInsightBorderColor(insight.type)} bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`p-2 rounded-full ${getInsightBgColor(insight.type)}`}>
                    {getInsightIcon(insight.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {insight.title}
                      </h4>
                      <span className="text-2xl" role="img" aria-label="emoji">
                        {insight.icon}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {insight.description}
                    </p>
                    
                    {insight.value && (
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getInsightBgColor(insight.type)} ${insight.color}`}>
                        {insight.value}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setExpandedInsight(
                    expandedInsight === insight.id ? null : insight.id
                  )}
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  {expandedInsight === insight.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>

              {expandedInsight === insight.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {getDetailedInsight(insight)}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {insights.filter(i => i.type === 'achievement').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Achievements
          </div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {insights.filter(i => i.type === 'trend').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Trends
          </div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {insights.filter(i => i.type === 'warning').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Warnings
          </div>
        </div>
      </div>
    </div>
  )
}

const getDetailedInsight = (insight: Insight): string => {
  switch (insight.id) {
    case 'income-trend':
      return "Track your income patterns to identify opportunities for growth and stability."
    case 'expense-trend':
      return "Monitor spending trends to maintain financial health and identify areas for optimization."
    case 'top-partner':
      return "Understanding your spending partners helps in budgeting and relationship management."
    case 'top-category':
      return "Focus on high-spending categories to identify potential savings opportunities."
    case 'positive-balance':
      return "Maintaining positive cash flow is key to financial stability and growth."
    case 'negative-balance':
      return "Consider reviewing your expenses and finding ways to increase income or reduce spending."
    case 'highest-day':
      return "Identify patterns in high-spending days to better plan and budget."
    case 'transaction-frequency':
      return "Transaction frequency can indicate spending patterns and financial activity levels."
    case 'savings-rate':
      return "A good savings rate helps build emergency funds and achieve financial goals."
    case 'spending-rate':
      return "Monitor spending to ensure it stays within income limits for financial stability."
    case 'partner-diversity':
      return "Diversified partnerships can indicate healthy business relationships and risk distribution."
    default:
      return "This insight provides valuable information about your financial patterns and trends."
  }
}

export default SmartInsights

