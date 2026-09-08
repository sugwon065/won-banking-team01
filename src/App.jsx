import { useEffect, useState } from "react";
import { getAccounts, getTransactions } from "./api/banking";
import TransactionsScreen from "./screens/TransactionsScreen";
import AppHeader from "./components/common/AppHeader";
import BottomNav from "./components/common/BottomNav";
import EmptyView from "./components/common/EmptyView";
import PhoneFrame from "./components/common/PhoneFrame";

export default function App() {
  const [activeView, setActiveView] = useState("history");
  const [reloadKey, setReloadKey] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBankingData() {
      try {
        const [loadedAccounts, loadedTransactions] = await Promise.all([
          getAccounts(controller.signal),
          getTransactions(controller.signal),
        ]);

        if (controller.signal.aborted) return;
        setAccounts(Array.isArray(loadedAccounts) ? loadedAccounts : []);
        setTransactions(Array.isArray(loadedTransactions) ? loadedTransactions : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to load banking data:", error);
          setLoadError(error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadBankingData();
    function handleTransferCompleted() {
      setIsLoading(true);
      setLoadError(null);
      setReloadKey((key) => key + 1);
    }
    document.addEventListener("transfer:completed", handleTransferCompleted);

    return () => {
      document.removeEventListener("transfer:completed", handleTransferCompleted);
      controller.abort();
    };
  }, [reloadKey]);

  function retryLoading() {
    setIsLoading(true);
    setLoadError(null);
    setReloadKey((key) => key + 1);
  }

  return (
    <PhoneFrame>
    <div className="transactions-app">
      <AppHeader onNavigate={setActiveView} />
      <main className="app-content" key={activeView}>
      {activeView === "history" && (
        <TransactionsScreen
          accounts={accounts}
          transactions={transactions}
          isLoading={isLoading}
          error={loadError}
          onRetry={retryLoading}
        />
      )}
      {activeView !== "history" && (
        <section aria-labelledby="pending-screen-title">
          <div className="page-intro">
            <h1 id="pending-screen-title">
              {{ home: "홈", transfer: "이체", menu: "전체 메뉴" }[activeView]}
            </h1>
          </div>
          <EmptyView message="이 화면은 준비 중입니다." />
        </section>
      )}
      </main>
      <BottomNav activePage={activeView} onNavigate={setActiveView} />
    </div>
    </PhoneFrame>
  );
}
