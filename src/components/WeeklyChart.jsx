import React from 'react'

const WeeklyChart = ({ data = [] }) => {
  const maxValue = data.length > 0 ? Math.max(...data.map(d => Math.max(d.quizzes || 0, d.users || 0))) : 1

  return (
    <div className="h-64">
      <div className="flex items-end justify-between h-full gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            {/* Bars */}
            <div className="w-full flex items-end gap-1 mb-2">
              <div 
                className="flex-1 bg-blue-500/40 rounded-t"
                style={{ 
                  height: `${((item.quizzes || 0) / maxValue) * 100}%`,
                  minHeight: '4px'
                }}
              />
              <div 
                className="flex-1 bg-green-500/40 rounded-t"
                style={{ 
                  height: `${((item.users || 0) / maxValue) * 100}%`,
                  minHeight: '4px'
                }}
              />
            </div>
            
            {/* Day label */}
            <span className="text-xs text-gray-400">
              {(() => {
                const date = new Date(item.date);
                const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                return days[date.getDay()];
              })()}
            </span>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500/40 rounded"></div>
          <span className="text-sm text-gray-400">Số bộ câu hỏi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500/40 rounded"></div>
          <span className="text-sm text-gray-400">Số người đăng ký</span>
        </div>
      </div>
    </div>
  )
}

export default WeeklyChart 