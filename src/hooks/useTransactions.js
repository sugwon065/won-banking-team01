import { useCallback, useEffect, useState } from "react";
import { getTransactions } from "../api/banking";

export default function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetchTransactions = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const data = await getTransactions(controller.signal);
        if (!controller.signal.aborted) {
          setTransactions(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    load();
    // 재조회 또는 언마운트 시 이전 요청의 결과가 상태를 덮어쓰지 않게 합니다.
    return () => controller.abort();
  }, [reloadKey]);

  return { transactions, isLoading, error, refetchTransactions };
}
