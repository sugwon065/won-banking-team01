import BankIcon from "./BankIcon";
import Money from "./Money";

export default function AccountCard({
  account, hidden = false, compact = false, onTransfer,
}) {
  if (!account) return null;
  const isSavings = String(account.type ?? "").includes("적금");
  const info = <>
    <BankIcon account={account} />
    <div className="account-info">
      <h3>{account.nickname ?? "계좌"}</h3>
      <p>{[account.accountNo, account.type].filter(Boolean).join(" ")}</p>
    </div>
  </>;

  return (
    <article className={`account-card${compact ? " compact" : ""}`} data-account-id={account.id}>
      {compact ? <>
        {info}
        <Money amount={account.balance} hidden={hidden} className="account-balance" smallUnit />
      </> : <>
        <div className="account-title">{info}</div>
        <div className="account-bottom">
          <Money amount={account.balance} hidden={hidden} className="account-balance" smallUnit />
          {!isSavings && onTransfer && (
            <button type="button" className="small-button"
              aria-label={`${account.nickname ?? "계좌"}에서 이체`}
              onClick={() => onTransfer(account)}>이체</button>
          )}
        </div>
      </>}
    </article>
  );
}
