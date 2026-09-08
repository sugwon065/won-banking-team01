import Icon from "./Icon";
import Money from "./Money";

// 홈에서는 onClick으로 상세 모달을 열고, summary 안에서는 contentOnly를 사용합니다.
export default function TransactionRow({
  transaction, hidden = false, showBalance = false, showDate = true,
  onClick, contentOnly = false,
}) {
  if (!transaction) return null;
  const isIncome = transaction.type === "in";
  const date = transaction.date?.slice(5).replace("-", ".");
  const when = showDate ? date : transaction.time;
  const content = <>
    <span className={`transaction-icon ${isIncome ? "green" : "blue"}`} aria-hidden="true">
      <Icon name={isIncome ? "arrow-in" : "arrow-out"} />
    </span>
    <span className="transaction-info">
      <strong>{transaction.desc ?? "거래내역"}</strong>
      <small>{[when, isIncome ? "입금" : "출금"].filter(Boolean).join(" · ")}</small>
    </span>
    <span className={`transaction-amount${isIncome ? " income" : ""}`}>
      <Money amount={transaction.amount} type={transaction.type} hidden={hidden} />
      {showBalance && <small><Money amount={transaction.balanceAfter} hidden={hidden} /></small>}
    </span>
  </>;

  if (contentOnly) return content;
  return onClick ? (
    <button type="button" className="transaction" onClick={() => onClick(transaction)}>
      {content}
    </button>
  ) : <div className="transaction">{content}</div>;
}
