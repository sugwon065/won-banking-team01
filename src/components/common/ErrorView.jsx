import "./common.css";

export default function ErrorView({
  message = "정보를 불러오지 못했습니다.", onRetry, retrying = false,
}) {
  return (
    <div className="common-state common-error" role="alert">
      <p>{message}</p>
      {onRetry && <button type="button" className="small-button"
        disabled={retrying} onClick={onRetry}>
        {retrying ? "다시 불러오는 중…" : "다시 시도"}
      </button>}
    </div>
  );
}
