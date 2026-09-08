import Money from "../common/Money";

// 유형 필터 적용 전의 계좌별 월간 합계를 전달받습니다.
export default function MonthSummary({ totalIn = 0, totalOut = 0 }) {
  return (
    <div className="history-overview" aria-label="월간 계좌 합계">
      <div>
        <p>이번 달 입금</p>
        <strong className="in-total"><Money amount={totalIn} /></strong>
      </div>
      <div>
        <p>이번 달 출금</p>
        <strong><Money amount={totalOut} /></strong>
      </div>
    </div>
  );
}
