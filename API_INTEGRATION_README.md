# API Integration Guide - Tạo Bộ Câu Hỏi

## Tổng quan
Ứng dụng `p-quizz` đã được tích hợp với backend API `quiz-web-master` để lưu bộ câu hỏi vào database thay vì chỉ lưu vào IndexedDB.

## API Endpoint
- **URL**: `POST /api/questions`
- **Base URL**: `http://localhost:8080` (có thể thay đổi trong `src/services/api.js`)

## Cấu trúc dữ liệu gửi lên API

```json
{
  "topic": "Chủ đề quiz",
  "name": "Tên bộ câu hỏi", 
  "visibleTo": true/false,
  "imageUrl": "URL hình ảnh (nếu có)",
  "questions": [
    {
      "content": "Nội dung câu hỏi",
      "description": "Mô tả câu hỏi",
      "answerA": "Đáp án A",
      "answerB": "Đáp án B", 
      "answerC": "Đáp án C",
      "answerD": "Đáp án D",
      "imageUrl": "URL hình ảnh câu hỏi (base64)",
      "correctAnswer": "A/B/C/D",
      "limitedTime": 30,
      "score": 10
    }
  ]
}
```

## Tính năng mới

### 1. Nút "Lưu thay đổi"
- Khi bấm nút "Lưu thay đổi", ứng dụng sẽ:
  - Validate dữ liệu (tên, chủ đề, câu hỏi, đáp án)
  - Chuyển đổi hình ảnh thành base64
  - Gọi API backend để lưu vào database
  - Xóa dữ liệu IndexedDB
  - Chuyển đến trang chủ (`/`)

### 2. Loading State
- Nút "Lưu thay đổi" sẽ hiển thị loading spinner khi đang xử lý
- Disable nút trong quá trình lưu để tránh double-click

### 3. Validation
- Kiểm tra tên bộ câu hỏi không được để trống
- Kiểm tra chủ đề đã được chọn
- Kiểm tra có ít nhất 1 câu hỏi
- Kiểm tra mỗi câu hỏi có đầy đủ nội dung và 4 đáp án

### 4. Xử lý lỗi
- Hiển thị thông báo lỗi chi tiết theo HTTP status code
- Xử lý lỗi kết nối mạng
- Xử lý lỗi authentication/authorization

## Cấu hình

### 1. Base URL
Thay đổi `API_BASE_URL` trong `src/services/api.js` nếu backend chạy trên port khác:

```javascript
const API_BASE_URL = 'http://localhost:8080'; // Thay đổi port nếu cần
```

### 2. Authentication
Nếu API yêu cầu authentication, token sẽ được tự động thêm vào header:

```javascript
// Token được lấy từ localStorage hoặc sessionStorage
const token = localStorage.getItem('token');
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

## Luồng hoạt động

1. **Người dùng bấm "Lưu thay đổi"**
2. **Validation dữ liệu** - Kiểm tra tính hợp lệ
3. **Xử lý hình ảnh** - Chuyển đổi File thành base64
4. **Gọi API backend** - POST /api/questions
5. **Xóa IndexedDB** - Xóa dữ liệu tạm thời
6. **Chuyển trang** - Navigate đến trang chủ

## Xử lý lỗi

### HTTP Status Codes
- **400**: Dữ liệu không hợp lệ
- **401**: Chưa đăng nhập hoặc token hết hạn
- **403**: Không có quyền tạo bộ câu hỏi
- **500+**: Lỗi server

### Lỗi kết nối
- Không thể kết nối đến server
- Timeout
- Network error

## Dependencies

- **axios**: HTTP client để gọi API
- **react-router-dom**: Navigation giữa các trang
- **IndexedDBService**: Xử lý dữ liệu tạm thời

## Testing

1. **Khởi động backend**: `quiz-web-master` trên port 8080
2. **Khởi động frontend**: `npm run dev` trong thư mục `p-quizz`
3. **Tạo bộ câu hỏi**: Điền đầy đủ thông tin và bấm "Lưu thay đổi"
4. **Kiểm tra database**: Xem dữ liệu đã được lưu vào database chưa

## Lưu ý

- Hình ảnh được chuyển đổi thành base64 trước khi gửi lên API
- Dữ liệu IndexedDB sẽ bị xóa sau khi lưu thành công
- Nếu lưu thất bại, dữ liệu IndexedDB vẫn được giữ nguyên
- Backend cần hỗ trợ CORS để frontend có thể gọi API
