import React from 'react'
import AdminSearchInput from '../../components/AdminSearchInput'

const ViolationList = () => {
  return (
    <div className="w-full">
      {/* Header with image and button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <img 
            src="/public/ViolationList.png" 
            alt="Violation Management" 
            className="mr-4 w-3/5 h-3/5"
          />
        </div>
        <button className="bg-[#ED005D] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-[#d10052] transition-colors flex items-center gap-1.5 text-xs">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Thêm mới vi phạm
        </button>
      </div>
      
      {/* Breadcrumb */}
      <div className="text-sm text-white font-bold mb-4 font-content">
        <span className="font-bold">QUẢN LÍ TÀI KHOẢN</span>
        <span className="mx-2">{'>'}</span>
        <span className="font-bold">Danh sách vi phạm</span>
      </div>
      
            {/* Content will be added later */}
      
      {/* White background container */}
      <div className="p-6 bg-white min-h-screen rounded-lg">
        {/* Search */}
        <div className="mb-4 flex justify-start">
          <div className="relative w-80 z-[9998]">
            <AdminSearchInput
              placeholder="Tìm kiếm theo tên/ Tài khoản"
              suggestions={[
                "Nguyễn Thị Quỳnh - Vi phạm spam",
                "Trần Văn An - Vi phạm nội dung",
                "Lê Thị Bình - Vi phạm quy tắc",
                "Phạm Hoàng Cường - Vi phạm bảo mật",
                "Hoàng Thị Dung - Vi phạm spam",
                "Vũ Minh Đức - Vi phạm nội dung",
                "Đặng Thị Em - Vi phạm quy tắc",
                "Ngô Văn Phúc - Vi phạm bảo mật",
                "Lý Thị Giang - Vi phạm spam",
                "Bùi Hoàng Hải - Vi phạm nội dung"
              ]}
              onSearch={(value) => {
                console.log('Searching for violation:', value)
                // Thêm logic tìm kiếm vi phạm ở đây
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-gray-700 border border-gray-200 rounded-lg font-content">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="py-3 px-4">STT</th>
                <th className="py-3 px-4">Tên</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 cursor-pointer select-none">
                  Thời gian tạo 
                  <i className="fas fa-arrow-up ml-1"></i>
                </th>
                <th className="py-3 px-4">Mức độ vi phạm</th>
                <th className="py-3 px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {Array(10).fill().map((_, i) => (
                <tr key={i} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-4">{i + 1}</td>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <img 
                      src="https://randomuser.me/api/portraits/women/44.jpg" 
                      className="w-6 h-6 rounded-full" 
                      alt="Avatar"
                    />
                    Nguyễn Thị Quỳnh
                  </td>
                  <td className="py-3 px-4">ntq@gmail.com</td>
                  <td className="py-3 px-4">2025-01-01</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      i % 3 === 0 ? 'bg-red-100 text-red-800' : 
                      i % 3 === 1 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {i % 3 === 0 ? 'Nặng' : i % 3 === 1 ? 'Vừa' : 'Nhẹ'}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-5">
                    <button className="text-green-600 bg-gray-100 hover:bg-gray-200 rounded transition">
                      <i className="fas fa-pen-to-square"></i>
                    </button>
                    <button className="text-red-600 bg-gray-100 hover:bg-gray-200 rounded transition">
                      <i className="fas fa-trash"></i>
                    </button>
                    <button className="text-red-600 bg-gray-100 hover:bg-gray-200 rounded transition">
                      <i className="fas fa-lock"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-end space-x-2">
          <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-200 text-black">&lt;</button>
          <button className="px-3 py-1 rounded border bg-pink-500 text-white">1</button>
          <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-200 text-black">2</button>
          <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-200 text-black">3</button>
          <span className="px-3 py-1 text-black">...</span>
          <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-200 text-black">10</button>
          <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-200 text-black">&gt;</button>
        </div>
      </div>    </div>
  )
}

export default ViolationList 