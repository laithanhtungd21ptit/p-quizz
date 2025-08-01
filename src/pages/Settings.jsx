import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Bell, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Shield, 
  Eye, 
  EyeOff,
  Palette,
  Languages,
  Download,
  Trash2,
  User,
  Mail,
  Lock,
  Smartphone,
  Globe,
  HelpCircle,
  Info
} from 'lucide-react'

const Settings = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [language, setLanguage] = useState('vi')
  const [autoSave, setAutoSave] = useState(true)

  return (
    <div className="space-y-6 max-w-full">
      {/* Greeting + Room Code (giống Dashboard) */}
      <div className="flex items-center justify-between mb-4">
        <img src="/settings-title.png" alt="Cài đặt" className="h-12 object-contain" />
        <div className="flex-shrink-0 flex items-center h-12">
          <button 
            onClick={() => navigate('/enter-room-code')}
            aria-label="Nhập mã phòng" 
            className="room-code-img-link"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer'
            }}
          >
            <img 
              src="./code.png" 
              alt="Nhập mã phòng" 
              className="h-12 object-contain block transition-transform duration-150 hover:scale-105" 
            />
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Cài đặt</h1>
          <p className="text-gray-400 mt-1">Tùy chỉnh trải nghiệm sử dụng của bạn</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thông báo */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-pink-500" />
            <h3 className="text-lg font-semibold text-white">Thông báo</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Thông báo đẩy</p>
                <p className="text-sm text-gray-400">Nhận thông báo về bài quiz mới</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? 'bg-pink-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Email thông báo</p>
                <p className="text-sm text-gray-400">Nhận email về hoạt động</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-pink-500">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Giao diện */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-6 h-6 text-pink-500" />
            <h3 className="text-lg font-semibold text-white">Giao diện</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Chế độ tối</p>
                <p className="text-sm text-gray-400">Sử dụng giao diện tối</p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-pink-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Ngôn ngữ</p>
                <p className="text-sm text-gray-400">Chọn ngôn ngữ hiển thị</p>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-pink-500"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        </div>

        {/* Âm thanh */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Volume2 className="w-6 h-6 text-pink-500" />
            <h3 className="text-lg font-semibold text-white">Âm thanh</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Hiệu ứng âm thanh</p>
                <p className="text-sm text-gray-400">Bật/tắt âm thanh khi tương tác</p>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  soundEnabled ? 'bg-pink-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Âm lượng</p>
                <p className="text-sm text-gray-400">Điều chỉnh âm lượng</p>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="70"
                className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>

        {/* Bảo mật */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-pink-500" />
            <h3 className="text-lg font-semibold text-white">Bảo mật</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Xác thực 2 yếu tố</p>
                <p className="text-sm text-gray-400">Bảo vệ tài khoản tốt hơn</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Tự động đăng xuất</p>
                <p className="text-sm text-gray-400">Sau 30 phút không hoạt động</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-pink-500">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Dữ liệu */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-6 h-6 text-pink-500" />
            <h3 className="text-lg font-semibold text-white">Dữ liệu</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Tự động lưu</p>
                <p className="text-sm text-gray-400">Lưu tiến độ tự động</p>
              </div>
              <button
                onClick={() => setAutoSave(!autoSave)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoSave ? 'bg-pink-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoSave ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Xuất dữ liệu</p>
                <p className="text-sm text-gray-400">Tải xuống dữ liệu cá nhân</p>
              </div>
              <button className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm rounded-lg transition-colors">
                Xuất
              </button>
            </div>
          </div>
        </div>

        {/* Tài khoản */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-pink-500" />
            <h3 className="text-lg font-semibold text-white">Tài khoản</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Xóa tài khoản</p>
                <p className="text-sm text-gray-400">Xóa vĩnh viễn tài khoản</p>
              </div>
              <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Xóa
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Đăng xuất</p>
                <p className="text-sm text-gray-400">Đăng xuất khỏi tất cả thiết bị</p>
              </div>
              <button className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition-colors">
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Help & Support */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="w-6 h-6 text-pink-500" />
          <h3 className="text-lg font-semibold text-white">Trợ giúp & Hỗ trợ</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
            <Info className="w-5 h-5 text-pink-500" />
            <div className="text-left">
              <p className="text-white font-medium">Hướng dẫn sử dụng</p>
              <p className="text-sm text-gray-400">Tìm hiểu cách sử dụng</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
            <Mail className="w-5 h-5 text-pink-500" />
            <div className="text-left">
              <p className="text-white font-medium">Liên hệ hỗ trợ</p>
              <p className="text-sm text-gray-400">Gửi email cho chúng tôi</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
            <Globe className="w-5 h-5 text-pink-500" />
            <div className="text-left">
              <p className="text-white font-medium">Trang web</p>
              <p className="text-sm text-gray-400">Truy cập trang chủ</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings 