import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import { giftAPI } from '../utils/api'
import { isAuthenticated } from '../utils/auth'
import './PersonalGiftHistoryPage.css'

// PersonalGiftHistoryPage 전용 이미지 URL (다른 컴포넌트와 완전히 독립적)
const personalGiftImage1 = "https://www.figma.com/api/mcp/asset/22a17804-a225-448c-ad64-50983c1fa891"
const personalGiftImage2 = "https://www.figma.com/api/mcp/asset/3479ec16-6041-4bb0-be11-8808d8df88df"
const personalGiftImage3 = "https://www.figma.com/api/mcp/asset/3c2a8783-5233-4eeb-b511-684069144ba3"
const personalGiftImage4 = "https://www.figma.com/api/mcp/asset/c80efe8f-7bb1-4967-bf18-e4af3f5139e6"
const personalGiftImage5 = "https://www.figma.com/api/mcp/asset/e58eabb5-b484-4998-af61-7a34377ede25"

function PersonalGiftHistoryPage() {
  const navigate = useNavigate()
  const [gifts, setGifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 모든 선물에서 연도 추출 함수
  const getGiftYear = (gift) => {
    if (gift.year) return String(gift.year)
    if (gift.purchaseDate || gift.createdAt) {
      const date = new Date(gift.purchaseDate || gift.createdAt)
      return String(date.getFullYear())
    }
    return String(new Date().getFullYear())
  }

  // 사용 가능한 모든 연도 추출
  const availableYears = [...new Set(gifts.map(g => getGiftYear(g)))].sort((a, b) => b.localeCompare(a))

  // 초기 선택 연도: 현재 연도
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  // gifts가 로드되면 가장 최근 연도로 자동 선택
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0])
    }
  }, [gifts.length]) // gifts.length를 의존성으로 사용하여 gifts가 로드될 때만 실행

  // DB에서 선물 이력 가져오기 (더미 데이터 없이 DB 데이터만 사용)
  useEffect(() => {
    const fetchGifts = async () => {
      if (!isAuthenticated()) {
        setGifts([])
        setLoading(false)
        setError('로그인이 필요합니다.')
        return
      }

      setLoading(true)
      setError(null)
      setGifts([]) // 로딩 시작 시 빈 배열로 초기화 (더미 데이터 방지)

      try {
        console.log('[PersonalGiftHistoryPage] Fetching gifts from DB...')
        const response = await giftAPI.getAll()
        console.log('[PersonalGiftHistoryPage] API Response:', response.data)
        
        if (response.data && response.data.success) {
          const giftsData = Array.isArray(response.data.data) ? response.data.data : []
          console.log('[PersonalGiftHistoryPage] Fetched gifts from DB:', giftsData)
          console.log('[PersonalGiftHistoryPage] Gifts count:', giftsData.length)
          
          // DB에서 가져온 데이터만 설정 (더미 데이터 없음)
          setGifts(giftsData)
          
          if (giftsData.length === 0) {
            console.log('[PersonalGiftHistoryPage] No gifts found in DB for current user')
          }
        } else {
          const errorMsg = response.data?.message || '선물 이력을 불러오는데 실패했습니다.'
          console.error('[PersonalGiftHistoryPage] API returned error:', errorMsg)
          setError(errorMsg)
          setGifts([])
        }
      } catch (err) {
        console.error('[PersonalGiftHistoryPage] Failed to fetch gifts:', err)
        console.error('[PersonalGiftHistoryPage] Error details:', err.response?.data)
        const errorMsg = err.response?.data?.message || err.message || '선물 이력을 불러오는 중 오류가 발생했습니다.'
        setError(errorMsg)
        setGifts([])
      } finally {
        setLoading(false)
      }
    }

    fetchGifts()
  }, [])

  // 날짜를 YYYY.MM.DD 형식으로 변환
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
  }

  // 가격을 원화 형식으로 변환
  const formatPrice = (price) => {
    if (!price) return '0원'
    return `${Number(price).toLocaleString('ko-KR')}원`
  }

  // 이미지 선택 (giftImage가 있으면 사용, 없으면 기본 이미지 순환)
  const getGiftImage = (index, giftImage) => {
    if (giftImage) return giftImage
    const images = [personalGiftImage1, personalGiftImage2, personalGiftImage3, personalGiftImage4, personalGiftImage5]
    return images[index % images.length]
  }

  // 연도별로 필터링
  const giftHistoryByYear = gifts.filter(gift => {
    const giftYear = getGiftYear(gift)
    return giftYear === String(selectedYear)
  })

  // 연도별 개수 계산 (동적으로)
  const yearCounts = availableYears.reduce((acc, year) => {
    acc[year] = gifts.filter(g => getGiftYear(g) === year).length
    return acc
  }, {})

  const handleBack = () => {
    navigate('/my/detail')
  }

  const handleYearChange = (year) => {
    setSelectedYear(year)
  }

  // UI 형식으로 변환
  const giftHistory = giftHistoryByYear.map((gift, index) => ({
    id: gift.id,
    image: getGiftImage(index, gift.giftImage),
    recipient: gift.cardName || '이름 없음',
    recipientPosition: gift.cardCompany || '',
    giftName: gift.giftName || '선물',
    category: gift.category || '기타',
    status: '전달 완료',
    date: formatDate(gift.purchaseDate || gift.createdAt),
    price: formatPrice(gift.price)
  }))

  return (
    <div className="personal-gift-history-page">
      <div className="personal-gift-history-container">
        {/* 헤더 */}
        <div className="personal-gift-history-header">
          <button className="personal-back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="personal-gift-history-title">선물 이력</h1>
        </div>

        {/* 연도별 탭 */}
        {availableYears.length > 0 && (
          <div className="personal-tab-list">
            {availableYears.map((year) => (
              <button 
                key={year}
                className={`personal-tab-button ${selectedYear === year ? 'active' : ''}`}
                onClick={() => handleYearChange(year)}
              >
                {year}년 ({yearCounts[year] || 0})
              </button>
            ))}
          </div>
        )}

        {/* 선물 이력 리스트 */}
        {loading ? (
          <div className="personal-loading">로딩 중...</div>
        ) : error ? (
          <div className="personal-error">{error}</div>
        ) : giftHistory.length > 0 ? (
          <div className="personal-gift-list">
            {giftHistory.map((gift) => (
              <div key={gift.id} className="personal-gift-card">
                <div className="personal-gift-image-wrapper">
                  <img src={gift.image} alt={gift.giftName} className="personal-gift-image" />
                </div>
                <div className="personal-gift-info">
                  <div className="personal-gift-recipient">
                    {gift.recipient} {gift.recipientPosition}
                  </div>
                  <h3 className="personal-gift-name">{gift.giftName}</h3>
                  <div className="personal-gift-tags">
                    <span className="personal-category-tag">{gift.category}</span>
                    <span className="personal-status-tag">{gift.status}</span>
                  </div>
                  <div className="personal-gift-footer">
                    <span className="personal-gift-date">{gift.date}</span>
                    <span className="personal-gift-price">{gift.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="personal-empty">등록된 선물 이력이 없습니다.</div>
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}

export default PersonalGiftHistoryPage

