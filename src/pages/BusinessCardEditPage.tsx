import { useLocation, useNavigate } from "react-router-dom";
import BusinessCardEditForm from "../components/BusinessCardEditForm/BusinessCardEditForm";
import { BusinessCard, useCardStore } from "../store/cardStore";
import "./BusinessCardEditPage.css";

const BusinessCardEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const updateCard = useCardStore((state) => state.updateCard);
  
  // location.state에서 card 정보 가져오기
  const card = (location.state as { card?: BusinessCard } | undefined)?.card;

  const handleSubmit = (updatedCard: BusinessCard) => {
    if (!card?.id) {
      // card 정보가 없으면 명함 목록으로 이동
      navigate("/business-cards");
      return;
    }
    
    // 명함 정보 업데이트
    updateCard(card.id, updatedCard);
    navigate("/business-cards");
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="business-card-edit-page">
      <div className="business-card-edit-container">
        <button
          className="business-card-edit-back-button"
          onClick={handleBack}
          type="button"
          aria-label="뒤로가기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="business-card-edit-header">
          <h1 className="business-card-edit-title">명함 정보 수정</h1>
        </div>
        {card ? (
          <BusinessCardEditForm initialValues={card} onSubmit={handleSubmit} />
        ) : (
          <div className="business-card-edit-error">
            <p>명함 정보를 불러올 수 없습니다.</p>
            <button 
              className="business-card-edit-error-button"
              onClick={() => navigate("/business-cards")}
            >
              명함 목록으로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessCardEditPage;

