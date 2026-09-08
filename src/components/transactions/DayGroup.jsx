import TransactionRow from "../common/TransactionRow";
import TransactionDetailContent from "../common/TransactionDetailContent";
import { formatDayHeading, getAccountById } from "../../utils/transactions";

export default function DayGroup({
  date, transactions = [], accounts = [], openTxId, onToggle,
}) {
  return (
    <section className="day-group" aria-label={date}>
      <h2 className="day-heading">{formatDayHeading(date)}</h2>
      <div className="day-transactions">
        {transactions.map((transaction) => (
          <details key={transaction.id}
            className={`transaction-detail ${transaction.type === "in" ? "in-record" : "out-record"}`}
            open={openTxId === transaction.id}
            onToggle={(event) => onToggle(transaction.id, event.currentTarget.open)}>
            <summary className="transaction">
              <TransactionRow transaction={transaction} contentOnly showBalance showDate={false} />
            </summary>
            <TransactionDetailContent transaction={transaction}
              account={getAccountById(accounts, transaction.accountId)} />
          </details>
        ))}
      </div>
    </section>
  );
}
