import type { Transaction } from '../utils/excelParser'
import SummaryCards from './SummaryCards'
import Charts from './Charts'
import MonthlyComparisonChart from './MonthlyComparisonChart'
import BalanceTrendChart from './BalanceTrendChart'

interface DashboardProps {
  transactions: Transaction[]
  allTransactions: Transaction[]
}

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
        <MonthlyComparisonChart transactions={transactions} />
        <BalanceTrendChart transactions={transactions} />
      </div>
      
      <Charts transactions={transactions} />
    </div>
  )
}

export default Dashboard
