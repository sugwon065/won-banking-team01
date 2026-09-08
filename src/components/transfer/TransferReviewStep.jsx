/* 2단계. 최종 확인 후 이체 실행.
   서버가 400 · 404 를 주면 그 메시지를 버튼 아래에 그대로 표시합니다. */
export default function TransferReviewStep({
  bankName,
  accountNo,
  ownerName,
  fromAccountName,
  amount,
  submit,
  onSubmit,
  onBack,
}) {
  const loading = submit.status === "loading";

  return (
    <div className="flow-panel transfer-review" style={{ display: "block" }}>
      <div className="review-recipient">
        <span className="recipient-avatar" aria-hidden="true">
          {ownerName ? ownerName.charAt(0) : "?"}
        </span>
        <h2>
          {ownerName ?? "-"}님에게
          <br />
          <strong>{amount.toLocaleString("ko-KR")}원</strong>을 보낼까요?
        </h2>
        <p>
          {bankName} · {accountNo}
        </p>
      </div>

      <div className="detail-card">
        <dl>
          <div className="detail-line">
            <dt>받는 분</dt>
            <dd>{bankName}</dd>
          </div>
          <div className="detail-line">
            <dt>계좌 번호</dt>
            <dd>{accountNo}</dd>
          </div>
          <div className="detail-line">
            <dt>예금주</dt>
            <dd>{ownerName ?? "-"}</dd>
          </div>
          <div className="detail-line">
            <dt>출금 계좌</dt>
            <dd>{fromAccountName}</dd>
          </div>
          <div className="detail-line total">
            <dt>이체 금액</dt>
            <dd>{amount.toLocaleString("ko-KR")}원</dd>
          </div>
        </dl>
      </div>

      <button
        type="button"
        className="primary-button"
        disabled={loading}
        onClick={onSubmit}
      >
        {loading ? "이체 중…" : "이체하기"}
      </button>
      <button type="button" className="secondary-button" onClick={onBack}>
        이전으로
      </button>

      {submit.status === "error" && (
        <p className="flow-footnote is-error">{submit.message}</p>
      )}
    </div>
  );
}