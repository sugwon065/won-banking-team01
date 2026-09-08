import AccountCard from "../common/AccountCard";
import Icon from "../common/Icon";

export default function AccountSection({ accounts, onNavigate }) {
  return (
    <div className="section">
      <div className="section-heading">
        <h2>내 계좌</h2>
        <button
          type="button"
          className="text-link common-icon-action"
          disabled={!onNavigate}
          onClick={() => onNavigate?.("menu")}
        >
          전체보기
          <Icon name="chevron" />
        </button>
      </div>
      <div className="account-list">
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} compact />
        ))}
      </div>
    </div>
  );
}
