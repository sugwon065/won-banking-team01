import { useEffect, useState } from "react";
import { getAccounts, getTransactions } from "./api/banking";
import TransactionsScreen from "./screens/TransactionsScreen";

export default function App() {
  const [activeView] = useState("history");
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
    document.addEventListener("transfer:completed", loadBankingData);

    return () => {
      document.removeEventListener("transfer:completed", loadBankingData);
      controller.abort();
    };
  }, []);

  return (
    <main className="transactions-app">
      {activeView === "history" && (
        <TransactionsScreen
          accounts={accounts}
          transactions={transactions}
          isLoading={isLoading}
          error={loadError}
        />
      )}
    </main>
  );
}
