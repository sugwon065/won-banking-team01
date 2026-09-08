import FromAccountSelect from "./FromAccountSelect";
import RecipientField from "./RecipientField";
import AmountField from "./AmountField";

/* 1단계. 입력 UI 를 묶고 다음 버튼을 표시합니다.
   값은 모두 TransferScreen 에서 받아 아래로 전달합니다. */
export default function TransferInfoStep({
  accounts,
  fromAccountId,
  bankName,
  accountNo,
  amount,
  banks,
  lookup,
  maxAmount,
  fee,
  amountError,
  canProceed,
  hint,
  onFromAccountChange,
  onBankChange,
  onAccountNoChange,
  onVerify,
  onAmountChange,
  onAmountAdd,
  onNext,
}) {
  return (
    <div className="flow-panel transfer-info" style={{ display: "block" }}>
      <FromAccountSelect
        accounts={accounts}
        value={fromAccountId}
        maxAmount={maxAmount}
        onChange={onFromAccountChange}
      />

      <RecipientField
        banks={banks}
        bankName={bankName}
        accountNo={accountNo}
        lookup={lookup}
        onBankChange={onBankChange}
        onAccountNoChange={onAccountNoChange}
        onVerify={onVerify}
      />

      <AmountField
        amount={amount}
        maxAmount={maxAmount}
        error={amountError}
        onChange={onAmountChange}
        onAdd={onAmountAdd}
      />

      <div className="fee-row">
        <span>이체 수수료</span>
        <strong>{fee === 0 ? "무료" : `${fee.toLocaleString("ko-KR")}원`}</strong>
      </div>

      <button
        type="button"
        className="primary-button"
        disabled={!canProceed}
        onClick={onNext}
      >
        다음
      </button>

      <p className="flow-footnote">{hint}</p>
    </div>
  );
}