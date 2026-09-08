import { useEffect, useMemo, useState } from "react";
import { getAccounts, lookupOwner, createTransfer } from "../../api/banking";
import TransferProgress from "./TransferProgress";
import TransferInfoStep from "./TransferInfoStep";
import TransferReviewStep from "./TransferReviewStep";
import TransferDoneStep from "./TransferDoneStep";
import "../../styles/transfer-react.css";

const BANKS = ["우리은행", "국민은행", "신한은행", "하나은행", "카카오뱅크"];

/* server.js 가 1,000원 미만을 400 으로 막습니다. 화면도 같은 기준을 씁니다. */
const MIN_AMOUNT = 1000;

/* 수수료 정책. 마크업과 동일하게 무료(0원). 타행 수수료를 걸려면 500 으로 변경 */
const FEE = 0;

const IDLE = { status: "idle", ownerName: null, message: null, key: "" };
const NETWORK_MESSAGE =
  "API 서버에 연결할 수 없습니다. 터미널에서 npm start 로 서버를 실행해 주세요.";

export default function TransferScreen({
  accounts: accountsProp,
  onTransferComplete,
  onNavigate,
}) {
  /* ── state 7개 ────────────────────────────────────────── */
  const [step, setStep] = useState("info");
  const [fromAccountId, setFromAccountId] = useState("");
  const [bankName, setBankName] = useState(BANKS[0]);
  const [accountNo, setAccountNo] = useState("");
  const [amount, setAmount] = useState(0);
  const [lookup, setLookup] = useState(IDLE);
  const [submit, setSubmit] = useState({ status: "idle", message: null });

  /* ── App 이 accounts 를 아직 안 넘겨줄 때만 직접 조회 ────
     App 에서 useAccounts 를 연결하면 이 블록은 지워도 됩니다. */
  const selfFetch = accountsProp === undefined;
  const [ownAccounts, setOwnAccounts] = useState([]);
  const [accountsError, setAccountsError] = useState(null);
  const accounts = accountsProp ?? ownAccounts;

  useEffect(() => {
    if (!selfFetch) return;

    const controller = new AbortController();
    getAccounts(controller.signal)
      .then((data) => setOwnAccounts(data))
      .catch((err) => {
        if (err.name !== "AbortError") setAccountsError(NETWORK_MESSAGE);
      });

    return () => controller.abort();
  }, [selfFetch]);

  /* 계좌가 들어오면 첫 계좌를 기본 선택 */
  useEffect(() => {
    if (!fromAccountId && accounts.length > 0) {
      setFromAccountId(accounts[0].id);
    }
  }, [accounts, fromAccountId]);

  /* ── 파생값 (state 로 두지 않음) ──────────────────────── */
  const fromAccount = useMemo(
    () => accounts.find((a) => a.id === fromAccountId) ?? null,
    [accounts, fromAccountId]
  );
  const maxAmount = fromAccount ? fromAccount.balance : 0;
  const currentKey = `${bankName}|${accountNo}`;

  /* 은행이나 계좌번호가 바뀌면 이전 조회 결과를 자동으로 무시합니다.
     따로 초기화하지 않고 key 비교로 처리해 "지운 걸 깜빡하는" 버그를 없앴습니다. */
  const activeLookup = lookup.key === currentKey ? lookup : IDLE;

  const amountError = useMemo(() => {
    if (amount <= 0) return null;
    if (amount < MIN_AMOUNT) {
      return `이체 금액은 ${MIN_AMOUNT.toLocaleString("ko-KR")}원 이상이어야 합니다`;
    }
    if (amount + FEE > maxAmount) {
      return `잔액(${maxAmount.toLocaleString("ko-KR")}원)을 초과했습니다`;
    }
    return null;
  }, [amount, maxAmount]);

  const canProceed =
    activeLookup.status === "ok" && amount > 0 && amountError === null;

  const hint = useMemo(() => {
    if (accountsError) return accountsError;
    if (!fromAccount) return "출금 계좌를 선택해 주세요.";
    if (activeLookup.status === "loading") return "예금주를 조회하고 있어요.";
    if (activeLookup.status !== "ok") return "받는 계좌를 확인해 주세요.";
    if (amount <= 0) return "보낼 금액을 입력해 주세요.";
    if (amountError) return "금액을 다시 확인해 주세요.";
    return "";
  }, [accountsError, fromAccount, activeLookup.status, amount, amountError]);

  /* ── 예금주 실명조회 ─────────────────────────────────── */
  async function handleVerify() {
    if (activeLookup.status === "loading") return;

    if (!accountNo) {
      setLookup({
        status: "error",
        ownerName: null,
        message: "계좌번호를 입력해 주세요.",
        key: currentKey,
      });
      return;
    }

    const keyAtRequest = currentKey;
    setLookup({ status: "loading", ownerName: null, message: null, key: keyAtRequest });

    try {
      const body = await lookupOwner({ bank: bankName, accountNo });
      setLookup({
        status: "ok",
        ownerName: body.ownerName,
        message: null,
        key: keyAtRequest,
      });
    } catch (err) {
      /* 서버가 준 404 메시지가 있으면 그대로, 없으면 네트워크 문제로 안내 */
      setLookup({
        status: "error",
        ownerName: null,
        message: err.serverMessage ?? NETWORK_MESSAGE,
        key: keyAtRequest,
      });
    }
  }

  /* ── 이체 실행 ───────────────────────────────────────── */
  async function handleSubmit() {
    if (submit.status === "loading") return;
    if (!canProceed || !fromAccount) {
      setStep("info");
      return;
    }

    setSubmit({ status: "loading", message: null });

    try {
      await createTransfer({
        fromAccountId: fromAccount.id,
        toBank: bankName,
        toAccountNo: accountNo,
        toOwnerName: activeLookup.ownerName,
        amount,
      });

      setSubmit({ status: "ok", message: null });
      setStep("done");

      /* 잔액과 거래내역이 함께 바뀌므로 App 이 두 데이터를 다시 조회합니다 */
      onTransferComplete?.();
    } catch (err) {
      /* 서버가 준 400 · 404 메시지를 확인 화면에 그대로 보여줍니다 */
      setSubmit({
        status: "error",
        message: err.serverMessage ?? NETWORK_MESSAGE,
      });
    }
  }

  /* ── 렌더 ────────────────────────────────────────────── */
  return (
    <section className="screen transfer-screen" aria-labelledby="transfer-title">
      <div className="page-intro">
        <div className="eyebrow">TRANSFER</div>
        <div className="page-title-row">
          <h1 id="transfer-title">계좌이체</h1>
          <span className="sample-tag">샘플 이체</span>
        </div>
      </div>

      <TransferProgress step={step} />

      <div className="flow-body">
        {step === "info" && (
          <TransferInfoStep
            accounts={accounts}
            fromAccountId={fromAccountId}
            bankName={bankName}
            accountNo={accountNo}
            amount={amount}
            banks={BANKS}
            lookup={activeLookup}
            maxAmount={maxAmount}
            fee={FEE}
            amountError={amountError}
            canProceed={canProceed}
            hint={hint}
            onFromAccountChange={setFromAccountId}
            onBankChange={setBankName}
            onAccountNoChange={setAccountNo}
            onVerify={handleVerify}
            onAmountChange={setAmount}
            onAmountAdd={(n) => setAmount((prev) => prev + n)}
            onNext={() => {
              setSubmit({ status: "idle", message: null });
              setStep("review");
            }}
          />
        )}

        {step === "review" && (
          <TransferReviewStep
            bankName={bankName}
            accountNo={accountNo}
            ownerName={activeLookup.ownerName}
            fromAccountName={fromAccount ? fromAccount.nickname : "-"}
            amount={amount}
            submit={submit}
            onSubmit={handleSubmit}
            onBack={() => setStep("info")}
          />
        )}

        {step === "done" && (
          <TransferDoneStep
            ownerName={activeLookup.ownerName}
            amount={amount}
            onGoHome={() => onNavigate?.("home")}
          />
        )}
      </div>
    </section>
  );
}