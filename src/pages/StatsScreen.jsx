import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../utils/api'
import './StatsScreen.css'

function StatsScreen() {
  const navigate = useNavigate()
  const [totalUsers, setTotalUsers] = useState(0)
  const [companyStats, setCompanyStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await authAPI.getStats()
        if (response.data.success) {
          setTotalUsers(response.data.data.totalUsers)
          setCompanyStats(response.data.data.companyStats || [])
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        // 기본값 설정
        setTotalUsers(1234)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  useEffect(() => {
    // 3초 후 로그인 화면으로 이동
    const timer = setTimeout(() => {
      navigate('/login')
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate])

  // 숫자를 천단위 콤마로 포맷팅
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  return (
    <div className="stats-screen">
      <div className="stats-content">
        <div className="stats-logo">
          <img src="/assets/gpt_4b_logo_white.png" alt="GPT-4b Logo" className="logo" />
        </div>
        <div className="stats-list">
          <div className="stats-item stats-item-main">
            <p className="stats-description">
              현재 <span className="stats-value">{loading ? '...' : `${formatNumber(totalUsers)}명`}</span>이 GPT-4b와 함께하고 있어요
            </p>
          </div>
          {companyStats.slice(0, 3).map((stat, index) => (
            <div key={index} className="stats-item">
              <p className="stats-description">
                {stat.company}에서 <span className="stats-value">{formatNumber(stat.count)}명</span>이 사용중이에요
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StatsScreen
