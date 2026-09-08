export default function MenuProfile({ name = "김민준", titleId = "menu-title" }) {
  return (
    <div className="menu-profile">
      <span className="profile-badge" aria-hidden="true">{name.slice(0, 1)}</span>
      <div>
        <h1 id={titleId}>{name}님</h1>
        <p>WON 실습뱅킹과 함께하는 금융 생활</p>
      </div>
    </div>
  );
}
