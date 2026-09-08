export default function MenuNotice({
  title = "입출금 내역을 확인해 보세요.",
  message = "계좌별 입출금 내역과 거래별 상세 정보를 한곳에서 확인할 수 있어요.",
}) {
  return (
    <div className="menu-notice">
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}
