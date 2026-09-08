import { useEffect, useState } from "react";
import useAccounts from "./hooks/useAccounts";
import useTransactions from "./hooks/useTransactions";
import TransactionsScreen from "./components/transactions/TransactionsScreen";
import AppHeader from "./components/common/AppHeader";
import BottomNav from "./components/common/BottomNav";
import EmptyView from "./components/common/EmptyView";
import PhoneFrame from "./components/common/PhoneFrame";
import HomeScreen from "./components/home/HomeScreen";
import MenuScreen from "./components/menu/MenuScreen";
import TransferScreen from "./components/transfer/TransferScreen";

export default function App() {
  const [activeView, setActiveView] = useState("home");
  const [transferAccountId, setTransferAccountId] = useState("");
  const {
    accounts, isLoading: accountsLoading, error: accountsError, refetchAccounts,
  } = useAccounts();
  const {
    transactions, isLoading: transactionsLoading, error: transactionsError, refetchTransactions,
  } = useTransactions();

  useEffect(() => {
    function handleTransferCompleted() {
      refetchAccounts();
      refetchTransactions();
    }
    document.addEventListener("transfer:completed", handleTransferCompleted);

    return () => {
      document.removeEventListener("transfer:completed", handleTransferCompleted);
    };
  }, [refetchAccounts, refetchTransactions]);

  function retryLoading() {
    refetchAccounts();
    refetchTransactions();
  }

  function navigate(page) {
    setTransferAccountId("");
    setActiveView(page);
  }

  function transferFromAccount(account) {
    setTransferAccountId(account.id);
    setActiveView("transfer");
  }

  return (
    <PhoneFrame>
    <div className="transactions-app">
      <AppHeader onNavigate={navigate} />
      <main className="app-content" key={activeView}>
      {activeView === "history" && (
        <TransactionsScreen
          accounts={accounts}
          transactions={transactions}
          isLoading={accountsLoading || transactionsLoading}
          error={accountsError || transactionsError}
          onRetry={retryLoading}
        />
      )}
      {activeView === "home" && (
        <HomeScreen
          accounts={accounts}
          transactions={transactions}
          onNavigate={navigate}
          onTransfer={transferFromAccount}
        />
      )}
      {activeView === "menu" && (
        <MenuScreen
          accounts={accounts}
          isLoading={accountsLoading || transactionsLoading}
          error={accountsError || transactionsError}
          onRetry={retryLoading}
          onNavigate={navigate}
        />
      )}
      {activeView === "transfer" && (
        <TransferScreen
          accounts={accounts}
          initialFromAccountId={transferAccountId}
          onTransferComplete={retryLoading}
          onNavigate={navigate}
        />
      )}
      {activeView !== "history" && activeView !== "home" && activeView !== "menu" && activeView !== "transfer" && (
        <section aria-labelledby="pending-screen-title">
          <div className="page-intro">
            <h1 id="pending-screen-title">준비 중</h1>
          </div>
          <EmptyView message="이 화면은 준비 중입니다." />
        </section>
      )}
      </main>
      <BottomNav activePage={activeView} onNavigate={navigate} />
    </div>
    </PhoneFrame>
  );
}
