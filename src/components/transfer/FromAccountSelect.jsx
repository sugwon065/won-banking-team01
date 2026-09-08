/* 출금 계좌 선택. select 형태라 AccountCard 를 재사용하지 않습니다. */
export default function FromAccountSelect({
  accounts,
  value,
  maxAmount,
  onChange,
}) {
  const empty = accounts.length === 0;

  return (
    <div className="field">
      <label className="field-title" htmlFor="from-account">
        출금 계좌
      </label>
      <div className="withdraw-account">
        <span className="bank-icon" aria-hidden="true">
          W
        </span>
        <div className="account-info">
          <select
            className="account-select"
            id="from-account"
            value={value}
            disabled={empty}
            onChange={(e) => onChange(e.target.value)}
          >
            {empty ? (
              <option value="">계좌를 불러오는 중…</option>
            ) : (
              accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nickname} · {a.accountNo}
                </option>
              ))
            )}
          </select>
          <p>
            {empty
              ? "출금 가능 …"
              : `출금 가능 ${maxAmount.toLocaleString("ko-KR")}원`}
          </p>
        </div>
        <svg className="icon" aria-hidden="true">
          <use href="#i-wallet" />
        </svg>
      </div>
    </div>
  );
}