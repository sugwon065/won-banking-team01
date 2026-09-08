import Icon from "./Icon";
import "./common.css";

export default function AppHeader({ onNavigate, onNotifications, hasNotification = false }) {
  return (
    <header className="app-header">
      <div className="app-brand">
        <span className="wordmark">WON</span><span className="sub-brand">실습뱅킹</span>
      </div>
      <div className="header-tools">
        <button type="button" className="icon-action common-icon-action"
          aria-label="알림 및 전체 메뉴" disabled={!onNotifications && !onNavigate}
          onClick={() => onNotifications ? onNotifications() : onNavigate?.("menu")}>
          <Icon name="bell" />
          {hasNotification && <i className="notification-dot" aria-hidden="true" />}
        </button>
        <button type="button" className="icon-action common-icon-action"
          aria-label="전체 메뉴" disabled={!onNavigate} onClick={() => onNavigate?.("menu")}>
          <Icon name="menu" />
        </button>
      </div>
    </header>
  );
}
