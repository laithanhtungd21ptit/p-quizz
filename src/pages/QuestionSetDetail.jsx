import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  Users, 
  TrendingUp, 
  Share2, 
  Play, 
  Edit3, 
  Bookmark,
  Calendar,
  User,
  Target,
  Award,
  BarChart3
} from 'lucide-react'
import SavedQuizCard from '../components/SavedQuizCard'
import { getQuizById } from '../services/api'

const QuestionSetDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [questionSet, setQuestionSet] = useState(null)
  const [isStarred, setIsStarred] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAnswers, setShowAnswers] = useState(false)
  const [questions, setQuestions] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await getQuizById(id)
        // res là ApiResponse, dữ liệu nằm ở res.data
        const quiz = res?.data
        if (!quiz) {
          setError('Không tìm thấy dữ liệu bộ câu hỏi')
          setLoading(false)
          return
        }

        // Chuẩn hóa dữ liệu hiển thị trái
        const leftCard = {
          id: quiz.id,
          title: quiz.topic || 'Bộ câu hỏi',
          description: quiz.name || '',
          questionsCount: Array.isArray(quiz.questions) ? quiz.questions.length : 0,
          creator: quiz.createdBy?.firstname || 'Ẩn danh',
          creatorAvatar: quiz.createdBy?.avatar || undefined,
          favorite: !!quiz.favorite,
        }
        setQuestionSet(leftCard)
        setIsStarred(!!quiz.favorite)

        // Chuẩn hóa danh sách câu hỏi cho cột phải
        const mappedQuestions = (quiz.questions || []).map((q, index) => {
          const options = [q.answerA || '', q.answerB || '', q.answerC || '', q.answerD || '']
          const corr = (q.correctAnswer || '').toString().trim().toUpperCase()
          let correctLetter = 'A'
          if (['A','B','C','D'].includes(corr)) {
            correctLetter = corr
          } else {
            const idx = options.findIndex(opt => (opt || '').toString().trim() === corr)
            correctLetter = ['A','B','C','D'][idx >= 0 ? idx : 0]
          }
          return {
            id: q.id || index + 1,
            question: q.content || '',
            options: [
              { id: 'A', label: options[0] },
              { id: 'B', label: options[1] },
              { id: 'C', label: options[2] },
              { id: 'D', label: options[3] },
            ],
            answer: correctLetter,
          }
        })
        setQuestions(mappedQuestions)
      } catch (e) {
        console.error('Lỗi khi tải bộ câu hỏi:', e)
        setError('Không thể tải dữ liệu bộ câu hỏi. Vui lòng thử lại.')
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchData()
  }, [id])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        setOpenDropdowns({ score: false, time: false })
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const handleBack = () => {
    navigate(-1)
  }

  const handleStartQuiz = () => {
    // TODO: Navigate to quiz page
    console.log('Starting quiz:', questionSet?.id)
  }

  const handleEdit = () => {
    navigate(`/edit-question-set/${id}`)
  }

  const handleShare = () => {
    // TODO: Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: questionSet?.title,
        text: questionSet?.description,
        url: window.location.href
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Đã sao chép link vào clipboard!')
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'intermediate':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'advanced':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ED005D]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-[#ED005D] text-white rounded-lg hover:bg-[#d10052] transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  if (!questionSet) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy bộ câu hỏi</h2>
          <p className="text-gray-600 mb-4">Bộ câu hỏi bạn đang tìm kiếm không tồn tại.</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-[#ED005D] text-white rounded-lg hover:bg-[#d10052] transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[url('/background2.png')] bg-cover bg-center bg-fixed">
      {/* Top Controls - Similar to CreatePageTopControls */}
      <div className="fixed top-0 left-0 w-full h-14 bg-black/90 border-b border-gray-700 px-6 py-3 flex items-center justify-between shadow-lg z-30">
        {/* Left side - Back button, topic, and title */}
        <div className="flex items-center space-x-4">
          {/* Nút trở lại */}
          <button 
            onClick={handleBack}
            className="bg-white rounded-[10px] p-2 shadow-md hover:bg-gray-100 transition-colors duration-200"

          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>

          {/* Ô chọn/nhập chủ đề */}
          <div className="w-60">
            <input
              type="text"
              placeholder="Chọn/nhập chủ đề"
              className="bg-gray-200 rounded-[10px] p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#ED005D] text-gray-800"
              value={questionSet.title || 'Chưa có chủ đề'}
              readOnly
            />
          </div>

          {/* Textbox tiêu đề */}
          <div className="w-80">
            <div className="bg-gray-200 rounded-[10px] p-2 w-full text-left text-gray-800">
              {questionSet.description}
            </div>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center space-x-4">
          {/* Nút bookmark */}
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-lg transition-colors ${
              isBookmarked 
                ? 'text-[#ED005D] bg-[#ED005D]/10' 
                : 'text-gray-400 hover:text-[#ED005D] hover:bg-[#ED005D]/10'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          
          {/* Nút chia sẻ */}
          <button
            onClick={handleShare}
            className="p-2 text-gray-400 hover:text-[#ED005D] hover:bg-[#ED005D]/10 rounded-lg transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-14 px-6 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Content sẽ được code ở đây */}
          
          {/* Layout 2 cột */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Cột trái - SavedQuizCard */}
            <div className="flex items-start justify-start">
              <SavedQuizCard
                id={questionSet?.id || 1}
                title={questionSet?.title || 'Bộ câu hỏi'}
                subtitle={questionSet?.description || ''}
                questionCount={String(questionSet?.questionsCount || 0)}
                author={questionSet?.creator || 'Ẩn danh'}
                authorAvatar={questionSet?.creatorAvatar || 'https://placehold.co/40x40/ef4444/ffffff/png?text=?'}
                isSaved={isStarred}
              />
            </div>

            {/* Cột phải - Quiz Interface */}
            <div className="flex items-start justify-start">
              <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 ring-4 ring-pink-600/60">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-300 pb-3 mb-4">
                  <span className="font-sans font-semibold text-gray-900 text-lg select-none">{questions.length} câu hỏi</span>
                  <label htmlFor="toggle-answer" className="flex items-center cursor-pointer select-none">
                    <span className="mr-2 font-sans font-normal text-gray-900 text-base">Hiển thị đáp án</span>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        id="toggle-answer" 
                        className="sr-only"
                        checked={showAnswers}
                        onChange={(e) => setShowAnswers(e.target.checked)}
                      />
                      <div className={`w-11 h-6 rounded-full shadow-inner transition-colors duration-300 ${showAnswers ? 'bg-pink-600' : 'bg-gray-300'}`}></div>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${showAnswers ? 'translate-x-5' : 'left-1'}`}></div>
                    </div>
                  </label>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <fieldset key={question.id} className="border-b border-gray-300 pb-4 last:border-b-0 last:pb-0">
                      <legend className="font-sans font-semibold text-gray-900 mb-3">
                        {index + 1}. {question.question}
                      </legend>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-8">
                        {question.options.map((option) => (
                          <label key={option.id} className={`flex items-center cursor-pointer select-none text-gray-800 transition-all ${
                            showAnswers && option.id === question.answer ? 'text-pink-600 font-semibold' : ''
                          }`}>
                            <input
                              type="radio"
                              name={`question_${question.id}`}
                              value={option.id}
                              data-answer={question.answer}
                              className={`h-5 w-5 border-gray-300 ${
                                showAnswers && option.id === question.answer ? 'accent-pink-600' : 'text-pink-600'
                              }`}
                              checked={showAnswers && option.id === question.answer}
                              readOnly={showAnswers}
                            />
                            <span className="ml-2 font-sans text-base">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionSetDetail 
