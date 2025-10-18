import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import type { Transaction } from '../utils/excelParser'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

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

  const chartData = {
    labels: monthlyData.map(d => d.label),
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map(d => d.income),
        backgroundColor: '#10B981',
        borderRadius: 4,
      },
      {
        label: 'Expenses',
        data: monthlyData.map(d => d.expenses),
        backgroundColor: '#EF4444',
        borderRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Income vs Expenses',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return `$${value.toLocaleString()}`
          }
        }
      },
    },
  }

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
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}

export default MonthlyComparisonChart


