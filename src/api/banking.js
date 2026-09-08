const API_BASE_URL = "http://localhost:4000";

async function request(path, signal) {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export function getAccounts(signal) {
  return request("/api/accounts", signal);
}

export function getTransactions(signal) {
  return request("/api/transactions", signal);
}
