import "./common.css";

export default function Spinner({ message = "불러오는 중입니다." }) {
  return (
    <div className="common-state" role="status" aria-live="polite">
      <span className="common-spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
