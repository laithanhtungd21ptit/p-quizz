import React, { useState, useRef, useEffect } from 'react'

const AdminSearchInput = ({ 
  placeholder = "Tìm kiếm...", 
  suggestions = [], 
  onSearch, 
  className = "",
  loading = false,
  showClearButton = true
}) => {
  const [searchValue, setSearchValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Lọc suggestions dựa trên giá trị nhập
  useEffect(() => {
    if (searchValue.trim() === '') {
      setFilteredSuggestions([])
      setShowSuggestions(false)
      setSelectedIndex(-1)
      return
    }

    // Nếu searchValue đã match với một suggestion, không hiển thị suggestions nữa
    const exactMatch = suggestions.find(suggestion => 
      suggestion.toLowerCase() === searchValue.toLowerCase()
    )
    if (exactMatch) {
      setFilteredSuggestions([])
      setShowSuggestions(false)
      setSelectedIndex(-1)
      return
    }

    const filtered = suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(searchValue.toLowerCase())
    )
    setFilteredSuggestions(filtered)
    setShowSuggestions(filtered.length > 0)
    setSelectedIndex(-1)
  }, [searchValue, suggestions])

  // Xử lý khi click outside để đóng suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) &&
          suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchValue(value)
    setSelectedIndex(-1)
    if (onSearch) {
      onSearch(value)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setSearchValue(suggestion)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    setFilteredSuggestions([])
    if (onSearch) {
      onSearch(suggestion)
    }
  }

  const handleClearSearch = () => {
    setSearchValue('')
    setShowSuggestions(false)
    setSelectedIndex(-1)
    setFilteredSuggestions([])
    if (onSearch) {
      onSearch('')
    }
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
          handleSuggestionClick(filteredSuggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        break
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(filteredSuggestions.length > 0)}
          placeholder={placeholder}
          className={`pl-10 pr-12 py-2 rounded-md border border-gray-300 w-full text-black font-content focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ${className}`}
          disabled={loading}
        />
        
        {/* Search Icon */}
        <i className="fas fa-search absolute left-3 top-2.5 text-gray-500"></i>
        
        {/* Loading Spinner */}
        {loading && (
          <div className="absolute right-10 top-2.5">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
          </div>
        )}
        
        {/* Clear Button */}
        {showClearButton && searchValue && !loading && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors duration-150"
            title="Xóa tìm kiếm"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSuggestionClick(suggestion)
                }}
                className={`px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors duration-150 font-content ${
                  index === selectedIndex ? 'bg-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <i className="fas fa-search text-gray-400 text-sm"></i>
                  <span className="text-gray-700">{suggestion}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center">
              Không tìm thấy gợi ý nào
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminSearchInput 