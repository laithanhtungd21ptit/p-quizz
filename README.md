# P-Quiz - Interactive Quiz Platform

Ứng dụng quiz tương tác được xây dựng với ReactJS, Tailwind CSS và Node.js.

## 🚀 Tính năng

- **Dashboard**: Thống kê tổng quan với biểu đồ và câu hỏi nổi bật
- **Quản lý câu hỏi**: Tạo, chỉnh sửa và quản lý các bộ câu hỏi
- **Thư viện**: Lưu trữ và tìm kiếm câu hỏi yêu thích
- **Lịch sử**: Theo dõi tiến độ học tập
- **Hồ sơ**: Quản lý thông tin cá nhân và thành tích
- **Responsive**: Giao diện đẹp trên mọi thiết bị

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 18** - UI Framework
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons
- **Vite** - Build tool

### Data
- **Mock Data** - Local data for demonstration

## 📦 Cài đặt

### 1. Clone repository
```bash
git clone <repository-url>
cd p-quizz
```

### 2. Cài đặt dependencies Frontend
```bash
npm install
```



## 🚀 Chạy ứng dụng

### Chạy Frontend
```bash
npm run dev
```

## 📁 Cấu trúc dự án

```
p-quizz/
├── src/
│   ├── components/          # React components
│   │   ├── Sidebar.jsx
│   │   ├── TopControls.jsx
│   │   ├── StatsPanel.jsx
│   │   ├── QuestionCard.jsx
│   │   └── WeeklyChart.jsx
│   ├── pages/              # Page components
│   │   ├── Dashboard.jsx
│   │   ├── CreatedSets.jsx
│   │   ├── SavedSets.jsx
│   │   ├── History.jsx
│   │   └── Profile.jsx
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── src/
│   └── data/
│       └── mockData.js     # Mock data for frontend
├── public/                 # Static files
├── package.json            # Frontend dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── README.md
```

## 📊 Dữ liệu

Ứng dụng sử dụng mock data được lưu trữ trong `src/data/mockData.js`:

- **Questions**: Danh sách các bộ câu hỏi
- **User**: Thông tin người dùng
- **Stats**: Thống kê tổng quan
- **History**: Lịch sử chơi quiz
- **Achievements**: Thành tích người dùng

## 🎨 Giao diện

Ứng dụng có giao diện hiện đại với:
- Dark theme với accent color pink
- Responsive design
- Smooth animations
- Interactive components
- Beautiful gradients và shadows

## 🔧 Tùy chỉnh

### Thay đổi màu sắc
Chỉnh sửa `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Customize pink colors
      }
    }
  }
}
```

### Thêm trang mới
1. Tạo component trong `src/pages/`
2. Thêm route trong `src/App.jsx`
3. Thêm menu item trong `src/components/Sidebar.jsx`

## 📝 Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run preview` - Preview production build

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

## 👨‍💻 Tác giả

P-Quiz Team

---

**Lưu ý**: Đây là phiên bản demo với mock data. Để sử dụng trong production, cần tích hợp backend API và database thực. 