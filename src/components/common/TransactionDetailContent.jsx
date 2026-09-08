import Money from "./Money";

export default function TransactionDetailContent({ transaction, account, hidden = false }) {
  if (!transaction) return null;
  const status = transaction.status === "done" ? "거래 완료" :
    transaction.status === "failed" ? "거래 실패" : "처리 중";

  return (
    <div className="transaction-more">
      <dl>
        <div className="detail-line"><dt>거래 계좌</dt>
          <dd>{account?.nickname ?? transaction.accountId ?? "—"}</dd></div>
        <div className="detail-line"><dt>계좌번호</dt><dd>{account?.accountNo ?? "—"}</dd></div>
        <div className="detail-line"><dt>거래일시</dt>
          <dd>{[transaction.date, transaction.time].filter(Boolean).join(" ") || "—"}</dd></div>
        <div className="detail-line"><dt>거래금액</dt>
          <dd><Money amount={transaction.amount} type={transaction.type} hidden={hidden} /></dd></div>
        <div className="detail-line"><dt>거래 후 잔액</dt>
          <dd><Money amount={transaction.balanceAfter} hidden={hidden} /></dd></div>
        <div className="detail-line"><dt>상태</dt>
          <dd className={transaction.status === "done" ? "status-done" : undefined}>{status}</dd></div>
      </dl>
    </div>
  );
}
