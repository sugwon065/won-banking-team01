import { useState } from "react";
import AccountTabs from "./AccountTabs";
import MonthSummary from "./MonthSummary";
import TypeFilter from "./TypeFilter";
import DayGroup from "./DayGroup";
import Spinner from "../common/Spinner";
import ErrorView from "../common/ErrorView";
import EmptyView from "../common/EmptyView";
import {
  calculateMonthlyOverview, filterTransactions,
  getAccountById, groupTransactionsByDate,
} from "../../utils/transactions";

export default function TransactionsScreen({
  accounts = [], transactions = [], isLoading = false, error = null, onRetry,
}) {
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

  function handleToggle(transactionId, isOpen) {
    // 다른 거래를 열면서 발생한 이전 거래의 닫힘 이벤트는 새 선택을 지우지 않습니다.
    setOpenTxId((current) => isOpen ? transactionId : current === transactionId ? null : current);
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
        <MonthSummary totalIn={overview.totalIn} totalOut={overview.totalOut} />
        <TypeFilter value={typeFilter} onChange={handleTypeChange} />
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
        <DayGroup key={date} date={date} transactions={dailyTransactions}
          accounts={accounts} openTxId={openTxId} onToggle={handleToggle} />
      ))}
      <p className="history-hint">거래 항목을 누르면 상세 정보를 볼 수 있어요.</p>
    </section>
  );
}
