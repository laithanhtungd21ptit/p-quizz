import React from 'react'

const StatsPanel = ({ title, value, change, changeType, icon: Icon }) => {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:bg-gray-800/70 transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-pink-500/10 rounded-lg">
          <Icon className="w-6 h-6 text-pink-500" />
        </div>
        <div className={`text-sm font-medium px-2 py-1 rounded-full ${
          changeType === 'positive' 
            ? 'text-green-400 bg-green-400/10' 
            : 'text-red-400 bg-red-400/10'
        }`}>
          {change}
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  )
}

export default StatsPanel 