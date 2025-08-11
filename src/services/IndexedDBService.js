class IndexedDBService {
  constructor() {
    this.dbName = 'QuizAppDB';
    this.version = 1;
    this.db = null;
  }

  // Khởi tạo database
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error('Không thể mở IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Tạo object store cho questionSetData
        if (!db.objectStoreNames.contains('questionSetData')) {
          const questionStore = db.createObjectStore('questionSetData', { keyPath: 'id' });
          questionStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Tạo object store cho previewQuestions
        if (!db.objectStoreNames.contains('previewQuestions')) {
          const previewStore = db.createObjectStore('previewQuestions', { keyPath: 'id' });
          previewStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Lưu questionSetData
  async saveQuestionSetData(data) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['questionSetData'], 'readwrite');
      const store = transaction.objectStore('questionSetData');
      
      const item = {
        id: 'current',
        data: data,
        timestamp: Date.now()
      };

      const request = store.put(item);
      
      request.onsuccess = () => {
        console.log('Đã lưu questionSetData vào IndexedDB:', data);
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error('Không thể lưu questionSetData'));
      };
    });
  }

  // Lấy questionSetData
  async getQuestionSetData() {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['questionSetData'], 'readonly');
      const store = transaction.objectStore('questionSetData');
      const request = store.get('current');
      
      request.onsuccess = () => {
        if (request.result) {
          console.log('Đã lấy questionSetData từ IndexedDB:', request.result.data);
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => {
        reject(new Error('Không thể lấy questionSetData'));
      };
    });
  }

  // Lưu previewQuestions
  async savePreviewQuestions(data) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['previewQuestions'], 'readwrite');
      const store = transaction.objectStore('previewQuestions');
      
      const item = {
        id: 'current',
        data: data,
        timestamp: Date.now()
      };

      const request = store.put(item);
      
      request.onsuccess = () => {
        console.log('Đã lưu previewQuestions vào IndexedDB:', data);
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error('Không thể lưu previewQuestions'));
      };
    });
  }

  // Lấy previewQuestions
  async getPreviewQuestions() {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['previewQuestions'], 'readonly');
      const store = transaction.objectStore('previewQuestions');
      const request = store.get('current');
      
      request.onsuccess = () => {
        if (request.result) {
          console.log('Đã lấy previewQuestions từ IndexedDB:', request.result.data);
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => {
        reject(new Error('Không thể lấy previewQuestions'));
      };
    });
  }

  // Xóa questionSetData
  async deleteQuestionSetData() {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['questionSetData'], 'readwrite');
      const store = transaction.objectStore('questionSetData');
      const request = store.delete('current');
      
      request.onsuccess = () => {
        console.log('Đã xóa questionSetData khỏi IndexedDB');
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error('Không thể xóa questionSetData'));
      };
    });
  }

  // Xóa previewQuestions
  async deletePreviewQuestions() {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['previewQuestions'], 'readwrite');
      const store = transaction.objectStore('previewQuestions');
      const request = store.delete('current');
      
      request.onsuccess = () => {
        console.log('Đã xóa previewQuestions khỏi IndexedDB');
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error('Không thể xóa previewQuestions'));
      };
    });
  }

  // Xóa tất cả dữ liệu
  async clearAllData() {
    try {
      await this.deleteQuestionSetData();
      await this.deletePreviewQuestions();
      console.log('Đã xóa tất cả dữ liệu khỏi IndexedDB');
    } catch (error) {
      console.error('Lỗi khi xóa dữ liệu:', error);
    }
  }

  // Kiểm tra database có sẵn không
  isSupported() {
    return 'indexedDB' in window;
  }
}

// Export instance singleton
const indexedDBService = new IndexedDBService();
export default indexedDBService;
