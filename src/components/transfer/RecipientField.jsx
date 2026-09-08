import Icon from "../common/Icon";

/* 받는 은행 선택 · 계좌번호 입력 · 예금주 실명조회 결과 */
export default function RecipientField({
  banks,
  bankName,
  accountNo,
  lookup,
  onBankChange,
  onAccountNoChange,
  onVerify,
}) {
  const loading = lookup.status === "loading";

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      onVerify();
    }
  }

  return (
    <div className="field">
      <label className="field-title" htmlFor="recipient-account">
        받는 계좌
      </label>
      <div className="recipient-card">
        <div className="recipient-bank">
          <select
            className="bank-select"
            id="recipient-bank"
            aria-label="받는 은행"
            value={bankName}
            onChange={(e) => onBankChange(e.target.value)}
          >
            {banks.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="account-row">
          <input
            className="account-input"
            id="recipient-account"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={14}
            placeholder="- 없이 숫자만 입력 (예: 123456789)"
            value={accountNo}
            onChange={(e) => onAccountNoChange(e.target.value.replace(/[^0-9]/g, ""))}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className="verify-button"
            onClick={onVerify}
            disabled={loading}
          >
            {loading ? "조회 중" : "확인"}
          </button>
        </div>

        {lookup.status === "loading" && (
          <div className="owner-result is-loading">조회 중…</div>
        )}
        {lookup.status === "ok" && (
          <div className="owner-result is-ok">
            <Icon name="check" />
            {lookup.ownerName}님
          </div>
        )}
        {lookup.status === "error" && (
          <div className="owner-result is-error">{lookup.message}</div>
        )}
      </div>
    </div>
  );
}