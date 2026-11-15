import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface SubjectBreakdownProps {
  data: Array<{
    name: string
    hours: number
    color: string
  }>
}

export const SubjectBreakdown: React.FC<SubjectBreakdownProps> = ({ data }) => {
  const filteredData = data.filter((d) => d.hours > 0)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Subject Distribution</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Time allocation across 6 subjects</p>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-400 dark:text-gray-500">
          No study session data available yet.
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                dataKey="hours"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  borderRadius: '0.75rem',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${val} hrs`, 'Study Time']}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
