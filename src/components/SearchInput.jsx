import React, { useState, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SearchInput = ({ 
  placeholder = "Tìm kiếm...", 
  suggestions = [], 
  onSearch, 
  className = "",
  showIcon = true,
  iconPosition = "left"
}) => {
  const [searchValue, setSearchValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const navigate = useNavigate()

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
    
    // Chuyển đến trang tìm kiếm với từ khóa đã chọn
    navigate(`/search?q=${encodeURIComponent(suggestion)}`)
    
    if (onSearch) {
      onSearch(suggestion)
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

  const SearchIcon = () => (
    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
  )

  const RightSearchIcon = () => (
    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
  )

  return (
    <div className="relative">
      <div className="relative">
        {showIcon && iconPosition === "left" && <SearchIcon />}
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(filteredSuggestions.length > 0)}
          placeholder={placeholder}
          className={`w-full py-2.5 bg-white/10 border border-gray-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-[#ED005D] focus:ring-2 focus:ring-[#ED005D]/20 transition-all duration-300 font-content ${
            showIcon && iconPosition === "left" ? "pl-12 pr-4" : 
            showIcon && iconPosition === "right" ? "pl-4 pr-12" : "px-4"
          } ${className}`}
        />
        {showIcon && iconPosition === "right" && <RightSearchIcon />}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
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
                <Search className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{suggestion}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchInput 