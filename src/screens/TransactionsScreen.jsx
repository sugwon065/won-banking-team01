import { useState } from "react";
import AccountTabs from "../components/AccountTabs";
import TransactionDetailContent from "../components/common/TransactionDetailContent";
import TransactionRow from "../components/common/TransactionRow";
import Spinner from "../components/common/Spinner";
import ErrorView from "../components/common/ErrorView";
import EmptyView from "../components/common/EmptyView";
import Money from "../components/common/Money";
import {
  calculateMonthlyOverview,
  filterTransactions,
  formatDayHeading,
  getAccountById,
  groupTransactionsByDate,
} from "../utils/transactions";

export default function TransactionsScreen({ accounts, transactions, isLoading, error, onRetry }) {
  const [selectedAccountId, setSelectedAccountId] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [openTxId, setOpenTxId] = useState(null);

  const accountTransactions = filterTransactions(transactions, selectedAccountId, "all");
  const visibleTransactions = filterTransactions(transactions, selectedAccountId, typeFilter);
  const overview = calculateMonthlyOverview(accountTransactions);
  const groupedTransactions = groupTransactionsByDate(visibleTransactions);
  const selectedAccount = getAccountById(accounts, selectedAccountId);
  const summary = selectedAccount ? `${selectedAccount.nickname} · 최신순` : "전체 계좌 · 최신순";

  function handleAccountChange(accountId) {
    setSelectedAccountId(accountId);
    setOpenTxId(null);
  }

  function handleTypeChange(type) {
    setTypeFilter(type);
    setOpenTxId(null);
  }

  return (
    <section className="screen history-screen" aria-labelledby="history-title">
      <div className="history-top">
        <div className="page-intro history-intro">
          <div>
            <div className="eyebrow">TRANSACTIONS</div>
            <h1 id="history-title">거래내역</h1>
            <p>내 계좌의 입출금 내역을 한눈에.</p>
          </div>
          <AccountTabs accounts={accounts} value={selectedAccountId} onChange={handleAccountChange} />
        </div>
        <div className="history-overview" aria-label="월간 계좌 합계">
          <div>
            <p>이번 달 입금</p>
            <strong className="in-total"><Money amount={overview.totalIn} /></strong>
          </div>
          <div>
            <p>이번 달 출금</p>
            <strong><Money amount={overview.totalOut} /></strong>
          </div>
        </div>
        <div className="history-filter" role="group" aria-label="거래 유형">
          {["all", "in", "out"].map((type) => (
            <label key={type}>
              <input
                className="sr-only"
                type="radio"
                name="history-type"
                value={type}
                checked={typeFilter === type}
                onChange={(event) => handleTypeChange(event.target.value)}
              />
              {{ all: "전체", in: "입금", out: "출금" }[type]}
            </label>
          ))}
        </div>
      </div>

      <div className="history-month">
        <strong>{overview.monthLabel}</strong>
        <span>{summary}</span>
      </div>

      {isLoading && <Spinner message="거래내역을 불러오는 중입니다." />}
      {!isLoading && error && <ErrorView message="거래내역을 불러오지 못했습니다." onRetry={onRetry} />}
      {!isLoading && !error && visibleTransactions.length === 0 && (
        <EmptyView message="조건에 맞는 거래내역이 없습니다." />
      )}
      {!isLoading && !error && Array.from(groupedTransactions.entries()).map(([date, dailyTransactions]) => (
        <section className="day-group" aria-label={date} key={date}>
          <h2 className="day-heading">{formatDayHeading(date)}</h2>
          <div className="day-transactions">
            {dailyTransactions.map((transaction) => {
              const account = getAccountById(accounts, transaction.accountId);
              const isOpen = openTxId === transaction.id;

              return (
                <details
                  className={`transaction-detail ${transaction.type === "in" ? "in-record" : "out-record"}`}
                  key={transaction.id}
                  open={isOpen}
                  onToggle={(event) => {
                    const isOpen = event.currentTarget.open;
                    setOpenTxId((current) => isOpen ? transaction.id : current === transaction.id ? null : current);
                  }}
                >
                  <summary className="transaction">
                    <TransactionRow transaction={transaction} contentOnly showBalance showDate={false} />
                  </summary>
                  <TransactionDetailContent transaction={transaction} account={account} />
                </details>
              );
            })}
          </div>
        </section>
      ))}
      <p className="history-hint">거래 항목을 누르면 상세 정보를 볼 수 있어요.</p>
    </section>
  );
}
