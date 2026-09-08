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

export function calculateMonthlyOverview(transactions) {
  if (transactions.length === 0) {
    return { monthLabel: "거래내역", totalIn: 0, totalOut: 0 };
  }

  const latestDate = transactions[0].date;
  const targetMonth = latestDate.slice(0, 7);
  const [year, month] = targetMonth.split("-");
  const monthlyTransactions = transactions.filter((transaction) => (
    transaction.date.startsWith(targetMonth)
  ));

  return monthlyTransactions.reduce((overview, transaction) => {
    if (transaction.type === "in") {
      overview.totalIn += Number(transaction.amount);
    } else if (transaction.type === "out") {
      overview.totalOut += Number(transaction.amount);
    }

    return overview;
  }, {
    monthLabel: `${year}년 ${Number(month)}월`,
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
