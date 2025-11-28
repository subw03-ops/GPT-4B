import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import './CalendarPage.css'

// 아이콘 이미지 URL (Figma에서 가져온 것)
const imgVector = "https://www.figma.com/api/mcp/asset/f78204f5-e4af-4098-aad1-c95f273ede9a"
const imgVector1 = "https://www.figma.com/api/mcp/asset/d85cf9c8-15a5-4098-8b7b-ba670c46ed3b"
const imgVector2 = "https://www.figma.com/api/mcp/asset/759902dd-30d7-4313-985b-bb699ba41ddd"
const imgVector3 = "https://www.figma.com/api/mcp/asset/a574bdfe-b9fc-4b8d-b860-187194cf586e"

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

// 구글 캘린더 색상 ID를 UI 색상으로 매핑
// 구글 캘린더 colorId: 1-11 (기본 색상), 여기서는 카테고리별 색상으로 매핑
const COLOR_MAP = {
  '미팅': '#ad46ff',
  '업무': '#2b7fff',
  '개인': '#00c950',
  '기타': '#9ca3af'
}

// 구글 캘린더 colorId를 카테고리로 변환 (기본값)
const getCategoryFromColorId = (colorId) => {
  // 구글 캘린더 colorId에 따라 카테고리 매핑
  // 실제로는 이벤트의 description이나 extendedProperties에서 카테고리를 가져올 수 있음
  const categoryMap = {
    '1': '미팅',   // 라벨 1
    '2': '업무',   // 라벨 2
    '3': '개인',   // 라벨 3
    '4': '기타',   // 라벨 4
  }
  return categoryMap[colorId] || '기타'
}

// ISO 8601 날짜 문자열을 Date 객체로 변환
const parseISODate = (dateString) => {
  if (!dateString) return null
  // dateTime 형식 (2021-09-19T10:00:00+09:00) 또는 date 형식 (2021-09-19)
  return new Date(dateString)
}

// Date 객체를 YYYY-MM-DD 형식으로 변환
const formatDateToISO = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Date 객체를 시간 문자열로 변환 (HH:MM)
const formatTime = (date) => {
  if (!date) return ''
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function CalendarPage() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState([]) // 구글 캘린더 이벤트 배열
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 구글 캘린더 API에서 이벤트를 가져오는 함수 (백엔드 연동 시 사용)
  // TODO: 백엔드 API 엔드포인트로 변경
  const fetchCalendarEvents = async (startDate, endDate) => {
    setLoading(true)
    setError(null)
    
    try {
      // 백엔드 API 호출 예시
      // const response = await fetch(`/api/calendar/events?start=${startDate.toISOString()}&end=${endDate.toISOString()}`)
      // const data = await response.json()
      // return data.events || []
      
      // 임시: 샘플 데이터 (구글 캘린더 형식)
      // 실제 백엔드 연동 시에는 이 부분을 API 호출로 대체
      const today = new Date()
      const todayStr = formatDateToISO(today)
      const todayISO = `${todayStr}T`
      
      const sampleEvents = [
        {
          id: 'event1',
          summary: 'A사 미팅',
          start: { dateTime: `${todayISO}10:00:00+09:00` },
          end: { dateTime: `${todayISO}11:00:00+09:00` },
          colorId: '1',
          description: '미팅',
          location: '',
          extendedProperties: {
            private: {
              participant: '지문호',
              memo: '첫 번째 미팅입니다. 모두 참석 부탁드립니다.'
            }
          }
        },
        {
          id: 'event2',
          summary: '프로젝트 마감',
          start: { dateTime: `${todayISO}15:00:00+09:00` },
          end: { dateTime: `${todayISO}16:00:00+09:00` },
          colorId: '2',
          description: '업무',
          location: '',
          extendedProperties: {
            private: {
              participant: '',
              memo: ''
            }
          }
        },
        {
          id: 'event3',
          summary: '점심 약속',
          start: { dateTime: `${todayISO}12:30:00+09:00` },
          end: { dateTime: `${todayISO}13:30:00+09:00` },
          colorId: '3',
          description: '개인',
          location: '',
          extendedProperties: {
            private: {
              participant: '',
              memo: ''
            }
          }
        }
      ]
      
      // 현재 월의 이벤트만 반환 (실제로는 API에서 startDate와 endDate로 필터링)
      return sampleEvents
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  // 구글 캘린더 이벤트를 UI 형식으로 변환
  const transformGoogleEvent = (googleEvent) => {
    const startDate = parseISODate(googleEvent.start?.dateTime || googleEvent.start?.date)
    const category = googleEvent.description || getCategoryFromColorId(googleEvent.colorId)
    const color = COLOR_MAP[category] || COLOR_MAP['기타']
    const extendedProps = googleEvent.extendedProperties?.private || {}
    
    return {
      id: googleEvent.id,
      title: googleEvent.summary || '제목 없음',
      time: formatTime(startDate),
      startDate: startDate,
      endDate: parseISODate(googleEvent.end?.dateTime || googleEvent.end?.date),
      category: category,
      color: color,
      description: googleEvent.description,
      location: googleEvent.location,
      participant: extendedProps.participant || '',
      memo: extendedProps.memo || '',
      // 원본 구글 캘린더 이벤트 데이터 보관 (필요시 사용)
      rawEvent: googleEvent
    }
  }

  // 이벤트를 날짜별로 그룹화
  const eventsByDate = useMemo(() => {
    const grouped = {}
    events.forEach(event => {
      const dateKey = formatDateToISO(event.startDate)
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })
    
    // 각 날짜의 이벤트를 시간순으로 정렬
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0
        return a.startDate.getTime() - b.startDate.getTime()
      })
    })
    
    return grouped
  }, [events])

  // 현재 월이 변경될 때 이벤트 로드
  useEffect(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)
    
    fetchCalendarEvents(startDate, endDate).then(googleEvents => {
      const transformedEvents = googleEvents.map(transformGoogleEvent)
      
      // localStorage에서 저장된 이벤트도 불러오기
      try {
        const storedEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]')
        const storedTransformed = storedEvents
          .filter(e => {
            const eventDate = new Date(e.startDate)
            return eventDate >= startDate && eventDate <= endDate
          })
          .map(e => ({
            id: e.id,
            title: e.title,
            time: formatTime(new Date(e.startDate)),
            startDate: new Date(e.startDate),
            endDate: new Date(e.endDate),
            category: e.category,
            color: e.color,
            description: e.category,
            location: '',
            participant: e.participant || '',
            memo: e.memo || ''
          }))
        
        setEvents([...transformedEvents, ...storedTransformed])
      } catch (err) {
        console.error('저장된 이벤트 로드 실패:', err)
        setEvents(transformedEvents)
      }
    })
  }, [currentDate])

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // 이전 달의 마지막 날들
    const prevMonth = new Date(year, month, 0)
    const prevMonthDays = prevMonth.getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ date: prevMonthDays - i, isCurrentMonth: false })
    }
    
    // 현재 달의 날들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: i, isCurrentMonth: true })
    }
    
    // 다음 달의 첫 날들 (캘린더를 채우기 위해)
    const remainingDays = 42 - days.length // 6주 * 7일
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: i, isCurrentMonth: false })
    }
    
    return days
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDateClick = (day) => {
    if (day.isCurrentMonth) {
      setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date))
    }
  }

  const isSelectedDate = (day) => {
    if (!day.isCurrentMonth) return false
    return selectedDate.getDate() === day.date &&
           selectedDate.getMonth() === currentDate.getMonth() &&
           selectedDate.getFullYear() === currentDate.getFullYear()
  }

  const getEventsForDate = (date) => {
    const dateStr = formatDateToISO(date)
    return eventsByDate[dateStr] || []
  }

  const formatDateForDisplay = (date) => {
    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  // 일정 추가 핸들러
  const handleAddSchedule = () => {
    navigate('/calendar/add')
  }

  const days = getDaysInMonth(currentDate)
  const currentEvents = getEventsForDate(selectedDate)

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <button className="add-schedule-btn" onClick={handleAddSchedule}>
          <div className="add-schedule-icon">
            <div className="icon-vector">
              <img src={imgVector2} alt="" className="icon-img" />
            </div>
            <div className="icon-vector">
              <img src={imgVector3} alt="" className="icon-img" />
            </div>
          </div>
          <span className="add-schedule-text">일정 추가</span>
        </button>
      </div>

      <div className="calendar-component">
        <div className="calendar-header-nav">
          <button className="nav-arrow" onClick={handlePrevMonth}>
            <div className="arrow-icon">
              <img src={imgVector1} alt="이전" className="arrow-img" />
            </div>
          </button>
          <p className="calendar-month">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </p>
          <button className="nav-arrow" onClick={handleNextMonth}>
            <div className="arrow-icon arrow-right">
              <img src={imgVector} alt="다음" className="arrow-img" />
            </div>
          </button>
        </div>

        <div className="calendar-days-header">
          {DAYS.map((day, index) => (
            <div key={index} className="day-header">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-days-grid">
          {days.map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${!day.isCurrentMonth ? 'inactive' : ''} ${isSelectedDate(day) ? 'active' : ''}`}
              onClick={() => handleDateClick(day)}
            >
              <span className="day-number">{day.date}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="events-section">
        <div className="events-header">
          <h3 className="events-title">{formatDateForDisplay(selectedDate)} 일정</h3>
        </div>
        <div className="events-list">
          {loading ? (
            <div className="no-events">일정을 불러오는 중...</div>
          ) : error ? (
            <div className="no-events error">일정을 불러오는 중 오류가 발생했습니다: {error}</div>
          ) : currentEvents.length > 0 ? (
            currentEvents.map((event) => (
              <div 
                key={event.id} 
                className="event-item"
                onClick={() => navigate(`/calendar/event/${event.id}`)}
              >
                <div className="event-content">
                  <div className="event-time">{event.time}</div>
                  <div className="event-color-bar" style={{ backgroundColor: event.color }}></div>
                  <div className="event-details">
                    <div className="event-title">{event.title}</div>
                    <div className="event-badge" style={{ backgroundColor: event.color }}>
                      {event.category}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-events">등록된 일정이 없습니다.</div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}

export default CalendarPage

