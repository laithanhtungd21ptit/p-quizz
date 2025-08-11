# Trang SavedSets - Bộ câu hỏi yêu thích

## Mô tả
Trang SavedSets hiển thị danh sách các bộ câu hỏi yêu thích của người dùng đã đăng nhập. Người dùng có thể xem, bỏ lưu và chia sẻ các bộ câu hỏi yêu thích.

## Tính năng chính

### 1. Hiển thị danh sách yêu thích
- Lấy dữ liệu từ API `GET /api/favorites/user`
- Hiển thị thông tin: tiêu đề, mô tả, số câu hỏi, thời gian đã lưu
- Sắp xếp theo thời gian đã lưu (mới nhất trước)

### 2. Tương tác với bộ câu hỏi
- **Xem chi tiết**: Click vào card để xem chi tiết bộ câu hỏi
- **Bỏ lưu**: Click vào icon ngôi sao để bỏ lưu khỏi danh sách yêu thích
- **Chia sẻ**: Click vào icon chia sẻ để chia sẻ link bộ câu hỏi

### 3. Trạng thái loading và error
- Hiển thị spinner khi đang tải dữ liệu
- Hiển thị thông báo lỗi nếu có vấn đề với API
- Nút "Thử lại" để reload trang khi có lỗi

### 4. Trạng thái trống
- Hiển thị thông báo khi chưa có bộ câu hỏi nào được lưu
- Nút "Khám phá bộ câu hỏi" để chuyển đến trang Dashboard

## Cấu trúc dữ liệu API

### Response từ `/api/favorites/user`:
```json
[
  {
    "id": 1,
    "quizId": 123,
    "quizTitle": "TIẾNG NHẬT",
    "addedAt": "2024-01-15T10:30:00",
    "questions": [
      {
        "id": 1,
        "content": "Nội dung câu hỏi",
        "description": "Mô tả câu hỏi",
        "answerA": "Đáp án A",
        "answerB": "Đáp án B",
        "answerC": "Đáp án C",
        "answerD": "Đáp án D",
        "correctAnswer": "A",
        "limitedTime": 10,
        "score": 10
      }
    ]
  }
]
```

### API Endpoints sử dụng:
- `GET /api/favorites/user` - Lấy danh sách favorites
- `POST /api/favorites/toggle?quizId={id}` - Toggle favorite (thêm/bỏ)

## Cách sử dụng

### 1. Truy cập trang
- Đăng nhập vào hệ thống
- Truy cập đường dẫn `/saved-sets`

### 2. Xem danh sách yêu thích
- Trang sẽ tự động tải danh sách favorites
- Hiển thị tổng số bộ câu hỏi yêu thích
- Mỗi card hiển thị thông tin cơ bản của bộ câu hỏi

### 3. Tương tác với bộ câu hỏi
- **Xem chi tiết**: Click vào bất kỳ đâu trên card
- **Bỏ lưu**: Click vào icon ngôi sao (màu đỏ)
- **Chia sẻ**: Click vào icon chia sẻ

### 4. Xử lý lỗi
- Nếu có lỗi API, hiển thị thông báo lỗi
- Click "Thử lại" để reload trang
- Kiểm tra console để xem chi tiết lỗi

## Cấu hình

### Environment Variables:
- `API_BASE_URL`: URL của backend API (mặc định: http://localhost:8080)

### Authentication:
- Sử dụng JWT token từ localStorage
- Token được tự động thêm vào header của mọi request
- Nếu token hết hạn, tự động chuyển về trang login

## Dependencies

### Frontend:
- React 18+
- React Router DOM
- Axios
- Lucide React (icons)
- Tailwind CSS

### Backend:
- Spring Boot
- Spring Security
- JPA/Hibernate
- MySQL/PostgreSQL

## Troubleshooting

### Lỗi thường gặp:

1. **401 Unauthorized**: Token hết hạn hoặc không hợp lệ
   - Giải pháp: Đăng nhập lại

2. **500 Internal Server Error**: Lỗi server
   - Giải pháp: Kiểm tra backend logs

3. **Network Error**: Không thể kết nối API
   - Giải pháp: Kiểm tra kết nối mạng và URL API

### Debug:
- Mở Developer Tools (F12)
- Xem Console để kiểm tra logs
- Xem Network tab để kiểm tra API calls

## Tương lai

### Tính năng có thể thêm:
- Tìm kiếm trong danh sách yêu thích
- Sắp xếp theo tiêu chí khác (tên, số câu hỏi)
- Phân trang cho danh sách dài
- Thống kê về bộ câu hỏi yêu thích
- Export danh sách yêu thích
- Đồng bộ với cloud storage
