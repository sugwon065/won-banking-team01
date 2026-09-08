import { useState } from "react";
import TransactionRow from "../common/TransactionRow";
import TransactionDetailContent from "../common/TransactionDetailContent";
import EmptyView from "../common/EmptyView";
import { getAccountById } from "../../utils/transactions";

export default function RecentTransactionSection({ accounts, transactions }) {
  const [openTxId, setOpenTxId] = useState(null);
  const recentTransactions = transactions.slice(0, 3);

  return (
    <section className="section" aria-labelledby="recent-title">
      <div className="section-heading">
        <h2 id="recent-title">최근 거래</h2>
      </div>

      {recentTransactions.length === 0 ? (
        <EmptyView message="최근 거래 내역이 없습니다." />
      ) : (
        <div className="transaction-list">
          {recentTransactions.map((transaction) => {
            const account = getAccountById(accounts, transaction.accountId);
            const isOpen = openTxId === transaction.id;

            return (
              <details
                className={`transaction-detail ${transaction.type === "in" ? "in-record" : "out-record"}`}
                key={transaction.id}
                open={isOpen}
                onToggle={(event) => {
                  const nowOpen = event.currentTarget.open;
                  setOpenTxId((current) =>
                    nowOpen ? transaction.id : current === transaction.id ? null : current
                  );
                }}
              >
                <summary className="transaction">
                  <TransactionRow transaction={transaction} contentOnly showBalance={false} />
                </summary>
                <TransactionDetailContent transaction={transaction} account={account} />
              </details>
            );
          })}
        </div>
      )}
    </section>
  );
}