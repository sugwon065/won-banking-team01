const QUICK = [
  { label: "+1만", value: 10000 },
  { label: "+5만", value: 50000 },
  { label: "+10만", value: 100000 },
];

/* 금액 입력. 빠른 금액 버튼은 현재 값에 더합니다(덮어쓰지 않습니다). */
export default function AmountField({
  amount,
  maxAmount,
  error,
  onChange,
  onAdd,
}) {
  function handleInput(e) {
    const digits = e.target.value.replace(/[^0-9]/g, "");
    onChange(digits ? Number.parseInt(digits, 10) : 0);
  }

  function handleManual() {
    const input = document.getElementById("amount-input");
    if (input) {
      input.focus();
      input.select();
    }
  }

  return (
    <div className="field">
      <label className="field-title" id="amount-title" htmlFor="amount-input">
        보낼 금액
      </label>

      <div className={error ? "amount-surface is-error" : "amount-surface"}>
        <div className="amount-display">
          <input
            className="amount-input"
            id="amount-input"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={amount ? amount.toLocaleString("ko-KR") : "0"}
            onChange={handleInput}
          />
          <small>원</small>
        </div>
        <div className="amount-caption">
          출금 가능 금액: {maxAmount.toLocaleString("ko-KR")}원
        </div>
      </div>

      <div className="amount-options" role="group" aria-labelledby="amount-title">
        {QUICK.map((q) => (
          <button key={q.value} type="button" onClick={() => onAdd(q.value)}>
            {q.label}
          </button>
        ))}
        <button type="button" onClick={handleManual}>
          직접입력
        </button>
      </div>

      {error && <p className="field-error">{error}</p>}
    </div>
  );
}