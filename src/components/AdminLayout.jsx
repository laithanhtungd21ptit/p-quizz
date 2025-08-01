import React from 'react'
import AdminTopControls from './AdminTopControls'
import AdminSidebar from './AdminSidebar'

const AdminLayout = ({ sidebarCollapsed, setSidebarCollapsed, children }) => {
  return (
    <div className="app-root flex h-screen text-white">
      <AdminTopControls
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      <AdminSidebar isCollapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <main
          className={`main-content flex-1 mt-14 p-4 sm:p-6 lg:p-10  ${
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
          {/* watermark */}
          <div className="absolute inset-0 bg-[url('https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/55103466-9ca2-48f4-ad9a-d66952d336ce.png')] bg-center bg-cover opacity-5 pointer-events-none" />
          <div className="relative z-10 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout 