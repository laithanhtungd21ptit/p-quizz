import React, { useRef, useState } from 'react';

const bgImages = [
  '/Group1.png',
  '/Group2.png',
  '/Group3.png',
  '/Group4.png',
];

const getTextStyle = (fmt) => ({
  fontWeight: fmt?.bold ? 'bold' : 'normal',
  fontStyle: fmt?.italic ? 'italic' : 'normal',
  textDecoration: fmt?.underline ? 'underline' : 'none',
  textAlign: fmt?.align || 'left',
  // color: 'black',
});

const QuestionEditor = ({
  question = '',
  options = ['', '', '', ''],
  correctAnswer = 0,
  image = null,
  onChange,
  questionFormat = {},
  optionFormats = [{}, {}, {}, {}],
  onFieldFocus,
  onCaretChange,
  onActiveInputRefChange,
  readOnly = false,
  showCorrect = false,
}) => {
  const [localQuestion, setLocalQuestion] = useState(question);
  const [localOptions, setLocalOptions] = useState(options);
  const [localCorrect, setLocalCorrect] = useState(correctAnswer);
  const [media, setMedia] = useState(image);
  const [mediaUrl, setMediaUrl] = useState(() => {
    if (!image) return null;
    // Kiểm tra nếu image là File/Blob thì tạo URL, nếu là string thì dùng trực tiếp
    if (image instanceof File || image instanceof Blob) {
      return URL.createObjectURL(image);
    }
    return image; // Nếu là string URL thì dùng trực tiếp
  });
  const fileInputRef = useRef();

  // Ref cho từng textarea
  const questionRef = useRef();
  const optionRefs = [useRef(), useRef(), useRef(), useRef()];

  // Helper để gọi onCaretChange và truyền ref
  const handleCaret = (type, idx = null) => e => {
    if (onCaretChange) {
      const pos = e.target.selectionStart;
      if (type === 'question') {
        onCaretChange({ type: 'question', questionId: 1, pos });
      } else if (type === 'option') {
        onCaretChange({ type: 'option', questionId: 1, optionIndex: idx, pos });
      }
    }
    if (onActiveInputRefChange) {
      if (type === 'question') {
        onActiveInputRefChange(questionRef);
      } else if (type === 'option') {
        onActiveInputRefChange(optionRefs[idx]);
      }
    }
  };

  // Notify parent on any change
  React.useEffect(() => {
    if (onChange) {
      onChange({
        question: localQuestion,
        options: localOptions,
        correctAnswer: localCorrect,
        image: media,
      });
    }
    // eslint-disable-next-line
  }, [localQuestion, localOptions, localCorrect, media]);

  // Sync local state với props khi props thay đổi
  React.useEffect(() => {
    setLocalQuestion(question);
  }, [question]);

  React.useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  React.useEffect(() => {
    setLocalCorrect(correctAnswer);
  }, [correctAnswer]);

  // Sync image state với props khi props thay đổi
  React.useEffect(() => {
    setMedia(image);
    if (image) {
      // Kiểm tra nếu image là File/Blob thì tạo URL, nếu là string thì dùng trực tiếp
      if (image instanceof File || image instanceof Blob) {
        setMediaUrl(URL.createObjectURL(image));
      } else {
        setMediaUrl(image); // Nếu là string URL thì dùng trực tiếp
      }
    } else {
      setMediaUrl(null);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [image]);

  const handleQuestionChange = (e) => {
    setLocalQuestion(e.target.value);
  };

  const handleOptionChange = (idx, value) => {
    setLocalOptions((opts) => opts.map((opt, i) => (i === idx ? value : opt)));
  };

  const handleCorrectChange = (idx) => {
    setLocalCorrect(idx);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      setMediaUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      setMedia(file);
      setMediaUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveMedia = () => {
    setMedia(null);
    setMediaUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="relative" style={{ width: 1296, height: 768, background: `url('/Group.png') no-repeat center center`, backgroundSize: 'contain' }}>
      <div className="absolute top-[90px] left-[80px] right-[80px]">
        {/* Nhập câu hỏi */}
        <div className="relative bg-white text-black rounded-xl w-4/5 mx-auto">
          <div className="flex items-center justify-center w-full">
            <textarea
              ref={questionRef}
              className="w-full h-20 text-xl resize-none focus:outline-none text-center rounded-xl"
              placeholder="Nhập câu hỏi vào đây"
              rows={2}
              maxLength={200}
              style={{ height: '3.5rem', maxHeight: '3.5rem', minHeight: '3.5rem', lineHeight: '1.75rem', overflow: 'hidden', ...getTextStyle(questionFormat) }}
              value={localQuestion}
              onChange={handleQuestionChange}
              onFocus={e => {
                onFieldFocus && onFieldFocus({ type: 'question', questionId: 1 });
                handleCaret('question')(e);
              }}
              onClick={handleCaret('question')}
              onKeyUp={handleCaret('question')}
              readOnly={readOnly}
            />
          </div>
        </div>
        {/* Giao diện thêm hình ảnh - chỉ hiển thị khi có ảnh hoặc không ở chế độ readOnly */}
        <div className="flex items-center justify-center w-full my-6" style={{ minHeight: '300px' }}>
          {(mediaUrl || !readOnly) && (
            <div className="bg-white rounded-xl glow-pink p-6 max-w-md w-full">
              {mediaUrl ? (
                <div className="bg-gray-100 rounded border border-gray-300 text-center relative max-w-2xl w-full group/preview" style={{ marginTop: 0, marginBottom: 0, height: 263, width: 400, display: 'block', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                  {!readOnly && (
                    <button
                      type="button"
                      className="absolute top-2.5 right-2.5 bg-white/90 border-none rounded-full p-1 cursor-pointer opacity-0 group-hover/preview:opacity-100 transition z-20 text-black"
                      onClick={handleRemoveMedia}
                      style={{ pointerEvents: 'auto' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="black" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                  {media && (media.type ? media.type.startsWith('image/') : mediaUrl) ? (
                    <img src={mediaUrl} alt="preview" className="rounded-xl w-full h-full object-contain pointer-events-none" />
                  ) : media && media.type && media.type.startsWith('video/') ? (
                    <video src={mediaUrl} controls className="rounded-xl w-full h-full object-contain" />
                  ) : (
                    <p className="text-red-600">File không hỗ trợ xem trước.</p>
                  )}
                </div>
              ) : !readOnly ? (
                <div
                  className="bg-gray-100 rounded border border-gray-300 p-20 text-center hover:border-pink-600 transition relative max-w-2xl w-full"
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  id="uploadZone"
                  style={{}}
                >
                  <p className="text-gray-600 mb-1">Tải lên hoặc thả hình ảnh ở đây</p>
                  {/* <p className="text-gray-400 text-sm mb-4">.PNG, .JPG, .JPEG, .GIF</p> */}
                  <label htmlFor="fileUpload" className="inline-block border border-pink-600 text-pink-600 px-4 py-2 rounded cursor-pointer text-sm font-medium hover:bg-pink-50 transition">
                    Tải lên từ thiết bị
                  </label>
                  <input
                    type="file"
                    id="fileUpload"
                    accept=".png,.jpg,.jpeg,.gif,.mp4,.webm,.ogg"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>
        {/* Các câu trả lời */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`relative text-black px-6 py-6 rounded ${
                showCorrect && idx === correctAnswer ? 'ring-4 ring-green-500 ring-opacity-75' : ''
              }`}
              style={{ background: `url('${bgImages[idx]}') center center / 100% 100% no-repeat`, height: 144 }}
            >
              <textarea
                ref={optionRefs[idx]}
                className="w-full h-[96px] resize-none focus:outline-none bg-transparent text-lg text-white placeholder-white overflow-hidden rounded-xl"
                placeholder={`Câu trả lời ${idx + 1}`}
                value={localOptions[idx]}
                onChange={e => handleOptionChange(idx, e.target.value)}
                style={getTextStyle(optionFormats[idx])}
                onFocus={e => {
                  onFieldFocus && onFieldFocus({ type: 'option', questionId: 1, optionIndex: idx });
                  handleCaret('option', idx)(e);
                }}
                onClick={handleCaret('option', idx)}
                onKeyUp={handleCaret('option', idx)}
                readOnly={readOnly}
              />
              {showCorrect && idx === correctAnswer && (
                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                  ✓ Đúng
                </div>
              )}
              <div className="absolute -top-[15px] right-2 flex flex-col items-end group">
                <span className="text-xs bg-pink-600 text-white px-2 py-0.5 rounded mb-1 opacity-0 group-hover:opacity-100 transition">
                  Đặt làm câu trả lời đúng
                </span>
                <input
                  type="radio"
                  name="correct"
                  checked={readOnly ? (showCorrect && idx === correctAnswer) : (localCorrect === idx)}
                  onChange={() => handleCorrectChange(idx)}
                  className={`w-7 h-7 cursor-pointer ${
                    showCorrect 
                      ? (idx === correctAnswer ? 'accent-pink-600' : 'accent-gray-400')
                      : (localCorrect === idx ? 'accent-pink-600' : 'accent-gray-400')
                  }`}
                  disabled={readOnly}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`.glow-pink { box-shadow: 0 0 25px 10px #e9004a; }`}</style>
    </div>
  );
};

export default QuestionEditor; 