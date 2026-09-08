export function formatWon(amount) {
  return `${Number(amount).toLocaleString("ko-KR")}원`;
}

export function getAccountById(accounts, accountId) {
  return accounts.find((account) => account.id === accountId);
}

export function filterTransactions(transactions, accountId, type) {
  return transactions.filter((transaction) => {
    const matchesAccount = accountId === "all" || transaction.accountId === accountId;
    const matchesType = type === "all" || transaction.type === type;

    return matchesAccount && matchesType;
  });
}

export function groupTransactionsByDate(transactions) {
  return transactions.reduce((groups, transaction) => {
    const currentGroup = groups.get(transaction.date) ?? [];

    currentGroup.push(transaction);
    groups.set(transaction.date, currentGroup);

    return groups;
  }, new Map());
}

export function formatDayHeading(dateString) {
  const [, month, day] = dateString.split("-").map(Number);
  const today = new Date();
  const yesterday = new Date(today);

  yesterday.setDate(today.getDate() - 1);

  if (dateString === toLocalDateString(today)) {
    return `오늘 · ${month}월 ${day}일`;
  }

  if (dateString === toLocalDateString(yesterday)) {
    return `어제 · ${month}월 ${day}일`;
  }

  return `${month}월 ${day}일`;
}

// 최초 조회와 이체 후 재조회 모두 브라우저의 현재 연월을 기준으로 집계합니다.
// 기준일을 전달하면 월 경계와 연도 경계도 같은 함수로 검증할 수 있습니다.
export function calculateMonthlyOverview(transactions, now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const targetMonth = `${year}-${String(month).padStart(2, "0")}`;
  const monthlyTransactions = transactions.filter((transaction) => (
    transaction.date.slice(0, 7) === targetMonth
  ));

  return monthlyTransactions.reduce((overview, transaction) => {
    if (transaction.type === "in") {
      overview.totalIn += Number(transaction.amount);
    } else if (transaction.type === "out") {
      overview.totalOut += Number(transaction.amount);
    }

    return overview;
  }, {
    monthLabel: `${year}년 ${month}월`,
    totalIn: 0,
    totalOut: 0,
  });
}

function toLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
