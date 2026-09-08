import Icon from "./Icon";

// variant: default | savings | travel. 명시하지 않으면 계좌 정보로 결정합니다.
export default function BankIcon({ account, variant, className = "" }) {
  const description = `${account?.nickname ?? ""} ${account?.type ?? ""}`;
  const resolved = variant ?? (
    description.includes("여행") ? "travel" :
    description.includes("적금") ? "savings" : "default"
  );
  const color = resolved === "savings" ? "green" : resolved === "travel" ? "purple" : "";

  return (
    <span className={`bank-icon ${color} ${className}`.trim()} aria-hidden="true">
      {resolved === "savings" ? <Icon name="save" /> :
        resolved === "travel" ? <Icon name="plane" /> : "W"}
    </span>
  );
}
