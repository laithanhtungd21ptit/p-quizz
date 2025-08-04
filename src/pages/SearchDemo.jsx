import React from 'react'
import SearchInput from '../components/SearchInput'
import AdminSearchInput from '../components/AdminSearchInput'

const SearchDemo = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 font-content">Demo Tính Năng Tìm Kiếm với Gợi Ý</h1>
        
        <div className="grid gap-8">
          {/* Demo 1: SearchInput cho TopControls */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 font-content">1. Tìm Kiếm Bộ Câu Hỏi (TopControls Style)</h2>
            <div className="max-w-md">
              <SearchInput
                placeholder="Tìm kiếm bộ câu hỏi..."
                suggestions={[
                  "Toán học cơ bản",
                  "Văn học Việt Nam", 
                  "Lịch sử thế giới",
                  "Địa lý Việt Nam",
                  "Tiếng Anh giao tiếp",
                  "Vật lý cơ học",
                  "Hóa học vô cơ",
                  "Sinh học tế bào",
                  "Công nghệ thông tin",
                  "Kinh tế học"
                ]}
                onSearch={(value) => {
                  console.log('Searching for quiz:', value)
                }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 font-content">
              • Gõ để xem gợi ý • Sử dụng phím mũi tên để di chuyển • Enter để chọn • Escape để đóng
            </p>
          </div>

          {/* Demo 2: AdminSearchInput cho Admin Pages */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 font-content">2. Tìm Kiếm Tài Khoản (Admin Style)</h2>
            <div className="max-w-md">
              <AdminSearchInput
                placeholder="Tìm kiếm theo tên/ Tài khoản"
                suggestions={[
                  "Nguyễn Thị Quỳnh",
                  "Trần Văn An",
                  "Lê Thị Bình",
                  "Phạm Hoàng Cường",
                  "Hoàng Thị Dung",
                  "Vũ Minh Đức",
                  "Đặng Thị Em",
                  "Ngô Văn Phúc",
                  "Lý Thị Giang",
                  "Bùi Hoàng Hải"
                ]}
                onSearch={(value) => {
                  console.log('Searching for account:', value)
                }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 font-content">
              • Gõ để xem gợi ý • Sử dụng phím mũi tên để di chuyển • Enter để chọn • Escape để đóng
            </p>
          </div>

          {/* Demo 3: AdminSearchInput cho Violation List */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 font-content">3. Tìm Kiếm Vi Phạm (Admin Style)</h2>
            <div className="max-w-md">
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
                }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 font-content">
              • Gõ để xem gợi ý • Sử dụng phím mũi tên để di chuyển • Enter để chọn • Escape để đóng
            </p>
          </div>

          {/* Hướng dẫn sử dụng */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 font-content">Hướng Dẫn Sử Dụng:</h3>
            <ul className="text-sm text-gray-700 space-y-1 font-content">
              <li>• <strong>Gõ:</strong> Bắt đầu nhập để xem các gợi ý</li>
              <li>• <strong>Mũi tên xuống/trên:</strong> Di chuyển giữa các gợi ý</li>
              <li>• <strong>Enter:</strong> Chọn gợi ý hiện tại</li>
              <li>• <strong>Escape:</strong> Đóng danh sách gợi ý</li>
              <li>• <strong>Click:</strong> Click vào gợi ý để chọn</li>
              <li>• <strong>Click outside:</strong> Đóng danh sách gợi ý</li>
            </ul>
          </div>

          {/* Thông tin kỹ thuật */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 font-content">Thông Tin Kỹ Thuật:</h3>
            <ul className="text-sm text-gray-700 space-y-1 font-content">
              <li>• <strong>SearchInput:</strong> Component cho TopControls với icon bên trái</li>
              <li>• <strong>AdminSearchInput:</strong> Component cho Admin pages với icon bên trái</li>
              <li>• <strong>Responsive:</strong> Hoạt động tốt trên mọi thiết bị</li>
              <li>• <strong>Accessibility:</strong> Hỗ trợ keyboard navigation</li>
              <li>• <strong>Font:</strong> Sử dụng font-content cho tất cả text</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchDemo 