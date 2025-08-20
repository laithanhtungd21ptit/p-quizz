// src/App.jsx
import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet, useNavigate } from 'react-router-dom'

import Sidebar from './components/Sidebar'
import AdminSidebar from './components/AdminSidebar'
import TopControls from './components/TopControls'
import AdminTopControls from './components/AdminTopControls'
import HeaderForController from './components/HeaderForController'
import CreatePageLayout from './components/CreatePageLayout'

import Dashboard from './pages/Dashboard'
import CreatedSets from './pages/CreatedSets'
import SavedSets from './pages/SavedSets'
import History from './pages/History'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import SentActivateLink from './pages/SentActivateLink'
import ActivatedSuccessfully from './pages/ActivatedSuccessfully'
import VerifyCode from './pages/VerifyCode'
import EnterRoomCode from './pages/EnterRoomCode'
import WaitingRoomForController from './pages/WaitingRoomForController'
import WaitingRoomForPlayer from './pages/WaitingRoomForPlayer'
import PlayRoomForController from './pages/PlayRoomForController'
import GameResult from './pages/GameResult'

import ChatTest from './pages/ChatTest'
import SupportCardButtonTest from './pages/SupportCardButtonTest'

import CreateRoom from './pages/CreateRoom'
import CreateQuestionSet from './pages/CreateQuestionSet'
import QuestionSetDetail from './pages/QuestionSetDetail'
import HistoryDetail from './pages/HistoryDetail'
import PreviewPage from './pages/PreviewPage'
import EditPage from './pages/EditPage'
import EditQuestionSet from './pages/EditQuestionSet'
import PlayerGame from './pages/PlayerGame'
import SearchResults from './pages/SearchResults'

// Admin pages
import AccountList from './pages/admin/AccountList'
import ViolationList from './pages/admin/ViolationList'

// Auth
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

/**
 * Layout chung có Sidebar + full TopControls
 */
function MainLayout({ sidebarCollapsed, setSidebarCollapsed }) {
  return (
    <div className="app-root flex h-screen bg-dark-bg text-white font-content">
      <TopControls
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      <Sidebar isCollapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <main
          className={`main-content flex-1 mt-14 p-4 sm:p-6 lg:p-10 relative overflow-x-hidden overflow-y-auto ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
          style={{
            marginLeft: sidebarCollapsed ? 72 : 288,
            transition: 'margin-left 0.2s cubic-bezier(.4,0,.2,1)',
            height: 'calc(100vh - 56px)',
            maxWidth: '100vw',
            minWidth: 0,
          }}
        >
          {/* watermark */}
          <div className="absolute bg-center bg-cover opacity-5 pointer-events-none" />
          <div className="relative z-10 w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

/**
 * Layout cho admin có AdminSidebar + AdminTopControls
 */
function AdminLayout({ sidebarCollapsed, setSidebarCollapsed }) {
  return (
    <div className="app-root flex h-screen text-white font-content">
      <AdminTopControls
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      <AdminSidebar isCollapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <main
          className={`main-content flex-1 mt-14 p-4 sm:p-6 lg:p-10 relative overflow-x-hidden overflow-y-auto ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
          style={{
            marginLeft: sidebarCollapsed ? 72 : 288,
            transition: 'margin-left 0.2s cubic-bezier(.4,0,.2,1)',
            height: 'calc(100vh - 56px)',
            maxWidth: '100vw',
            minWidth: 0,
          }}
        >
          <div className="relative z-10 w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

/**
 * Layout đơn giản chỉ giữ TopControls với props để ẩn menu/logo/search/create
 * và bật nút Quay lại. Nội dung con sẽ render trong <Outlet/>.
 */
function SimpleHeaderLayout() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen text-white font-content">
      <TopControls
        showMenu={false}
        showLogo={false}
        showSearch={false}
        showCreate={false}
        showBack={true}
        sidebarCollapsed={true}
        setSidebarCollapsed={() => {}}
      />
      <div className="pt-14">
        <Outlet />
      </div>
    </div>
  )
}

function HeaderForControllerLayout() {
  return (
    <div className="min-h-screen bg-dark-bg text-white font-content">
      <HeaderForController />
      <div className="pt-14">
        <Outlet />
      </div>
    </div>
  )
}

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  return (
    <Router>
      {/* AuthProvider phải nằm trong Router vì dùng useNavigate */}
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/sent-activate-link" element={<SentActivateLink />} />
          <Route path="/activated-successfully" element={<ActivatedSuccessfully />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/game-result" element={<GameResult />} />

          {/* Routes không có Sidebar và TopControls */}
          <Route path="/create-question-set" element={<CreateQuestionSet />} />
          <Route path="/edit-question-set/:idx" element={<EditQuestionSet />} />
          <Route path="/player-game/:roomId" element={<PlayerGame />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/question-set/:id" element={<QuestionSetDetail />} />
          <Route path="/edit" element={<EditPage />} />

        {/* Những trang chỉ cần header thu gọn */}
        <Route element={<SimpleHeaderLayout />}>
          <Route path="/enter-room-code" element={<EnterRoomCode />} />
          <Route path="/waiting-room-for-player/:roomId" element={<WaitingRoomForPlayer />} />
          <Route path="/chat-test" element={<ChatTest />} />
        </Route>

        {/* Trang cần layout điều khiển (quay lại + kết thúc) */}
        <Route element={<HeaderForControllerLayout />}>
          <Route path="/support-card-button" element={<SupportCardButtonTest />} />
          <Route path="/waiting-room-for-controller/:roomId" element={<WaitingRoomForController />} />
          <Route path="/play-room-for-controller/:roomId" element={<PlayRoomForController />} />
          </Route>

          {/* Route riêng cho tạo phòng */}
          <Route path="/create-room" element={
            <CreatePageLayout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
              <CreateRoom />
            </CreatePageLayout>
          } />

          {/* PROTECTED: Các trang chính yêu cầu auth (MainLayout) */}
          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <MainLayout
                  sidebarCollapsed={sidebarCollapsed}
                  setSidebarCollapsed={setSidebarCollapsed}
                />
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/created-sets" element={<CreatedSets />} />
              <Route path="/saved-sets" element={<SavedSets />} />
              <Route path="/history" element={<History />} />
              <Route path="/history-detail/:roomId" element={<HistoryDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/search" element={<SearchResults />} />
            </Route>
          </Route>

          {/* PROTECTED ADMIN: Admin routes, yêu cầu role ADMIN */}
          <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
            <Route
              element={
                <AdminLayout
                  sidebarCollapsed={sidebarCollapsed}
                  setSidebarCollapsed={setSidebarCollapsed}
                />
              }
            >
              <Route path="/admin/accounts" element={<AccountList />} />
              <Route path="/admin/violations" element={<ViolationList />} />
            </Route>
          </Route>

        </Routes>
      </AuthProvider>
    </Router>
  )
}