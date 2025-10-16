import type { Transaction } from '../utils/excelParser'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

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



  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Line Chart - Monthly Trends */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Monthly Income vs Expenses
        </h3>
        {lineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No trend data available
          </div>
        )}
      </div>

    </div>
  )
}

export default Charts
