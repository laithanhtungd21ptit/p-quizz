import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Star, Eye, User, Calendar } from 'lucide-react'
import StatsPanel from '../components/StatsPanel'
import QuestionCard from '../components/QuestionCard'
import WeeklyChart from '../components/WeeklyChart'
import SavedQuizCard from '../components/SavedQuizCard'
import { mockStats, mockQuestions, mockWeeklyData } from '../data/mockData'

const Dashboard = () => {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)
  const [scrollPosition, setScrollPosition] = useState(0)
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  const weeks = [
    "01/07/2025 - 13/07/2025",
    "14/07/2025 - 20/07/2025", 
    "21/07/2025 - 27/07/2025"
  ]

  const featuredQuestions = mockQuestions.slice(0, 3)

  // Mock data for the chart
  const chartData = {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [
      {
        label: 'Số bộ câu hỏi',
        data: [12, 19, 15, 25, 22, 30, 28],
        borderColor: '#3182ce',
        backgroundColor: 'rgba(49, 130, 206, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Số người đăng kí',
        data: [8, 15, 12, 20, 18, 25, 22],
        borderColor: '#38a169',
        backgroundColor: 'rgba(56, 161, 105, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }

  const handleScroll = (direction) => {
    const container = document.getElementById('savedCards')
    if (container) {
      const getCardWidth = () => {
        const card = container.querySelector('.max-w-md')
        if (!card) return 400
        const style = window.getComputedStyle(card)
        const margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight)
        return card.offsetWidth + margin
      }

      const getScrollOffset = (direction = 1) => {
        const card = container.querySelector('.max-w-md')
        if (!card) return 400
        const style = window.getComputedStyle(card)
        const margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight)
        // Lấy khoảng cách gap giữa các card (từ CSS)
        const wrapperStyle = window.getComputedStyle(container)
        const gap = parseFloat(wrapperStyle.gap) || 20
        const paddingLeft = parseFloat(wrapperStyle.paddingLeft) || 10
        const paddingRight = parseFloat(wrapperStyle.paddingRight) || 10
        const cardWidthWithGap = card.offsetWidth + margin + gap
        
        // Nếu đang ở đầu/cuối, cộng thêm 2 lần padding để card sát mép ngoài
        if (direction < 0 && container.scrollLeft <= cardWidthWithGap) {
          return cardWidthWithGap + 2 * paddingLeft
        }
        if (direction > 0 && (container.scrollWidth - container.clientWidth - container.scrollLeft <= cardWidthWithGap)) {
          return cardWidthWithGap + 2 * paddingRight
        }
        return cardWidthWithGap
      }

      const offset = getScrollOffset(direction === 'left' ? -1 : 1)
      container.scrollBy({ 
        left: direction === 'left' ? -offset : offset, 
        behavior: 'smooth' 
      })
    }
  }

  const handleWeekNavigation = (direction) => {
    if (direction === 'prev' && currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1)
    } else if (direction === 'next' && currentWeekIndex < weeks.length - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1)
    }
  }

  // Initialize chart
  useEffect(() => {
    const initChart = async () => {
      try {
        const { Chart, registerables } = await import('chart.js/auto')
        Chart.register(...registerables)
        
        if (chartRef.current && !chartInstance.current) {
          const ctx = chartRef.current.getContext('2d')
          chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                x: {
                  grid: {
                    color: 'rgba(237, 0, 93, 0.1)',
                    borderColor: 'rgba(237, 0, 93, 0.3)'
                  },
                  ticks: {
                    color: '#ED005D',
                    font: {
                      size: 12
                    }
                  }
                },
                y: {
                  grid: {
                    color: 'rgba(237, 0, 93, 0.1)',
                    borderColor: 'rgba(237, 0, 93, 0.3)'
                  },
                  ticks: {
                    color: '#ED005D',
                    font: {
                      size: 12
                    }
                  }
                }
              },
              elements: {
                point: {
                  backgroundColor: '#ED005D',
                  borderColor: '#ED005D',
                  borderWidth: 2,
                  radius: 4,
                  hoverRadius: 6
                }
              }
            }
          })
        }
      } catch (error) {
        console.error('Error loading Chart.js:', error)
      }
    }

    initChart()

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
        chartInstance.current = null
      }
    }
  }, [])

  // Check scroll buttons visibility
  useEffect(() => {
    const checkScrollButtons = () => {
      const container = document.getElementById('savedCards')
      const leftBtn = document.getElementById('leftScrollBtn')
      const rightBtn = document.getElementById('rightScrollBtn')
      
      if (container && leftBtn && rightBtn) {
        const hasOverflow = container.scrollWidth > container.clientWidth
        
        if (hasOverflow) {
          // Có overflow, hiển thị nút phải nếu chưa ở cuối
          rightBtn.style.display = container.scrollLeft >= container.scrollWidth - container.clientWidth - 10 ? 'none' : 'flex'
          // Hiển thị nút trái nếu không ở đầu
          leftBtn.style.display = container.scrollLeft <= 10 ? 'none' : 'flex'
        } else {
          // Không có overflow, ẩn cả hai nút
          leftBtn.style.display = 'none'
          rightBtn.style.display = 'none'
        }
      }
    }

    // Kiểm tra ngay khi component mount
    checkScrollButtons()
    
    // Kiểm tra khi window resize
    window.addEventListener('resize', checkScrollButtons)
    
    return () => {
      window.removeEventListener('resize', checkScrollButtons)
    }
  }, [])

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Main Header Row - giống layout gốc */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <p className="greeting text-xl sm:text-2xl font-semibold text-gray-100 tracking-wide m-0">
          Xin chào, John!
        </p>
        <div className="flex-shrink-0 flex items-center h-12">
          <a href="#" aria-label="Nhập mã phòng" className="room-code-img-link">
            <img 
              src="./code.png" 
              alt="Nhập mã phòng" 
              className="h-12 object-contain block transition-transform duration-150 cursor-pointer hover:scale-105" 
            />
          </a>
        </div>
      </div>

      {/* Statistics and Top Authors Section */}
      <section className="panels flex-col lg:flex-row" aria-label="Thống kê tuần và tác giả hàng đầu" style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
        <div className="panel highlight" aria-label="Thống kê trong tuần" style={{flex: '1.2', minWidth: 'auto', display: 'flex', flexDirection: 'column', minHeight: '140px', backgroundColor: '#ffffff', border: '2px solid #ED005D', borderRadius: '12px', padding: '20px', boxShadow: '0 0 20px rgba(237, 0, 93, 0.3)'}}>
          <h3 style={{color: '#ED005D', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center'}}>Thống kê trong tuần</h3>
          <div className="date-range" role="group" aria-live="polite" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '20px'}}>
            <button 
              className="nav-btn" 
              id="prev-week" 
              aria-label="Tuần trước" 
              title="Tuần trước"
              onClick={() => handleWeekNavigation('prev')}
              style={{
                backgroundColor: 'transparent',
                color: '#ED005D',
                border: '2px solid #ED005D',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 10px rgba(237, 0, 93, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#ED005D';
                e.target.style.color = 'white';
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 0 15px rgba(237, 0, 93, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#ED005D';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 0 10px rgba(237, 0, 93, 0.3)';
              }}
            >
              ‹
            </button>
            <div style={{
              backgroundColor: 'rgba(237, 0, 93, 0.1)',
              border: '1px solid #ED005D',
              borderRadius: '20px',
              padding: '8px 20px',
              minWidth: '200px',
              textAlign: 'center',
              boxShadow: '0 0 15px rgba(237, 0, 93, 0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <span id="date-range-text" style={{
                color: '#ED005D', 
                fontSize: '1rem', 
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>
                {weeks[currentWeekIndex]}
              </span>
            </div>
            <button 
              className="nav-btn" 
              id="next-week" 
              aria-label="Tuần kế tiếp" 
              title="Tuần kế tiếp"
              onClick={() => handleWeekNavigation('next')}
              style={{
                backgroundColor: 'transparent',
                color: '#ED005D',
                border: '2px solid #ED005D',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 10px rgba(237, 0, 93, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#ED005D';
                e.target.style.color = 'white';
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 0 15px rgba(237, 0, 93, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#ED005D';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 0 10px rgba(237, 0, 93, 0.3)';
              }}
            >
              ›
            </button>
          </div>
          <div className="chart-container" style={{flex: '1', minHeight: '160px', height: '160px', backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '15px', border: '1px solid #ED005D'}}>
            <canvas ref={chartRef} style={{width: '100% !important', height: '100% !important', display: 'block'}} role="img" aria-label="Biểu đồ số bộ câu hỏi và số người đăng kí hàng ngày trong tuần"></canvas>
          </div>
          <div className="legend flex justify-center gap-8 mt-4 select-none" aria-hidden="true" style={{marginTop: '15px'}}>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#3182ce'}}></div> Số bộ câu hỏi
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#38a169'}}></div> Số người đăng kí
            </div>
          </div>
        </div>

        <div className="panel author-panel" aria-label="Tác giả hàng đầu" style={{flex: '1', minWidth: 'auto', display: 'flex', flexDirection: 'column', minHeight: '140px', backgroundColor: '#ffffff', border: '2px solid #ED005D', borderRadius: '12px', padding: '20px', boxShadow: '0 0 20px rgba(237, 0, 93, 0.3)', marginRight: '20px'}}>
          <h3 style={{color: '#ED005D', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center'}}>Tác giả hàng đầu</h3>
          <div className="author-list" id="authorList" style={{flex: '1', overflowY: 'auto', maxHeight: '300px', paddingRight: '8px'}}>
            <article className="author-item" tabIndex="0" role="listitem" aria-label="Ngô Quốc Anh, 98 bộ câu hỏi">
              <div className="author-info">
                <img 
                  src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/e69efc41-e613-4cc4-8775-3f1e74bfe878.png" 
                  alt="Ảnh chân dung Ngô Quốc Anh, người đàn ông trẻ với áo đen và kính tròn" 
                />
                <span className="author-name">Ngô Quốc Anh</span>
              </div>
              <div className="author-badge">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M9 17v-6M13 17v-4M16 17v-10"></path>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                </svg>
                <span>98 bộ câu hỏi</span>
              </div>
            </article>
            <article className="author-item" tabIndex="0" role="listitem" aria-label="Lại Thanh Tùng, 90 bộ câu hỏi">
              <div className="author-info">
                <img 
                  src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/b40ebf9e-0381-479e-8d5a-977dacf706ec.png" 
                  alt="Ảnh chân dung Lại Thanh Tùng, người đàn ông đeo kính gọng đen tóc ngắn" 
                />
                <span className="author-name">Lại Thanh Tùng</span>
              </div>
              <div className="author-badge">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M9 17v-6M13 17v-4M16 17v-10"></path>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                </svg>
                <span>90 bộ câu hỏi</span>
              </div>
            </article>
            <article className="author-item" tabIndex="0" role="listitem" aria-label="Vũ Văn Toản, 86 bộ câu hỏi">
              <div className="author-info">
                <img 
                  src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/73041618-0a8e-43ac-8ee7-0b898d3a9c20.png" 
                  alt="Ảnh chân dung Vũ Văn Toản, người đàn ông trẻ mặc áo đen với nụ cười nhẹ" 
                />
                <span className="author-name">Vũ Văn Toản</span>
              </div>
              <div className="author-badge">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M9 17v-6M13 17v-4M16 17v-10"></path>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                </svg>
                <span>86 bộ câu hỏi</span>
              </div>
            </article>
            <article className="author-item" tabIndex="0" role="listitem" aria-label="Nguyễn Tùng, 80 bộ câu hỏi">
              <div className="author-info">
                <img 
                  src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/60549c4f-441e-47db-b3d0-65a6f47bd140.png" 
                  alt="Ảnh chân dung Nguyễn Tùng, chàng trai trẻ tóc tối màu, mặc áo đen" 
                />
                <span className="author-name">Nguyễn Tùng</span>
              </div>
              <div className="author-badge">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M9 17v-6M13 17v-4M16 17v-10"></path>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                </svg>
                <span>80 bộ câu hỏi</span>
              </div>
            </article>
            <article className="author-item" tabIndex="0" role="listitem" aria-label="Trần Văn Minh, 75 bộ câu hỏi">
              <div className="author-info">
                <img 
                  src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/e69efc41-e613-4cc4-8775-3f1e74bfe878.png" 
                  alt="Ảnh chân dung Trần Văn Minh" 
                />
                <span className="author-name">Trần Văn Minh</span>
              </div>
              <div className="author-badge">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M9 17v-6M13 17v-4M16 17v-10"></path>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                </svg>
                <span>75 bộ câu hỏi</span>
              </div>
            </article>
            <article className="author-item" tabIndex="0" role="listitem" aria-label="Lê Thị Hương, 72 bộ câu hỏi">
              <div className="author-info">
                <img 
                  src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/b40ebf9e-0381-479e-8d5a-977dacf706ec.png" 
                  alt="Ảnh chân dung Lê Thị Hương" 
                />
                <span className="author-name">Lê Thị Hương</span>
              </div>
              <div className="author-badge">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M9 17v-6M13 17v-4M16 17v-10"></path>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                </svg>
                <span>72 bộ câu hỏi</span>
              </div>
            </article>
            <article className="author-item" tabIndex="0" role="listitem" aria-label="Phạm Đức Anh, 68 bộ câu hỏi">
              <div className="author-info">
                <img 
                  src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/73041618-0a8e-43ac-8ee7-0b898d3a9c20.png" 
                  alt="Ảnh chân dung Phạm Đức Anh" 
                />
                <span className="author-name">Phạm Đức Anh</span>
              </div>
              <div className="author-badge">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M9 17v-6M13 17v-4M16 17v-10"></path>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                </svg>
                <span>68 bộ câu hỏi</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Featured Questions Section */}
      <div style={{display: 'flex', justifyContent: 'flex-start', marginTop: '20px', marginBottom: '20px'}}>
        <img 
          src="/Group 1000002744.png" 
          alt="Bộ câu hỏi nổi bật" 
          className="featured-title-img" 
          style={{display: 'block', maxWidth: '200px', margin: '5px', filter: 'drop-shadow(0 2px 8px #ED005D55)'}} 
        />
      </div>

      {/* Saved Quiz Cards Row */}
      <div style={{position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px'}}>
        {/* Left Arrow Button */}
        <button 
          id="leftScrollBtn"
          onClick={() => handleScroll('left')}
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: '#ED005D',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            boxShadow: '0 0 10px rgba(237, 0, 93, 0.3)',
            zIndex: 10,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-50%) scale(1.1)';
            e.target.style.boxShadow = '0 0 15px rgba(237, 0, 93, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(-50%) scale(1)';
            e.target.style.boxShadow = '0 0 10px rgba(237, 0, 93, 0.3)';
          }}
        >
          ‹
        </button>

        {/* Cards Container */}
        <div 
          id="savedCards"
          style={{
            display: 'flex', 
            gap: '20px', 
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            padding: '0 10px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            width: '98%',
            maxWidth: '1200px',
            alignItems: 'flex-start'
          }}
          onScroll={(e) => {
            const container = e.target;
            const leftBtn = document.getElementById('leftScrollBtn');
            const rightBtn = document.getElementById('rightScrollBtn');
            
            if (leftBtn && rightBtn) {
              // Show/hide left button
              if (container.scrollLeft <= 10) {
                leftBtn.style.display = 'none';
              } else {
                leftBtn.style.display = 'flex';
              }
              
              // Show/hide right button
              const maxScroll = container.scrollWidth - container.clientWidth;
              if (container.scrollLeft >= maxScroll - 10) {
                rightBtn.style.display = 'none';
              } else {
                rightBtn.style.display = 'flex';
              }
            }
          }}
        >
          <SavedQuizCard 
            title="TIẾNG NHẬT"
            subtitle="Từ vựng Mina no Nihongo bài 25"
            questionCount="10"
            author="Ngô Quốc Anh"
            authorAvatar="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/8fb5f33e-5e67-4591-8df0-33e231a368c9.png"
          />
          <SavedQuizCard 
            title="TOÁN HỌC"
            subtitle="Đại số tuyến tính - Ma trận và định thức"
            questionCount="15"
            author="Lại Thanh Tùng"
            authorAvatar="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/b40ebf9e-0381-479e-8d5a-977dacf706ec.png"
          />
          <SavedQuizCard 
            title="VẬT LÝ"
            subtitle="Cơ học lượng tử - Nguyên lý bất định"
            questionCount="12"
            author="Vũ Văn Toản"
            authorAvatar="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/73041618-0a8e-43ac-8ee7-0b898d3a9c20.png"
          />
          <SavedQuizCard 
            title="HÓA HỌC"
            subtitle="Hóa học hữu cơ - Phản ứng oxi hóa khử"
            questionCount="18"
            author="Nguyễn Tùng"
            authorAvatar="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/60549c4f-441e-47db-b3d0-65a6f47bd140.png"
          />
          <SavedQuizCard 
            title="SINH HỌC"
            subtitle="Di truyền học - Gen và nhiễm sắc thể"
            questionCount="14"
            author="Trần Văn Minh"
            authorAvatar="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/e69efc41-e613-4cc4-8775-3f1e74bfe878.png"
          />
          <SavedQuizCard 
            title="LỊCH SỬ"
            subtitle="Lịch sử Việt Nam - Thời kỳ phong kiến"
            questionCount="20"
            author="Lê Thị Hương"
            authorAvatar="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/b40ebf9e-0381-479e-8d5a-977dacf706ec.png"
          />
          <SavedQuizCard 
            title="ĐỊA LÝ"
            subtitle="Địa lý tự nhiên - Khí hậu và thời tiết"
            questionCount="16"
            author="Phạm Đức Anh"
            authorAvatar="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/73041618-0a8e-43ac-8ee7-0b898d3a9c20.png"
          />
          <SavedQuizCard 
            title="VĂN HỌC"
            subtitle="Văn học Việt Nam - Truyện Kiều"
            questionCount="22"
            author="Hoàng Thị Lan"
            authorAvatar="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/e69efc41-e613-4cc4-8775-3f1e74bfe878.png"
          />
          <SavedQuizCard 
            title="TIẾNG ANH"
            subtitle="Grammar - Present Perfect Tense"
            questionCount="25"
            author="Nguyễn Văn Hùng"
            authorAvatar="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/b40ebf9e-0381-479e-8d5a-977dacf706ec.png"
          />
          <SavedQuizCard 
            title="TIN HỌC"
            subtitle="Lập trình Python - Cơ bản đến nâng cao"
            questionCount="30"
            author="Lê Minh Tuấn"
            authorAvatar="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/60549c4f-441e-47db-b3d0-65a6f47bd140.png"
          />
          <SavedQuizCard 
            title="ÂM NHẠC"
            subtitle="Lý thuyết âm nhạc - Nhạc lý cơ bản"
            questionCount="15"
            author="Trần Thị Mai"
            authorAvatar="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/73041618-0a8e-43ac-8ee7-0b898d3a9c20.png"
          />
          <SavedQuizCard 
            title="MỸ THUẬT"
            subtitle="Lịch sử mỹ thuật - Trường phái Ấn tượng"
            questionCount="12"
            author="Vũ Hoàng Nam"
            authorAvatar="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/e69efc41-e613-4cc4-8775-3f1e74bfe878.png"
          />
        </div>

        {/* Right Arrow Button */}
        <button 
          id="rightScrollBtn"
          onClick={() => handleScroll('right')}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: '#ED005D',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            boxShadow: '0 0 10px rgba(237, 0, 93, 0.3)',
            zIndex: 10,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-50%) scale(1.1)';
            e.target.style.boxShadow = '0 0 15px rgba(237, 0, 93, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(-50%) scale(1)';
            e.target.style.boxShadow = '0 0 10px rgba(237, 0, 93, 0.3)';
          }}
        >
          ›
        </button>
      </div>
      
    </div>
  )
}

export default Dashboard 