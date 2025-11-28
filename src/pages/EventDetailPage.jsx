import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './EventDetailPage.css'

// 아이콘 이미지 URL
const imgIcon = "https://www.figma.com/api/mcp/asset/ee258417-6b3f-4f61-b06d-4c34a0ab3bbf"
const imgIcon1 = "https://www.figma.com/api/mcp/asset/5dfd05ca-69e9-4ad2-91f9-9ca220872e77"
const imgImage8 = "https://www.figma.com/api/mcp/asset/5135f6d8-2215-44f2-999f-16d9c71f7707"
const imgImage9 = "https://www.figma.com/api/mcp/asset/9413a1e4-8f67-4a81-bc06-45582d87fbdc"

// 날짜 포맷팅 함수
const formatDateForDisplay = (date) => {
  if (!date) return ''
  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = weekdays[date.getDay()]
  return `${year}년 ${month}월 ${day}일 ${weekday}`
}

const formatTimeForDisplay = (date) => {
  if (!date) return ''
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const period = hours < 12 ? '오전' : '오후'
  const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours)
  return `${period} ${displayHours}시${minutes > 0 ? ` ${minutes}분` : ''}`
}

const formatTimeShort = (date) => {
  if (!date) return ''
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const period = hours < 12 ? '오전' : '오후'
  const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours)
  return `${period} ${displayHours}시`
}

function EventDetailPage() {
  const navigate = useNavigate()
  const { eventId } = useParams()
  const [isEditing, setIsEditing] = useState(false)
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // 편집 폼 상태
  const [formData, setFormData] = useState({
    title: '',
    participant: '',
    startDate: null,
    startTime: '',
    endTime: '',
    memo: '',
    notification: ''
  })

  // 이벤트 데이터 로드 (실제로는 API에서 가져옴)
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // TODO: 백엔드 API에서 이벤트 데이터 가져오기
        // const response = await fetch(`/api/calendar/events/${eventId}`)
        // const data = await response.json()
        // setEvent(data)
        
        // 임시: localStorage나 전역 상태에서 이벤트 가져오기
        // 실제로는 API 호출로 대체
        const storedEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]')
        const foundEvent = storedEvents.find(e => e.id === eventId)
        
        if (foundEvent) {
          const eventData = {
            ...foundEvent,
            startDate: new Date(foundEvent.startDate),
            endDate: new Date(foundEvent.endDate)
          }
          setEvent(eventData)
          setFormData({
            title: eventData.title,
            participant: eventData.participant || '',
            startDate: eventData.startDate,
            startTime: formatTimeShort(eventData.startDate),
            endTime: formatTimeShort(eventData.endDate),
            memo: eventData.memo || '',
            notification: eventData.notification || ''
          })
        } else {
          // 샘플 데이터 (event1인 경우)
          const today = new Date()
          const sampleEvent = {
            id: eventId || 'event1',
            title: 'A사 미팅',
            participant: '지문호',
            startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
            endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
            memo: '첫 번째 미팅입니다. 모두 참석 부탁드립니다.',
            notification: null,
            category: '미팅',
            color: '#584cdc'
          }
          
          setEvent(sampleEvent)
          setFormData({
            title: sampleEvent.title,
            participant: sampleEvent.participant,
            startDate: sampleEvent.startDate,
            startTime: formatTimeShort(sampleEvent.startDate),
            endTime: formatTimeShort(sampleEvent.endDate),
            memo: sampleEvent.memo || '',
            notification: sampleEvent.notification || ''
          })
        }
      } catch (err) {
        console.error('이벤트 로드 실패:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchEvent()
  }, [eventId])

  const handleBack = () => {
    navigate('/calendar')
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      // TODO: 백엔드 API로 이벤트 업데이트
      // const response = await fetch(`/api/calendar/events/${eventId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     summary: formData.title,
      //     extendedProperties: {
      //       private: {
      //         participant: formData.participant,
      //         memo: formData.memo
      //       }
      //     }
      //   })
      // })
      // const data = await response.json()
      
      // 임시: 로컬 상태 업데이트 및 localStorage 저장
      const updatedEvent = {
        ...event,
        title: formData.title,
        participant: formData.participant,
        memo: formData.memo
      }
      setEvent(updatedEvent)
      
      // localStorage 업데이트 (실제로는 API 응답 후 처리)
      const storedEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]')
      const eventIndex = storedEvents.findIndex(e => e.id === eventId)
      if (eventIndex >= 0) {
        storedEvents[eventIndex] = {
          ...storedEvents[eventIndex],
          title: formData.title,
          participant: formData.participant,
          memo: formData.memo
        }
        localStorage.setItem('calendarEvents', JSON.stringify(storedEvents))
      }
      
      setIsEditing(false)
    } catch (err) {
      console.error('이벤트 저장 실패:', err)
      alert('일정 저장에 실패했습니다.')
    }
  }

  const handleCancel = () => {
    // 폼 데이터를 원래 이벤트 데이터로 복원
    if (event) {
      setFormData({
        title: event.title,
        participant: event.participant,
        startDate: event.startDate,
        startTime: formatTimeShort(event.startDate),
        endTime: formatTimeShort(event.endDate),
        memo: event.memo || '',
        notification: event.notification || ''
      })
    }
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (window.confirm('정말 이 일정을 삭제하시겠습니까?')) {
      try {
        // TODO: 백엔드 API로 이벤트 삭제
        // await fetch(`/api/calendar/events/${eventId}`, { method: 'DELETE' })
        
        // 임시: localStorage에서 삭제
        const storedEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]')
        const filteredEvents = storedEvents.filter(e => e.id !== eventId)
        localStorage.setItem('calendarEvents', JSON.stringify(filteredEvents))
        
        navigate('/calendar')
      } catch (err) {
        console.error('이벤트 삭제 실패:', err)
        alert('일정 삭제에 실패했습니다.')
      }
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="event-detail-page">
        <div className="loading">일정을 불러오는 중...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="event-detail-page">
        <div className="error">일정을 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="event-detail-page">
      {/* 헤더 */}
      <div className="event-detail-header">
        <button className="back-button" onClick={handleBack}>
          <img src={imgIcon} alt="뒤로" className="back-icon" />
          <span>뒤로</span>
        </button>
        <h2 className="page-title">일정 상세</h2>
        {!isEditing ? (
          <button className="edit-button" onClick={handleEdit}>편집</button>
        ) : (
          <div className="edit-actions">
            <button className="cancel-button" onClick={handleCancel}>취소</button>
            <button className="save-button" onClick={handleSave}>저장</button>
          </div>
        )}
      </div>

      {/* 미팅 정보 섹션 */}
      <div className="meeting-info-section">
        <div className="section-header">
          <img src={imgImage9} alt="미팅 정보" className="section-icon" />
          <h3 className="section-title">미팅 정보</h3>
        </div>
        <div className="meeting-info-content">
          {isEditing ? (
            <div className="edit-form">
              <input
                type="text"
                className="edit-input title-input"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="일정 제목"
              />
              <input
                type="text"
                className="edit-input participant-input"
                value={formData.participant}
                onChange={(e) => handleInputChange('participant', e.target.value)}
                placeholder="참석자"
              />
              <div className="date-time-info">
                <p>{formatDateForDisplay(event.startDate)}</p>
                <p>{formatTimeForDisplay(event.startDate)} ~ {formatTimeForDisplay(event.endDate)}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="event-title-row">
                <h4 className="event-title">{event.title}</h4>
                <div className="participant-info">
                  <img src={imgImage9} alt="참석자" className="participant-icon" />
                  <span>{event.participant}</span>
                </div>
              </div>
              <p className="date-info">{formatDateForDisplay(event.startDate)}</p>
              <p className="time-info">{formatTimeForDisplay(event.startDate)} ~ {formatTimeForDisplay(event.endDate)}</p>
            </>
          )}
        </div>

        {/* 시간 타임라인 */}
        <div className="time-timeline">
          <div className="timeline-item">
            <div className="timeline-time">{formatTimeShort(event.startDate)}</div>
            <div className="timeline-bar" style={{ backgroundColor: event.color }}>
              <span className="timeline-label">{event.title}</span>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-time">{formatTimeShort(event.endDate)}</div>
            <div className="timeline-end"></div>
          </div>
        </div>
      </div>

      {/* 메모 섹션 */}
      <div className="memo-section">
        <div className="section-header">
          <img src={imgImage8} alt="메모" className="section-icon" />
          <h3 className="section-title">메모</h3>
        </div>
        {isEditing ? (
          <textarea
            className="memo-textarea"
            value={formData.memo}
            onChange={(e) => handleInputChange('memo', e.target.value)}
            placeholder="메모를 입력하세요"
          />
        ) : (
          <div className="memo-content">
            <p>{event.memo || '메모가 없습니다.'}</p>
          </div>
        )}
      </div>

      {/* 알림 섹션 */}
      <div className="notification-section">
        <div className="section-header">
          <img src={imgIcon1} alt="알림" className="section-icon" />
          <h3 className="section-title">알림</h3>
        </div>
        <div className="notification-content">
          <p>아직 알림이 오지 않았어요</p>
        </div>
      </div>

      {/* 삭제 버튼 */}
      <button className="delete-button" onClick={handleDelete}>
        이벤트 삭제
      </button>
    </div>
  )
}

export default EventDetailPage

