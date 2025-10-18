import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { Transaction } from '../utils/excelParser'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface BalanceTrendChartProps {
  transactions: Transaction[]
}

const BalanceTrendChart = ({ transactions }: BalanceTrendChartProps) => {
  // Calculate cumulative balance over time
  const balanceData = React.useMemo(() => {
    if (transactions.length === 0) return []

    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    let cumulativeBalance = 0
    const data = sortedTransactions.map((transaction) => {
      cumulativeBalance += transaction.amount
      
      const date = new Date(transaction.date)
      const dateLabel = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
      
      return {
        date: dateLabel,
        balance: cumulativeBalance,
        amount: transaction.amount,
        type: transaction.type
      }
    })

    return data
  }, [transactions])

  const chartData = {
    labels: balanceData.map(d => d.date),
    datasets: [
      {
        label: 'Cumulative Balance',
        data: balanceData.map(d => d.balance),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
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
        text: 'Balance Trend Over Time',
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function(value: any) {
            return `$${value.toLocaleString()}`
          }
        }
      },
    },
  }

  if (balanceData.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Balance Trend Over Time
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
        Balance Trend Over Time
      </h3>
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}

export default BalanceTrendChart

