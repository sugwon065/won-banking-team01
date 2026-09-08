import { useState } from "react";
import Icon from "../common/Icon";
import { formatWon } from "../../utils/transactions";

export default function TotalAssetCard({ accounts }) {
  const [hidden, setHidden] = useState(false);
  const total = accounts.reduce((sum, account) => sum + Number(account.balance ?? 0), 0);

  return (
    <div className="asset-card">
      <div className="asset-card-top">
        <p>총 자산</p>
        <button
          type="button"
          className="privacy-control common-icon-action"
          aria-pressed={hidden}
          onClick={() => setHidden((value) => !value)}
        >
          <Icon name="eye" />
          <span>{hidden ? "보기" : "숨기기"}</span>
        </button>
      </div>
      <div className="asset-value">
        {hidden ? "금액 숨김" : <>{formatWon(total).slice(0, -1)}<span className="unit">원</span></>}
      </div>
      <div className="asset-footer">
        <span>계좌 {accounts.length}개 합산 금액입니다</span>
      </div>
    </div>
  );
}
