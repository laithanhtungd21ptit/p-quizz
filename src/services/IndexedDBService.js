class IndexedDBService {
  constructor() {
    this.dbName = 'QuizAppDB';
    this.version = 1;
    this.db = null;
    this.isSupported = this.checkSupport();
  }

  // Kiểm tra browser có hỗ trợ IndexedDB không
  checkSupport() {
    return 'indexedDB' in window && window.indexedDB;
  }

  // Lấy version hiện tại của database
  async getCurrentVersion() {
    if (!this.isSupported) return 0;
    
    return new Promise((resolve) => {
      const request = indexedDB.open(this.dbName);
      
      request.onsuccess = () => {
        const currentVersion = request.result.version;
        request.result.close();
        resolve(currentVersion);
      };
      
      request.onerror = () => {
        resolve(0);
      };
    });
  }

  // Khởi tạo database với version tự động
  async initDB() {
    if (!this.isSupported) {
      throw new Error('Trình duyệt không hỗ trợ IndexedDB');
    }

    // Lấy version hiện tại và sử dụng version cao hơn
    const currentVersion = await this.getCurrentVersion();
    const targetVersion = Math.max(currentVersion + 1, this.version);
    
    console.log(`IndexedDB: Current version: ${currentVersion}, Target version: ${targetVersion}`);

    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(this.dbName, targetVersion);

        request.onerror = (event) => {
          console.error('IndexedDB error:', event.target.error);
          reject(new Error(`Không thể mở IndexedDB: ${event.target.error?.message || 'Unknown error'}`));
        };

        request.onsuccess = () => {
          this.db = request.result;
          console.log(`IndexedDB opened successfully with version ${this.db.version}`);
          resolve(this.db);
        };

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          const oldVersion = event.oldVersion;
          const newVersion = event.newVersion;
          
          console.log(`IndexedDB upgrade: ${oldVersion} -> ${newVersion}`);

          try {
            // Tạo object store cho questionSetData nếu chưa có
            if (!db.objectStoreNames.contains('questionSetData')) {
              const questionStore = db.createObjectStore('questionSetData', { keyPath: 'id' });
              questionStore.createIndex('timestamp', 'timestamp', { unique: false });
              console.log('Created questionSetData store');
            }

            // Tạo object store cho previewQuestions nếu chưa có
            if (!db.objectStoreNames.contains('previewQuestions')) {
              const previewStore = db.createObjectStore('previewQuestions', { keyPath: 'id' });
              previewStore.createIndex('timestamp', 'timestamp', { unique: false });
              console.log('Created previewQuestions store');
            }

            // Thêm các store mới nếu cần upgrade từ version cũ
            if (oldVersion < 2) {
              // Version 2 có thể có thêm store mới
              console.log('Upgrading to version 2...');
            }

            if (oldVersion < 3) {
              // Version 3 có thể có thêm store mới
              console.log('Upgrading to version 3...');
            }

          } catch (error) {
            console.error('Error creating stores during upgrade:', error);
            reject(new Error(`Lỗi khi tạo stores: ${error.message}`));
          }
        };

        request.onblocked = () => {
          console.warn('IndexedDB blocked - another tab might have it open');
          reject(new Error('IndexedDB bị chặn - có thể do tab khác đang mở'));
        };
      } catch (error) {
        console.error('Unexpected error in initDB:', error);
        reject(new Error(`Lỗi không mong đợi: ${error.message}`));
      }
    });
  }

  // Lưu questionSetData với error handling tốt hơn
  async saveQuestionSetData(data) {
    try {
      if (!this.db) {
        await this.initDB();
      }
      
      return new Promise((resolve, reject) => {
        try {
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
          
          request.onerror = (event) => {
            console.error('Error saving to questionSetData store:', event.target.error);
            reject(new Error(`Không thể lưu questionSetData: ${event.target.error?.message || 'Unknown error'}`));
          };

          transaction.onerror = (event) => {
            console.error('Transaction error:', event.target.error);
            reject(new Error(`Transaction error: ${event.target.error?.message || 'Unknown error'}`));
          };
        } catch (error) {
          console.error('Error in saveQuestionSetData transaction:', error);
          reject(new Error(`Lỗi transaction: ${error.message}`));
        }
      });
    } catch (error) {
      console.error('Error in saveQuestionSetData:', error);
      // Fallback: lưu vào localStorage nếu IndexedDB fail
      try {
        localStorage.setItem('questionSetData_fallback', JSON.stringify({
          data: data,
          timestamp: Date.now()
        }));
        console.log('Đã lưu vào localStorage fallback');
        return Promise.resolve();
      } catch (localStorageError) {
        console.error('LocalStorage fallback also failed:', localStorageError);
        throw error;
      }
    }
  }

  // Lấy questionSetData với error handling tốt hơn
  async getQuestionSetData() {
    try {
      if (!this.db) {
        await this.initDB();
      }
      
      return new Promise((resolve, reject) => {
        try {
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
          
          request.onerror = (event) => {
            console.error('Error getting from questionSetData store:', event.target.error);
            reject(new Error(`Không thể lấy questionSetData: ${event.target.error?.message || 'Unknown error'}`));
          };

          transaction.onerror = (event) => {
            console.error('Transaction error:', event.target.error);
            reject(new Error(`Transaction error: ${event.target.error?.message || 'Unknown error'}`));
          };
        } catch (error) {
          console.error('Error in getQuestionSetData transaction:', error);
          reject(new Error(`Lỗi transaction: ${error.message}`));
        }
      });
    } catch (error) {
      console.error('Error in getQuestionSetData:', error);
      // Fallback: lấy từ localStorage nếu IndexedDB fail
      try {
        const fallbackData = localStorage.getItem('questionSetData_fallback');
        if (fallbackData) {
          const parsed = JSON.parse(fallbackData);
          console.log('Đã lấy từ localStorage fallback');
          return Promise.resolve(parsed.data);
        }
        return Promise.resolve(null);
      } catch (localStorageError) {
        console.error('LocalStorage fallback also failed:', localStorageError);
        return Promise.resolve(null);
      }
    }
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

  // Kiểm tra database có sẵn không (đã được gọi trong constructor)
  isSupported() {
    return this.isSupported;
  }
}

// Export instance singleton
const indexedDBService = new IndexedDBService();
export default indexedDBService;
