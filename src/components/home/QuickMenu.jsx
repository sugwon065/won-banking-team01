import Icon from "../common/Icon";

const items = [
  { page: "transfer", label: "이체", icon: "transfer" },
  { page: "history", label: "거래내역", icon: "list" },
  { page: "menu", label: "전체", icon: "grid" },
];

export default function QuickMenu({ onNavigate }) {
  return (
    <div
      className="quick-menu"
      aria-label="빠른 메뉴"
      style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
    >
      {items.map(({ page, label, icon }) => (
        <button
          key={page}
          type="button"
          className="common-icon-action"
          disabled={!onNavigate}
          onClick={() => onNavigate?.(page)}
        >
          <span className="quick-icon"><Icon name={icon} /></span>
          {label}
        </button>
      ))}
    </div>
  );
}
