import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopControls from './components/TopControls'
import Dashboard from './pages/Dashboard'
import CreatedSets from './pages/CreatedSets'
import SavedSets from './pages/SavedSets'
import History from './pages/History'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
// import HistoryStatTest from './pages/HistoryStatTest'

// Layout chung cho các trang cần sidebar & top controls
function MainLayout({ sidebarCollapsed, setSidebarCollapsed }) {
  return (
    <div className="app-root flex h-screen bg-dark-bg text-white">
      <TopControls
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      <Sidebar isCollapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <main
          className={`main-content flex-1 mt-14 p-4 sm:p-6 lg:p-10 bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-purple-900/20 relative overflow-x-hidden overflow-y-auto ${
            sidebarCollapsed ? 'sidebar-collapsed' : ''
          }`}
          style={{
            marginLeft: sidebarCollapsed ? 72 : 288,
            transition: 'margin-left 0.2s cubic-bezier(.4,0,.2,1)',
            height: 'calc(100vh - 56px)',
            maxWidth: '100vw',
            minWidth: 0,
          }}
        >
          {/* Background watermark */}
          <div className="absolute inset-0 bg-[url('https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/55103466-9ca2-48f4-ad9a-d66952d336ce.png')] bg-center bg-cover opacity-5 pointer-events-none"></div>
          <div className="relative z-10 w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <Router>
      <Routes>
        {/* Trang đăng nhập không cần sidebar & top controls */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* <Route path="/history-stat-test" element={<HistoryStatTest />} /> */}

        {/* Các trang còn lại nằm trong MainLayout */}
        <Route
          element={
            <MainLayout
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
            />
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/created-sets" element={<CreatedSets />} />
          <Route path="/saved-sets" element={<SavedSets />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  )
}
