import MenuProfile from "./MenuProfile";
import MenuLinkList from "./MenuLinkList";
import MenuNotice from "./MenuNotice";
import AccountCard from "../common/AccountCard";
import Spinner from "../common/Spinner";
import ErrorView from "../common/ErrorView";
import EmptyView from "../common/EmptyView";
import "./menu.css";

// 계좌는 App에서 조회한 데이터를 사용합니다. 이름 기본값은 기존 목업의 예시입니다.
export default function MenuScreen({
  accounts = [], userName = "김민준", isLoading = false,
  error = null, onRetry, onNavigate, hidden = false,
}) {
  return (
    <section className="screen menu-screen react-menu-screen" aria-labelledby="menu-title">
      <MenuProfile name={userName} />
      <section className="menu-group" aria-labelledby="menu-finance-title">
        <h2 id="menu-finance-title">나의 금융</h2>
        <MenuLinkList onNavigate={onNavigate} />
      </section>

      <section className="menu-group" aria-labelledby="menu-accounts-title">
        <h2 id="menu-accounts-title">내 계좌</h2>
        {isLoading ? <Spinner message="계좌를 불러오는 중입니다." /> :
          error ? <ErrorView message="계좌 정보를 불러오지 못했습니다." onRetry={onRetry} /> :
          accounts.length === 0 ? <EmptyView message="등록된 계좌가 없습니다." /> : (
            <div className="account-list">
              {accounts.map((account) => (
                <AccountCard key={account.id} account={account} compact hidden={hidden} />
              ))}
            </div>
          )}
      </section>

      <section className="menu-group" aria-labelledby="menu-notice-title">
        <h2 id="menu-notice-title">알림</h2>
        <MenuNotice />
      </section>

      <details className="about-mockup">
        <summary>실습뱅킹 안내</summary>
        <p>계좌와 거래 정보는 실습용 서버에서 제공하는 예시 데이터입니다.
          실제 금융기관과 연결되지 않습니다.</p>
        <p>하단 메뉴로 화면을 이동하고, 거래내역에서 계좌별·입출금별 내역을 확인할 수 있어요.</p>
      </details>
      <p className="menu-version">WON BANKING · REACT</p>
    </section>
  );
}
