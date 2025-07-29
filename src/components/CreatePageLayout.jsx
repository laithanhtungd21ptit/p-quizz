import React from 'react'
// import Sidebar from './Sidebar'

const CreatePageLayout = ({ children, sidebarCollapsed, setSidebarCollapsed }) => {
  return (
    <div className="app-root flex h-screen bg-dark-bg text-white">
      {/* Không render Sidebar ở layout này */}
      <div className="flex-1 flex flex-col min-w-0">
        <main
          // className={`main-content flex-1 p-4 sm:p-6 lg:p-10 bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-purple-900/20 relative overflow-x-hidden overflow-y-auto ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
          // style={{
          //   marginLeft: 0,
          //   transition: 'margin-left 0.2s cubic-bezier(.4,0,.2,1)',
          //   height: '100vh',
          //   maxWidth: '100vw',
          //   minWidth: 0
          // }}
        >
          {/* <div className="absolute inset-0 bg-[url('https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/55103466-9ca2-48f4-ad9a-d66952d336ce.png')] bg-center bg-cover opacity-5 pointer-events-none"></div> */}
          <div className="relative z-10 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default CreatePageLayout 