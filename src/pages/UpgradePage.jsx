import { useNavigate } from 'react-router-dom'
import './UpgradePage.css'

const gPlusLogo = "/assets/g-plus-logo.png"

function UpgradePage() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="upgrade-page">
      <div className="upgrade-container">
        {/* Back Button */}
        <button className="upgrade-back-button" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Logo Section */}
        <div className="upgrade-logo-section">
          <div className="upgrade-logo">
            <img src={gPlusLogo} alt="GPT-4b+" className="upgrade-logo-image" />
          </div>
        </div>

        {/* Message Section */}
        <div className="upgrade-message-section">
          <p className="upgrade-message">
            더 나은 GPT-4b를 위해 개발중이에요.
          </p>
          <p className="upgrade-message">
            곧 만나요!
          </p>
        </div>
      </div>
    </div>
  )
}

export default UpgradePage
