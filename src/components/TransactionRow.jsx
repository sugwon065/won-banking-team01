import { formatWon } from "../utils/transactions";

export default function TransactionRow({ transaction }) {
  const isIncome = transaction.type === "in";
  const amountClassName = isIncome
    ? "transaction-amount income"
    : "transaction-amount";

  return (
    <>
      <span className={`transaction-icon ${isIncome ? "green" : "blue"}`} aria-hidden="true">
        {isIncome ? "+" : "-"}
      </span>
      <span className="transaction-info">
        <strong>{transaction.desc}</strong>
        <small>{transaction.time} · {isIncome ? "입금" : "출금"}</small>
      </span>
      <span className={amountClassName}>
        {isIncome ? "+" : "-"}{formatWon(transaction.amount)}
        <small>{formatWon(transaction.balanceAfter)}</small>
      </span>
    </>
  );
}
