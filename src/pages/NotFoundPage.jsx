import { useNavigate } from 'react-router-dom'
import './NotFoundPage.css'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="not-found-page">
      <div className="not-found-header">
        <button 
          className="not-found-back-button"
          onClick={() => navigate(-1)}
        >
          &lt;
        </button>
      </div>
      <div className="not-found-container">
        <div className="not-found-logo-section">
          <img 
            src="/assets/gpt_4b_logo_blueberry.png" 
            alt="GPT-4b Logo" 
            className="not-found-logo" 
          />
        </div>
        <p className="not-found-message">아직 개발중입니다</p>
      </div>
    </div>
  )
}

export default NotFoundPage

