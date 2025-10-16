import type { Transaction } from './excelParser'

export interface Insight {
  id: string
  type: 'trend' | 'warning' | 'achievement' | 'recommendation'
  title: string
  description: string
  value?: string
  icon: string
  color: string
}

export const generateInsights = (transactions: Transaction[]): Insight[] => {
  const insights: Insight[] = []

  if (transactions.length === 0) return insights

  // Calculate basic metrics
  const incomeTransactions = transactions.filter(t => t.type === 'income')
  const expenseTransactions = transactions.filter(t => t.type === 'expense')
  
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = Math.abs(expenseTransactions.reduce((sum, t) => sum + t.amount, 0))
  const balance = totalIncome - totalExpenses

  // Group transactions by month
  const monthlyData = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toISOString().slice(0, 7) // YYYY-MM
    if (!acc[month]) {
      acc[month] = { income: 0, expenses: 0, count: 0 }
    }
    
    if (t.type === 'income') {
      acc[month].income += t.amount
    } else {
      acc[month].expenses += Math.abs(t.amount)
    }
    acc[month].count++
    
    return acc
  }, {} as Record<string, { income: number; expenses: number; count: number }>)

  const months = Object.keys(monthlyData).sort()
  const currentMonth = months[months.length - 1]
  const previousMonth = months[months.length - 2]

  // Partner analysis
  const partnerExpenses = expenseTransactions.reduce((acc, t) => {
    acc[t.partner] = (acc[t.partner] || 0) + Math.abs(t.amount)
    return acc
  }, {} as Record<string, number>)

  const topPartner = Object.entries(partnerExpenses).sort(([,a], [,b]) => b - a)[0]

  // Category analysis
  const categoryExpenses = expenseTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
    return acc
  }, {} as Record<string, number>)

  const topCategory = Object.entries(categoryExpenses).sort(([,a], [,b]) => b - a)[0]

  // Date analysis
  const dailyExpenses = expenseTransactions.reduce((acc, t) => {
    const date = t.date
    acc[date] = (acc[date] || 0) + Math.abs(t.amount)
    return acc
  }, {} as Record<string, number>)

  const highestSpendingDay = Object.entries(dailyExpenses).sort(([,a], [,b]) => b - a)[0]

  // Generate insights based on available data

  // 1. Monthly trend analysis
  if (currentMonth && previousMonth && monthlyData[currentMonth] && monthlyData[previousMonth]) {
    const currentIncome = monthlyData[currentMonth].income
    const previousIncome = monthlyData[previousMonth].income
    const currentExpenses = monthlyData[currentMonth].expenses
    const previousExpenses = monthlyData[previousMonth].expenses

    // Income trend
    if (previousIncome > 0) {
      const incomeChange = ((currentIncome - previousIncome) / previousIncome) * 100
      insights.push({
        id: 'income-trend',
        type: incomeChange >= 0 ? 'achievement' : 'warning',
        title: 'Income Trend',
        description: incomeChange >= 0 
          ? `Your income increased by ${Math.abs(incomeChange).toFixed(1)}% this month`
          : `Your income decreased by ${Math.abs(incomeChange).toFixed(1)}% this month`,
        value: `$${currentIncome.toLocaleString()}`,
        icon: incomeChange >= 0 ? '📈' : '📉',
        color: incomeChange >= 0 ? 'text-green-600' : 'text-red-600'
      })
    }

    // Expense trend
    if (previousExpenses > 0) {
      const expenseChange = ((currentExpenses - previousExpenses) / previousExpenses) * 100
      insights.push({
        id: 'expense-trend',
        type: expenseChange <= 0 ? 'achievement' : 'warning',
        title: 'Expense Trend',
        description: expenseChange <= 0 
          ? `Great! Your expenses decreased by ${Math.abs(expenseChange).toFixed(1)}% this month`
          : `Your expenses increased by ${Math.abs(expenseChange).toFixed(1)}% this month`,
        value: `$${currentExpenses.toLocaleString()}`,
        icon: expenseChange <= 0 ? '💰' : '💸',
        color: expenseChange <= 0 ? 'text-green-600' : 'text-orange-600'
      })
    }
  }

  // 2. Top spending partner
  if (topPartner && topPartner[1] > 0) {
    const percentage = (topPartner[1] / totalExpenses) * 100
    insights.push({
      id: 'top-partner',
      type: 'trend',
      title: 'Top Spending Partner',
      description: `${topPartner[0]} was your biggest expense partner with ${percentage.toFixed(1)}% of total spending`,
      value: `$${topPartner[1].toLocaleString()}`,
      icon: '👥',
      color: 'text-blue-600'
    })
  }

  // 3. Top spending category
  if (topCategory && topCategory[1] > 0) {
    const percentage = (topCategory[1] / totalExpenses) * 100
    insights.push({
      id: 'top-category',
      type: 'trend',
      title: 'Top Spending Category',
      description: `You spent most on ${topCategory[0]} (${percentage.toFixed(1)}% of expenses)`,
      value: `$${topCategory[1].toLocaleString()}`,
      icon: '🏷️',
      color: 'text-purple-600'
    })
  }

  // 4. Balance analysis
  if (balance >= 0) {
    insights.push({
      id: 'positive-balance',
      type: 'achievement',
      title: 'Positive Balance',
      description: `Excellent! You have a positive balance of $${balance.toLocaleString()}`,
      value: `$${balance.toLocaleString()}`,
      icon: '✅',
      color: 'text-green-600'
    })
  } else {
    insights.push({
      id: 'negative-balance',
      type: 'warning',
      title: 'Negative Balance',
      description: `You have a negative balance of $${Math.abs(balance).toLocaleString()}. Consider reducing expenses.`,
      value: `-$${Math.abs(balance).toLocaleString()}`,
      icon: '⚠️',
      color: 'text-red-600'
    })
  }

  // 5. Highest spending day
  if (highestSpendingDay && highestSpendingDay[1] > 0) {
    const date = new Date(highestSpendingDay[0]).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
    insights.push({
      id: 'highest-day',
      type: 'trend',
      title: 'Highest Spending Day',
      description: `Your biggest spending day was ${date} with $${highestSpendingDay[1].toLocaleString()}`,
      value: `$${highestSpendingDay[1].toLocaleString()}`,
      icon: '📅',
      color: 'text-orange-600'
    })
  }

  // 6. Transaction frequency
  const avgTransactionsPerMonth = transactions.length / months.length
  if (avgTransactionsPerMonth > 0) {
    insights.push({
      id: 'transaction-frequency',
      type: 'trend',
      title: 'Transaction Activity',
      description: `You average ${avgTransactionsPerMonth.toFixed(1)} transactions per month`,
      value: `${transactions.length} total`,
      icon: '📊',
      color: 'text-indigo-600'
    })
  }

  // 7. Savings rate
  if (totalIncome > 0) {
    const savingsRate = (balance / totalIncome) * 100
    if (savingsRate > 0) {
      insights.push({
        id: 'savings-rate',
        type: 'achievement',
        title: 'Savings Rate',
        description: `You're saving ${savingsRate.toFixed(1)}% of your income - great job!`,
        value: `${savingsRate.toFixed(1)}%`,
        icon: '🎯',
        color: 'text-green-600'
      })
    } else {
      insights.push({
        id: 'spending-rate',
        type: 'warning',
        title: 'Spending Rate',
        description: `You're spending ${Math.abs(savingsRate).toFixed(1)}% more than you earn`,
        value: `${Math.abs(savingsRate).toFixed(1)}%`,
        icon: '💸',
        color: 'text-red-600'
      })
    }
  }

  // 8. Partner diversity
  const uniquePartners = Object.keys(partnerExpenses).length
  if (uniquePartners > 1) {
    insights.push({
      id: 'partner-diversity',
      type: 'trend',
      title: 'Partner Diversity',
      description: `You transact with ${uniquePartners} different partners`,
      value: `${uniquePartners} partners`,
      icon: '🤝',
      color: 'text-teal-600'
    })
  }

  // Sort insights by priority (achievements first, then trends, then warnings)
  const priorityOrder = { achievement: 0, trend: 1, recommendation: 2, warning: 3 }
  return insights.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type])
}

