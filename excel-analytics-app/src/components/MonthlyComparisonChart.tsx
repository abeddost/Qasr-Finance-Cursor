import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { Transaction } from '../utils/excelParser'

interface MonthlyComparisonChartProps {
  transactions: Transaction[]
}

const MonthlyComparisonChart = ({ transactions }: MonthlyComparisonChartProps) => {
  // Group transactions by month
  const monthlyData = React.useMemo(() => {
    const monthMap = new Map<string, { income: number; expenses: number; label: string }>()
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { income: 0, expenses: 0, label: monthLabel })
      }
      
      const monthData = monthMap.get(monthKey)!
      if (transaction.type === 'income') {
        monthData.income += transaction.amount
      } else {
        monthData.expenses += Math.abs(transaction.amount)
      }
    })
    
    return Array.from(monthMap.values())
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [transactions])

  if (monthlyData.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Monthly Income vs Expenses
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No data available for the selected period
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Monthly Income vs Expenses
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="label" 
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `$${value.toLocaleString()}`, 
                name === 'income' ? 'Income' : 'Expenses'
              ]}
              labelFormatter={(label) => `Month: ${label}`}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend />
            <Bar 
              dataKey="income" 
              fill="#10B981" 
              name="Income"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="expenses" 
              fill="#EF4444" 
              name="Expenses"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default MonthlyComparisonChart

