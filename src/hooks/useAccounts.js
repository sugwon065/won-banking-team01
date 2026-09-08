import { useCallback, useEffect, useState } from "react";
import { getAccounts } from "../api/banking";

export default function useAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetchAccounts = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const data = await getAccounts(controller.signal);
        if (!controller.signal.aborted) {
          setAccounts(Array.isArray(data) ? data : []);
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

  return { accounts, isLoading, error, refetchAccounts };
}
