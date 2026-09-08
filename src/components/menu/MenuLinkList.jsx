import Icon from "../common/Icon";
import "./menu.css";

const links = [
  { page: "home", label: "내 계좌 조회", icon: "home" },
  { page: "transfer", label: "계좌이체", icon: "transfer" },
  { page: "history", label: "전체 거래내역", icon: "list" },
];

export default function MenuLinkList({ onNavigate }) {
  return (
    <div className="menu-list">
      {links.map(({ page, label, icon }) => (
        <button key={page} type="button" className="menu-link menu-link-button"
          disabled={!onNavigate} onClick={() => onNavigate?.(page)}>
          <Icon name={icon} />
          <span>{label}</span>
          <Icon name="chevron" />
        </button>
      ))}
    </div>
  );
}
