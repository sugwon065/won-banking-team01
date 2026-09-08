/* 3단계. 서버가 확인한 이체 결과를 표시합니다. */
export default function TransferDoneStep({ ownerName, amount, onGoHome }) {
  return (
    <div className="flow-panel transfer-done" style={{ display: "block" }}>
      <div className="success-symbol" aria-hidden="true">
        <svg className="icon" aria-hidden="true">
          <use href="#i-check" />
        </svg>
      </div>
      <h2>이체가 완료되었어요</h2>
      <p className="supporting">
        {ownerName ?? "-"}님에게
        <br />
        <strong>{amount.toLocaleString("ko-KR")}원</strong>을 보냈어요.
      </p>
      <button type="button" className="primary-button" onClick={onGoHome}>
        홈으로
      </button>
    </div>
  );
}