import { formatWon } from "../utils/transactions";

export default function TransactionDetailContent({ transaction, account }) {
  const statusText = transaction.status === "done" ? "거래 완료" : "처리 중";

  return (
    <div className="transaction-more">
      <dl>
        <div className="detail-line">
          <dt>거래 계좌</dt>
          <dd>{account?.nickname ?? transaction.accountId}</dd>
        </div>
        <div className="detail-line">
          <dt>계좌번호</dt>
          <dd>{account?.accountNo ?? "-"}</dd>
        </div>
        <div className="detail-line">
          <dt>거래일시</dt>
          <dd>{transaction.date} {transaction.time}</dd>
        </div>
        <div className="detail-line">
          <dt>거래 후 잔액</dt>
          <dd>{formatWon(transaction.balanceAfter)}</dd>
        </div>
        <div className="detail-line">
          <dt>상태</dt>
          <dd className={transaction.status === "done" ? "status-done" : ""}>{statusText}</dd>
        </div>
      </dl>
    </div>
  );
}
