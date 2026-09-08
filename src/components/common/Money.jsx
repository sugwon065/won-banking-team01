import { formatWon } from "../../utils/transactions";

// 숨긴 금액은 DOM에도 출력하지 않습니다. CSS 체크박스 상태에 의존하지 않습니다.
export default function Money({
  amount, type, hidden = false, className = "", smallUnit = false,
}) {
  const value = amount === null || amount === undefined || amount === "" ? NaN : Number(amount);
  const sign = type === "in" ? "+" : type === "out" ? "−" : "";
  const formatted = Number.isFinite(value)
    ? formatWon(type ? Math.abs(value) : value)
    : "—";

  return (
    <span className={className || undefined}>
      {hidden ? "금액 숨김" : <>
        {Number.isFinite(value) && sign}
        {smallUnit && Number.isFinite(value)
          ? <>{formatted.slice(0, -1)}<small>원</small></>
          : formatted}
      </>}
    </span>
  );
}
