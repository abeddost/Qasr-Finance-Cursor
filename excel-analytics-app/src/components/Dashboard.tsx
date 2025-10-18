import { Suspense, lazy } from 'react'
import type { Transaction } from '../utils/excelParser'
import SummaryCards from './SummaryCards'

// Lazy load heavy chart components
const Charts = lazy(() => import('./Charts'))
const MonthlyComparisonChart = lazy(() => import('./MonthlyComparisonChart'))
const BalanceTrendChart = lazy(() => import('./BalanceTrendChart'))

interface DashboardProps {
  transactions: Transaction[]
  allTransactions: Transaction[]
}

const ChartSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
  </div>
)

const Dashboard = ({ transactions, allTransactions }: DashboardProps) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No transactions to display</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SummaryCards transactions={transactions} allTransactions={allTransactions} />
      
      {/* New Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<ChartSkeleton />}>
          <MonthlyComparisonChart transactions={transactions} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <BalanceTrendChart transactions={transactions} />
        </Suspense>
      </div>
      
      <Suspense fallback={<ChartSkeleton />}>
        <Charts transactions={transactions} />
      </Suspense>
    </div>
  )
}

export default Dashboard
