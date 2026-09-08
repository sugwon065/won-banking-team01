export default function AccountTabs({ accounts = [], value, onChange }) {
  return (
    <label className="history-account-picker">
      <span className="sr-only">계좌 선택</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="all">전체 계좌</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>{account.nickname}</option>
        ))}
      </select>
    </label>
  );
}
