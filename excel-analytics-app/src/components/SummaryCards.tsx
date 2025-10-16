import type { Transaction } from '../utils/excelParser'
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react'

interface SummaryCardsProps {
  transactions: Transaction[]
  allTransactions: Transaction[]
}

const SummaryCards = ({ transactions, allTransactions }: SummaryCardsProps) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = Math.abs(transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0))

  const balance = totalIncome - totalExpenses

  // Calculate month-over-month changes using all transactions
  const getCurrentMonth = () => {
    const dates = allTransactions.map(t => new Date(t.date))
    const latestDate = new Date(Math.max(...dates.map(d => d.getTime())))
    return `${latestDate.getFullYear()}-${String(latestDate.getMonth() + 1).padStart(2, '0')}`
  }

  const getPreviousMonth = (currentMonth: string) => {
    const [year, month] = currentMonth.split('-').map(Number)
    const prevDate = new Date(year, month - 2, 1) // month - 1 - 1 = month - 2
    return `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`
  }

  const currentMonth = getCurrentMonth()
  const previousMonth = getPreviousMonth(currentMonth)

  const currentMonthTransactions = allTransactions.filter(t => 
    t.date.startsWith(currentMonth)
  )

  const previousMonthTransactions = allTransactions.filter(t => 
    t.date.startsWith(previousMonth)
  )

  const currentMonthIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const previousMonthIncome = previousMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const currentMonthExpenses = Math.abs(currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0))

  const previousMonthExpenses = Math.abs(previousMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0))

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const incomeChange = calculateChange(currentMonthIncome, previousMonthIncome)
  const expenseChange = calculateChange(currentMonthExpenses, previousMonthExpenses)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    const abs = Math.abs(value)
    return `${abs.toFixed(1)}%`
  }

  const cards = [
    {
      title: 'Total Income',
      value: formatCurrency(totalIncome),
      change: incomeChange,
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      changeColor: incomeChange >= 0 ? 'text-emerald-600' : 'text-red-600'
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      change: expenseChange,
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      changeColor: expenseChange >= 0 ? 'text-red-600' : 'text-emerald-600'
    },
    {
      title: 'Net Balance',
      value: formatCurrency(balance),
      change: null,
      icon: Wallet,
      color: balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400',
      bgColor: balance >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-red-50 dark:bg-red-900/20',
      iconColor: balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400',
      changeColor: ''
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div key={index} className="card hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {card.title}
                </p>
                <p className={`text-3xl font-bold ${card.color}`}>
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </div>
            
            {card.change !== null && (
              <div className="flex items-center space-x-1">
                {card.change >= 0 ? (
                  <TrendingUp className={`h-4 w-4 ${card.changeColor}`} />
                ) : (
                  <TrendingDown className={`h-4 w-4 ${card.changeColor}`} />
                )}
                <span className={`text-sm font-medium ${card.changeColor}`}>
                  {card.change >= 0 ? '↑' : '↓'} {formatPercentage(card.change)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">vs last month</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default SummaryCards