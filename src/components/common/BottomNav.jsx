import Icon from "./Icon";
import "./common.css";

const items = [
  { page: "home", label: "홈", icon: "home" },
  { page: "transfer", label: "이체", icon: "transfer" },
  { page: "history", label: "거래내역", icon: "list" },
  { page: "menu", label: "전체", icon: "grid" },
];

export default function BottomNav({ activePage = "home", onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="화면 선택">
      {items.map(({ page, label, icon }) => (
        <button key={page} type="button" className="common-nav-item"
          aria-current={activePage === page ? "page" : undefined}
          disabled={!onNavigate} onClick={() => onNavigate?.(page)}>
          <Icon name={icon} /><span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
