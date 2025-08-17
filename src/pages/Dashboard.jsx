import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Star, Eye, User, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatsPanel from '../components/StatsPanel'
import QuestionCard from '../components/QuestionCard'
import SavedQuizCard from '../components/SavedQuizCard'
import { mockStats, mockQuestions, mockWeeklyData } from '../data/mockData'
import { getUserProfile, getDailyStats, getTopQuizCreators, getUserFavorites } from '../services/api'

const Dashboard = () => {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [userFirstname, setUserFirstname] = useState('')
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [profileError, setProfileError] = useState('')
  
  // Reset kick flag khi vào dashboard
  useEffect(() => {
    window.isBeingKicked = false;
  }, []);
  const [dailyStats, setDailyStats] = useState([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [topCreators, setTopCreators] = useState([])
  const [isLoadingCreators, setIsLoadingCreators] = useState(true)
  const [featuredQuizzes, setFeaturedQuizzes] = useState([])
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true)
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const navigate = useNavigate()

  // Function để tính toán tuần hiện tại và các tuần xung quanh
  const getCurrentWeekInfo = () => {
    const today = new Date()
    const currentDay = today.getDay()
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1 // 0 = Chủ nhật
    const monday = new Date(today)
    monday.setDate(today.getDate() - daysToMonday)
    monday.setHours(0, 0, 0, 0)
    
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    
    return { monday, sunday }
  }

  // Function để format ngày thành chuỗi hiển thị
  const formatDateRange = (startDate, endDate) => {
    const formatDate = (date) => {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  // Tính toán tuần hiện tại
  const { monday: currentMonday, sunday: currentSunday } = getCurrentWeekInfo()
  
  // Tạo mảng weeks động dựa trên tuần hiện tại
  const generateWeeks = () => {
    const weeks = []
    // Tuần trước (3 tuần)
    for (let i = 3; i >= 1; i--) {
      const weekStart = new Date(currentMonday)
      weekStart.setDate(currentMonday.getDate() - (i * 7))
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weeks.push({
        startDate: weekStart,
        endDate: weekEnd,
        label: formatDateRange(weekStart, weekEnd)
      })
    }
    // Tuần hiện tại
    weeks.push({
      startDate: currentMonday,
      endDate: currentSunday,
      label: formatDateRange(currentMonday, currentSunday)
    })
    // Tuần sau (3 tuần)
    for (let i = 1; i <= 3; i++) {
      const weekStart = new Date(currentMonday)
      weekStart.setDate(currentMonday.getDate() + (i * 7))
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weeks.push({
        startDate: weekStart,
        endDate: weekEnd,
        label: formatDateRange(weekStart, weekEnd)
      })
    }
    return weeks
  }

  const weeks = generateWeeks()
  // Tìm index của tuần hiện tại và khởi tạo state
  const initialWeekIndex = weeks.findIndex(week => 
    week.startDate.getTime() === currentMonday.getTime()
  )
  const [currentWeekIndex, setCurrentWeekIndex] = useState(initialWeekIndex)

  // Fetch user profile khi component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Kiểm tra token trước khi gọi API
        const token = localStorage.getItem('token')
        if (!token) {
          console.log('Không có token, chuyển đến trang login')
          navigate('/login')
          return
        }

        setIsLoadingProfile(true)
        setProfileError('') // Clear error trước khi fetch
        const userData = await getUserProfile()
        if (userData && userData.firstname) {
          setUserFirstname(userData.firstname)
          setProfileError('') // Clear error nếu thành công
        } else {
          // Fallback nếu không có firstname
          setUserFirstname('User')
          setProfileError('Không thể lấy tên người dùng')
        }
      } catch (error) {
        console.error('Không thể lấy thông tin user profile:', error)
        // Nếu lỗi 401/403, có thể token hết hạn
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('Token hết hạn hoặc không hợp lệ, chuyển đến trang login')
          navigate('/login')
          return
        }
        // Fallback về tên mặc định nếu có lỗi khác
        setUserFirstname('User')
        setProfileError('Lỗi khi tải thông tin người dùng')
      } finally {
        setIsLoadingProfile(false)
      }
    }

    fetchUserProfile()
  }, [navigate])

  // Fetch daily statistics khi component mount
  useEffect(() => {
    fetchDailyStats()
  }, [])

  // Fetch top quiz creators khi component mount
  useEffect(() => {
    fetchTopCreators()
  }, [])

  // Fetch featured quizzes khi component mount
  useEffect(() => {
    fetchFeaturedQuizzes()
  }, [])

  // Cập nhật hiển thị nút mũi tên khi featuredQuizzes thay đổi
  useEffect(() => {
    const leftBtn = document.getElementById('leftScrollBtn');
    const rightBtn = document.getElementById('rightScrollBtn');
    
    if (leftBtn && rightBtn) {
      if (featuredQuizzes.length > 3) {
        leftBtn.style.display = 'none'; // Ẩn nút trái ban đầu
        rightBtn.style.display = 'flex'; // Hiện nút phải ban đầu
      } else {
        leftBtn.style.display = 'none';
        rightBtn.style.display = 'none';
      }
    }
  }, [featuredQuizzes])

  // Function để fetch daily statistics
  const fetchDailyStats = async () => {
    try {
      setIsLoadingStats(true)
      // Lấy ngày đầu tuần hiện tại (Thứ 2)
      const today = new Date()
      const currentDay = today.getDay()
      const daysToMonday = currentDay === 0 ? 6 : currentDay - 1 // 0 = Chủ nhật
      const monday = new Date(today)
      monday.setDate(today.getDate() - daysToMonday)
      monday.setHours(0, 0, 0, 0)
      
      const stats = await getDailyStats(monday)
      setDailyStats(stats)
    } catch (error) {
      console.error('Lỗi khi lấy thống kê hàng ngày:', error)
      // Fallback về mock data nếu có lỗi
      setDailyStats(mockWeeklyData.map((item, index) => ({
        date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        users: item.users,
        quizzes: item.questions
      })))
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Function để fetch daily statistics cho tuần cụ thể
  const fetchDailyStatsForWeek = async (startDate) => {
    try {
      setIsLoadingStats(true)
      const stats = await getDailyStats(startDate)
      setDailyStats(stats)
    } catch (error) {
      console.error('Lỗi khi lấy thống kê hàng ngày cho tuần:', error)
      // Fallback về mock data nếu có lỗi
      setDailyStats(mockWeeklyData.map((item, index) => ({
        date: new Date(startDate.getTime() + index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        users: item.users,
        quizzes: item.questions
      })))
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Function để fetch top quiz creators
  const fetchTopCreators = async () => {
    try {
      setIsLoadingCreators(true)
      const creators = await getTopQuizCreators()
      setTopCreators(creators)
    } catch (error) {
      console.error('Lỗi khi lấy top quiz creators:', error)
      // Fallback về mock data nếu có lỗi
      setTopCreators([
        { username: 'Ngô Quốc Anh', totalQuiz: 98, avatar: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/e69efc41-e613-4cc4-8775-3f1e74bfe878.png' },
        { username: 'Lại Thanh Tùng', totalQuiz: 90, avatar: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/b40eb9e-0381-479e-8d5a-977dacf706ec.png' },
        { username: 'Vũ Văn Toản', totalQuiz: 86, avatar: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/73041618-0a8e-43ac-8ee7-0b898d3a9c20.png' },
        { username: 'Nguyễn Tùng', totalQuiz: 80, avatar: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/60549c4f-441e-47db-b3d0-65a6f47bd140.png' },
        { username: 'Trần Văn Minh', totalQuiz: 75, avatar: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/e69efc41-e613-4cc4-8775-3f1e74bfe878.png' },
        { username: 'Lê Thị Hương', totalQuiz: 72, avatar: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/b40eb9e-0381-479e-8d5a-977dacf706ec.png' }
      ])
    } finally {
      setIsLoadingCreators(false)
    }
  }

  // Function để fetch featured quizzes (sử dụng getUserFavorites)
  const fetchFeaturedQuizzes = async () => {
    try {
      setIsLoadingFeatured(true)
      const quizzes = await getUserFavorites()
      setFeaturedQuizzes(quizzes)
    } catch (error) {
      console.error('Lỗi khi lấy bộ câu hỏi nổi bật:', error)
      // Fallback về mock data nếu có lỗi
      setFeaturedQuizzes([
        { quizId: 1, quizTopic: 'TIẾNG NHẬT', quizName: 'Từ vựng Mina no Nihongo bài 25', questions: Array(10), creator: 'Ngô Quốc Anh', creatorImageUrl: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/8fb5f33e-5e67-4591-8df0-33e231a368c9.png' },
        { quizId: 2, quizTopic: 'TOÁN HỌC', quizName: 'Đại số tuyến tính - Ma trận và định thức', questions: Array(15), creator: 'Lại Thanh Tùng', creatorImageUrl: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/b40eb9e-0381-479e-8d5a-977dacf706ec.png' },
        { quizId: 3, quizTopic: 'VẬT LÝ', quizName: 'Cơ học lượng tử - Nguyên lý bất định', questions: Array(12), creator: 'Vũ Văn Toản', creatorImageUrl: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/73041618-0a8e-43ac-8ee7-0b898d3a9c20.png' }
      ])
    } finally {
      setIsLoadingFeatured(false)
    }
  }

  const featuredQuestions = mockQuestions.slice(0, 3)

  // Mock data for the chart
  const chartData = {
    labels: dailyStats.length > 0 ? dailyStats.map(stat => {
      const date = new Date(stat.date);
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return days[date.getDay()];
    }) : ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [
      {
        label: 'Số bộ câu hỏi',
        data: dailyStats.length > 0 ? dailyStats.map(stat => stat.quizzes) : [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#3182ce',
        backgroundColor: 'rgba(49, 130, 206, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Số người đăng kí',
        data: dailyStats.length > 0 ? dailyStats.map(stat => stat.users) : [0, 0, 0, 0, 0, 0, 0],
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
      const newWeekIndex = currentWeekIndex - 1
      setCurrentWeekIndex(newWeekIndex)
      // Lấy startDate từ tuần mới
      const newWeek = weeks[newWeekIndex]
      fetchDailyStatsForWeek(newWeek.startDate)
    } else if (direction === 'next' && currentWeekIndex < weeks.length - 1) {
      const newWeekIndex = currentWeekIndex + 1
      setCurrentWeekIndex(newWeekIndex)
      // Lấy startDate từ tuần mới
      const newWeek = weeks[newWeekIndex]
      fetchDailyStatsForWeek(newWeek.startDate)
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
  }, [dailyStats]) // Thêm dailyStats vào dependency

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
          Xin chào, {isLoadingProfile ? (
            <span className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang tải...
            </span>
          ) : userFirstname || 'User'}!
        </p>
        {profileError && (
          <p className="text-sm text-red-400 mt-1">
            {profileError}
          </p>
        )}
        <div className="flex-shrink-0 flex items-center h-12">
          <button 
            onClick={() => navigate('/enter-room-code')}
            aria-label="Nhập mã phòng" 
            className="room-code-img-link"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer'
            }}
          >
            <img 
              src="./code.png" 
              alt="Nhập mã phòng" 
              className="h-12 object-contain block transition-transform duration-150 hover:scale-105" 
            />
          </button>
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
                {weeks[currentWeekIndex].label}
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
            {isLoadingStats ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ED005D] mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Đang tải dữ liệu...</p>
                </div>
              </div>
            ) : (
              <canvas ref={chartRef} style={{width: '100% !important', height: '100% !important', display: 'block'}} role="img" aria-label="Biểu đồ số bộ câu hỏi và số người đăng kí hàng ngày trong tuần"></canvas>
            )}
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
            {isLoadingCreators ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ED005D] mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Đang tải dữ liệu...</p>
                </div>
              </div>
            ) : topCreators.length > 0 ? (
              topCreators.map((creator, index) => (
                <article 
                  key={index}
                  className="author-item" 
                  tabIndex="0" 
                  role="listitem" 
                                     aria-label={`${creator.username}, ${creator.totalQuiz} bộ câu hỏi`}
                >
                  <div className="author-info">
                    <img 
                      src={creator.avatar || "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/e69efc41-e613-4cc4-8775-3f1e74bfe878.png"} 
                      alt={`Ảnh chân dung ${creator.username}`} 
                    />
                    <span className="author-name">{creator.username}</span>
                  </div>
                  <div className="author-badge">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M9 17v-6M13 17v-4M16 17v-10"></path>
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    </svg>
                                         <span>{creator.totalQuiz} bộ câu hỏi</span>
                  </div>
                </article>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>Không có dữ liệu tác giả</p>
              </div>
            )}
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
            display: featuredQuizzes.length > 3 ? 'flex' : 'none',
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
            
            if (leftBtn && rightBtn && featuredQuizzes.length > 3) {
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
          {isLoadingFeatured ? (
            <div className="flex items-center justify-center w-full py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ED005D]"></div>
            </div>
          ) : featuredQuizzes.length > 0 ? (
            featuredQuizzes.map((quiz) => (
              <SavedQuizCard 
                key={quiz.quizId}
                id={quiz.quizId}
                title={quiz.quizTopic}
                subtitle={quiz.quizName}
                questionCount={String(quiz.questions?.length || 0)}
                author={quiz.creator}
                authorAvatar={quiz.creatorImageUrl}
                isSaved={true}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>Không có bộ câu hỏi nổi bật</p>
            </div>
          )}

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
            display: featuredQuizzes.length > 3 ? 'flex' : 'none',
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