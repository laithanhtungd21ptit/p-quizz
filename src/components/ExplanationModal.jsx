import React, { useRef } from 'react';

const ExplanationModal = ({
  open,
  onClose,
  onSave,
  onDelete,
  value = '',
  image = null,
  onValueChange,
  onImageChange,
}) => {
  const fileInputRef = useRef();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white max-w-2xl w-full rounded-lg shadow-[0_0_45px_11px_rgba(219,0,96,0.8)] p-6 relative">
        {/* Header */}
        <header className="flex items-center gap-2 mb-6">
          <button aria-label="Thêm giải thích" className="flex items-center gap-2 text-[#db0060] font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-[#db0060]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 stroke-current stroke-2" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Thêm giải thích
          </button>
          <button aria-label="Đóng" className="ml-auto text-gray-800 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#db0060]" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 stroke-current stroke-[2.5]" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>
        {/* Content Boxes */}
        <section className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Giải thích Textarea */}
          <div className="w-full md:w-1/2">
            <label htmlFor="explanation" className="sr-only">Nhập giải thích</label>
            <textarea
              id="explanation"
              rows={8}
              placeholder="Nhập giải thích"
              className="w-full border border-[#db0060] rounded-lg p-4 text-gray-500 placeholder-gray-400 bg-[#fafafa] font-medium text-base focus:border-[#db0060] focus:ring-1 focus:ring-[#db0060]"
              aria-describedby="explanation-desc"
              value={value}
              onChange={e => onValueChange && onValueChange(e.target.value)}
            />
          </div>
          {/* Thêm hình ảnh box */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
            {image ? (
              <div className="relative w-full flex flex-col items-center">
                <img src={URL.createObjectURL(image)} alt="explanation" className="rounded-lg max-h-48 object-contain mb-2" />
                <button
                  className="absolute top-2 right-2 bg-white/80 rounded-full p-1 text-gray-700 hover:text-red-600"
                  onClick={() => onImageChange && onImageChange(null)}
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ) : (
              <div
                tabIndex={0}
                role="button"
                aria-label="Thêm hình ảnh"
                className="w-full h-full flex flex-col justify-center items-center cursor-pointer border border-[#db0060] rounded-lg text-[#db0060] p-4 select-none focus:outline-none focus:ring-2 focus:ring-[#db0060] focus:ring-offset-1"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current && fileInputRef.current.click()}
              >
                <button aria-hidden="true" className="bg-[#b70145] rounded-md w-10 h-10 flex justify-center items-center mb-2 hover:bg-[#a10250] focus:outline-none focus:ring-2 focus:ring-[#ff206e]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 stroke-white stroke-2" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <span className="text-sm font-medium select-text">Thêm hình ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      onImageChange && onImageChange(e.target.files[0]);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </section>
        {/* Buttons */}
        <footer className="flex justify-center gap-4">
          <button
            type="button"
            className="bg-[#db0060] text-white rounded-md px-10 py-2 text-lg font-medium shadow-md \
                   hover:bg-[#a80046] transition-colors focus:outline-none focus:ring-4 focus:ring-[#db0060aa]"
            onClick={onSave}
          >
            Lưu
          </button>
          <button
            type="button"
            className="bg-gray-300 text-gray-600 rounded-md px-10 py-2 text-lg font-medium shadow-md \
                   hover:bg-gray-400 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300"
            onClick={onDelete}
          >
            Xóa
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ExplanationModal; 