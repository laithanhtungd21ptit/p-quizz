import React, { useEffect, useRef, useState } from 'react'
import 'mathlive';
import CreateSidebar from './CreateSidebar';

const FormatToolbar = ({ 
  format, 
  onFormatChange, 
  onAddExplanation, 
  onInsertSymbol,
  time = 10,
  score = 10,
  onTimeChange,
  onScoreChange
}) => {
  const mathRef = useRef(null);
  const [showMath, setShowMath] = useState(false);

  useEffect(() => {
    if (!showMath) return;
    function handleClickOutside(event) {
      if (mathRef.current && !mathRef.current.contains(event.target)) {
        setShowMath(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMath]);

  return (
    <div className="w-full flex items-center pt-2 justify-center space-x-3 text-sm text-black font-medium flex-wrap bg-white h-12 border-b border-gray-200 sticky top-14 z-20 p-0 m-0 min-h-0">
      {/* Định dạng văn bản */}
      <button
        className={`px-2 py-1 border rounded ${format.bold ? 'bg-gray-200' : ''}`}
        onClick={() => onFormatChange({ bold: !format.bold })}
        type="button"
      >B</button>
      <button
        className={`px-2 py-1 border rounded italic ${format.italic ? 'bg-gray-200' : ''}`}
        onClick={() => onFormatChange({ italic: !format.italic })}
        type="button"
      >I</button>
      <button
        className={`px-2 py-1 border rounded underline ${format.underline ? 'bg-gray-200' : ''}`}
        onClick={() => onFormatChange({ underline: !format.underline })}
        type="button"
      >U</button>
      {/* Căn lề */}
      {['left','center','right','justify'].map(al => (
        <button
          key={al}
          className={`px-2 py-1 border rounded ${format.align === al ? 'bg-gray-200' : ''}`}
          onClick={() => onFormatChange({ align: al })}
          type="button"
        >
          <img src={`https://img.icons8.com/ios-filled/20/000000/align-${al}.png`} alt={al} />
        </button>
      ))}
      {/* Chèn ký hiệu toán học */}
      <div className="relative" ref={mathRef}>
        <button
          onClick={() => setShowMath(s => !s)}
          className="border border-pink-500 rounded-lg px-3 py-1 min-w-[180px] text-left text-black"
          type="button"
        >
          Chèn kí hiệu toán học ▼
        </button>
        {showMath && (
          <div className="absolute mt-1 z-10 bg-white border border-gray-300 rounded shadow p-2 flex flex-wrap w-60">
            {['√', 'π', '∑', '∫', '∞', '≈', '≠', '≤', '≥', '±', '÷', '×', 'α', 'β', 'θ', 'λ', 'μ', 'σ', 'Δ', 'Ω', 'x²', 'xₙ'].map(symbol => (
              <button
                key={symbol}
                className="m-1 px-2 py-1 border rounded hover:bg-pink-100"
                onClick={() => { onInsertSymbol && onInsertSymbol(symbol); setShowMath(false); }}
                onMouseDown={e => e.preventDefault()}
                type="button"
              >
                {symbol}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Điểm (datalist) */}
      <div>
        <input 
          list="scoreList" 
          placeholder="Điểm" 
          value={score}
          onChange={(e) => onScoreChange && onScoreChange(parseInt(e.target.value) || 10)}
          className="border border-pink-500 rounded-lg px-3 py-1 w-[100px] bg-white text-black" 
        />
        <datalist id="scoreList">
          <option value="5" />
          <option value="10" />
          <option value="15" />
          <option value="20" />
          <option value="25" />
          <option value="30" />
        </datalist>
      </div>
      {/* Thời gian (datalist) */}
      <div>
        <input 
          list="timeList" 
          placeholder="Thời gian (s)" 
          value={time}
          onChange={(e) => onTimeChange && onTimeChange(parseInt(e.target.value) || 10)}
          className="border border-pink-500 rounded-lg px-3 py-1 w-[120px] bg-white text-black" 
        />
        <datalist id="timeList">
          <option value="5" />
          <option value="10" />
          <option value="15" />
          <option value="20" />
          <option value="30" />
          <option value="45" />
          <option value="60" />
          <option value="90" />
          <option value="120" />
        </datalist>
      </div>
      {/* Divider */}
      <div className="w-px h-6 bg-gray-300 mx-2"></div>
      {/* Nút giải thích */}
      <button 
        className="bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-full px-4 py-2 flex items-center space-x-2" 
        type="button"
        onClick={() => onAddExplanation && onAddExplanation()}
      >
        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.372 0 0 5.372 0 12h4z" />
        </svg>
        <span>Thêm giải thích cho đáp án</span>
      </button>
    </div>
  );
}

export default FormatToolbar; 