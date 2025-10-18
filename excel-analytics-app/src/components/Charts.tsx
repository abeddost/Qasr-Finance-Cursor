import type { Transaction } from '../utils/excelParser'
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface ChartsProps {
  transactions: Transaction[]
}

const Charts = ({ transactions }: ChartsProps) => {

  // Prepare data for line chart (monthly trends)
  const monthlyData = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toISOString().slice(0, 7) // YYYY-MM
    if (!acc[month]) {
      acc[month] = { month, income: 0, expenses: 0 }
    }
    
    if (t.type === 'income') {
      acc[month].income += t.amount
    } else {
      acc[month].expenses += Math.abs(t.amount)
    }
    
    return acc
  }, {} as Record<string, { month: string; income: number; expenses: number }>)

  const lineData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))

  const chartData = {
    labels: lineData.map(d => d.month),
    datasets: [
      {
        label: 'Income',
        data: lineData.map(d => d.income),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.1,
      },
      {
        label: 'Expenses',
        data: lineData.map(d => d.expenses),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.1,
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
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value)
          }
        }
      },
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Line Chart - Monthly Trends */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Monthly Income vs Expenses
        </h3>
        {lineData.length > 0 ? (
          <div className="h-64">
            <Line data={chartData} options={options} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No trend data available
          </div>
        )}
      </div>

    </div>
  )
}

export default Charts
