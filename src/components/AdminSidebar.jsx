import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const AdminSidebar = ({ isCollapsed }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [accountManagementOpen, setAccountManagementOpen] = useState(false)

  const isActive = (path) => {
    return location.pathname === path
  }

  const isAccountManagementActive = () => {
    return location.pathname === '/admin/accounts' || location.pathname === '/admin/violations'
  }

  return (
    <div
      className={`fixed left-0 top-14 h-full bg-black border-r border-white/10 z-40 transition-all duration-300 shadow-[2px_0_10px_rgba(237,0,93,0.3)] ${
        isCollapsed ? 'w-18' : 'w-72'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-white/10">
          {!isCollapsed && (
            <div className="text-white font-bold text-xl">Admin</div>
          )}
          {isCollapsed && (
            <div className="text-white font-bold text-lg">A</div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {/* Dashboard */}
          <div
            className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              isActive('/admin/dashboard')
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => navigate('/admin/dashboard')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
            </svg>
            {!isCollapsed && <span className="ml-3">Dashboard</span>}
          </div>

          {/* Account Management with Dropdown */}
          <div>
            <div
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                isAccountManagementActive()
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => setAccountManagementOpen(!accountManagementOpen)}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                {!isCollapsed && <span className="ml-3">Quản lý tài khoản</span>}
              </div>
              {!isCollapsed && (
                <svg
                  className={`w-4 h-4 transition-transform ${accountManagementOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>

            {/* Dropdown Menu */}
            {accountManagementOpen && !isCollapsed && (
              <div className="ml-8 mt-2 space-y-1">
                <div
                  className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    isActive('/admin/accounts')
                      ? 'bg-pink-500/20 text-pink-300'
                      : 'text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => navigate('/admin/accounts')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="ml-3 text-sm">Danh sách tài khoản</span>
                </div>
                <div
                  className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    isActive('/admin/violations')
                      ? 'bg-pink-500/20 text-pink-300'
                      : 'text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => navigate('/admin/violations')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="ml-3 text-sm">Danh sách vi phạm</span>
                </div>
              </div>
            )}
          </div>


        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center">
            <img
              className="w-8 h-8 rounded-full"
              src="/public/avatar/avatar_1.png"
              alt="Admin"
            />
            {!isCollapsed && (
              <div className="ml-3">
                <div className="text-sm font-medium text-white">Admin</div>
                <div className="text-xs text-gray-400">Quản trị viên</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSidebar 