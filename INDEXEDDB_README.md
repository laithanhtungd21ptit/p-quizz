# IndexedDB Integration Guide

## Tổng quan

Dự án đã được chuyển từ `localStorage` sang **IndexedDB** để lưu trữ dữ liệu bộ câu hỏi và preview. IndexedDB cung cấp nhiều ưu điểm hơn localStorage:

### ✅ Ưu điểm của IndexedDB:
- **Dung lượng lớn**: Không giới hạn 5-10MB như localStorage
- **Hỗ trợ dữ liệu phức tạp**: Objects, Files, Blobs, base64 images
- **Indexing**: Tìm kiếm dữ liệu nhanh hơn
- **Transactions**: Đảm bảo tính nhất quán dữ liệu
- **Async**: Không block main thread
- **Cấu trúc database**: Object stores với indexes

### ❌ Nhược điểm:
- **Phức tạp hơn**: Cần xử lý async/await
- **Browser support**: Cần kiểm tra hỗ trợ (IE < 10 không hỗ trợ)

## Cấu trúc Database

```
QuizAppDB (Database)
├── questionSetData (Object Store)
│   ├── id: 'current'
│   ├── data: { topic, name, description, visibleTo, imageUrl, questions[] }
│   └── timestamp: Date.now()
│
└── previewQuestions (Object Store)
    ├── id: 'current'
    ├── data: questions[]
    └── timestamp: Date.now()
```

## API Methods

### IndexedDBService

```javascript
import indexedDBService from '../services/IndexedDBService';

// Lưu dữ liệu
await indexedDBService.saveQuestionSetData(data);
await indexedDBService.savePreviewQuestions(data);

// Lấy dữ liệu
const data = await indexedDBService.getQuestionSetData();
const preview = await indexedDBService.getPreviewQuestions();

// Xóa dữ liệu
await indexedDBService.deleteQuestionSetData();
await indexedDBService.deletePreviewQuestions();
await indexedDBService.clearAllData();

// Kiểm tra hỗ trợ
if (indexedDBService.isSupported()) {
  // Sử dụng IndexedDB
}
```

## Files đã được cập nhật

### 1. `src/services/IndexedDBService.js` (Mới)
- Service class để quản lý IndexedDB
- Xử lý tất cả CRUD operations
- Error handling và logging

### 2. `src/pages/CreateQuestionSet.jsx`
- Thay thế `localStorage.setItem/getItem` bằng IndexedDB
- Cập nhật `autoSaveToIndexedDB()`
- Cập nhật `useEffect` để load data từ IndexedDB
- Cập nhật `confirmBackToDashboard()` để xóa IndexedDB

### 3. `src/pages/PreviewPage.jsx`
- Thay thế `localStorage.getItem` bằng IndexedDB
- Cập nhật `useEffect` để load questions từ IndexedDB

### 4. `src/pages/EditQuestionSet.jsx`
- Thay thế `localStorage.setItem` bằng IndexedDB
- Cập nhật `handleOpenPreview()` để lưu vào IndexedDB

## Migration từ localStorage

### Trước (localStorage):
```javascript
// Lưu
localStorage.setItem('questionSetData', JSON.stringify(data));

// Lấy
const data = JSON.parse(localStorage.getItem('questionSetData'));

// Xóa
localStorage.removeItem('questionSetData');
```

### Sau (IndexedDB):
```javascript
// Lưu
await indexedDBService.saveQuestionSetData(data);

// Lấy
const data = await indexedDBService.getQuestionSetData();

// Xóa
await indexedDBService.deleteQuestionSetData();
```

## Error Handling

Service tự động xử lý các trường hợp:
- Database chưa được khởi tạo
- Lỗi kết nối
- Dữ liệu không hợp lệ
- Browser không hỗ trợ IndexedDB

```javascript
try {
  await indexedDBService.saveQuestionSetData(data);
} catch (error) {
  console.error('Lỗi khi lưu vào IndexedDB:', error);
  // Fallback: có thể lưu vào localStorage hoặc hiển thị thông báo
}
```

## Performance

- **Auto-save**: Chỉ lưu khi có thay đổi thực sự
- **Batch operations**: Xử lý nhiều câu hỏi cùng lúc
- **Image optimization**: Chuyển đổi File → base64 trước khi lưu
- **Lazy loading**: Chỉ khởi tạo DB khi cần thiết

## Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 23+ | ✅ Full |
| Firefox | 16+ | ✅ Full |
| Safari | 10+ | ✅ Full |
| Edge | 12+ | ✅ Full |
| IE | < 10 | ❌ No |

## Testing

1. **Tạo bộ câu hỏi mới**
2. **Chỉnh sửa và kiểm tra auto-save**
3. **Chuyển sang trang preview và quay lại**
4. **Kiểm tra dữ liệu được khôi phục**
5. **Test nút "Quay lại Dashboard" để xóa dữ liệu**

## Troubleshooting

### Lỗi thường gặp:

1. **"IndexedDB is not supported"**
   - Kiểm tra browser version
   - Fallback về localStorage

2. **"Database connection failed"**
   - Kiểm tra browser permissions
   - Clear browser data và thử lại

3. **"Data not loading"**
   - Kiểm tra console errors
   - Verify database structure

### Debug:

```javascript
// Kiểm tra database
console.log('IndexedDB supported:', indexedDBService.isSupported());

// Xem tất cả dữ liệu
const data = await indexedDBService.getQuestionSetData();
console.log('Current data:', data);
```

## Future Improvements

- [ ] **Encryption**: Mã hóa dữ liệu nhạy cảm
- [ ] **Compression**: Nén dữ liệu lớn
- [ ] **Sync**: Đồng bộ giữa các tab
- [ ] **Backup**: Export/Import dữ liệu
- [ ] **Cleanup**: Tự động dọn dẹp dữ liệu cũ

