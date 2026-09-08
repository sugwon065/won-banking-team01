/* =========================================================================
 * WON뱅킹 실습 · 이체 플로우 (Express API 연동 버전)
 *
 * 데이터는 data.js 를 직접 읽지 않고, server.js 의 REST API 를 호출합니다.
 *   GET  /api/accounts                           출금 계좌 목록
 *   GET  /api/transfer/lookup?bank=&accountNo=    예금주 실명조회
 *   POST /api/transfers                           이체 실행
 *
 * 실행 전 준비
 *   1) 터미널에서 API 서버 실행: npm install && npm start  (http://localhost:4000)
 *   2) HTML 은 Live Server 등으로 열기
 *
 * 화면 전환(name="view")과 단계 표시(name="transfer-step")는
 * 기존 CSS 라디오 방식을 그대로 씁니다. JS 는 라디오의 checked 만 바꿉니다.
 * ========================================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
   * 1. 설정
   * ------------------------------------------------------------------- */
  const API_BASE = "http://localhost:4000";

  const BANKS = ["우리은행", "국민은행", "신한은행", "하나은행", "카카오뱅크"];

  // server.js 가 1,000원 미만을 400 으로 막습니다. 화면도 같은 기준을 씁니다.
  const MIN_AMOUNT = 1000;

  // 수수료 정책. 현재 마크업과 동일하게 무료(0원)입니다.
  // 타행 수수료를 걸어보려면 FEE_OTHER_BANK 를 500 으로 바꾸세요.
  // 단, 서버는 수수료를 계산하지 않으므로 화면 표시·검증용입니다.
  const FEE_SAME_BANK = 0;
  const FEE_OTHER_BANK = 0;
  const MY_BANK = "우리은행";

  /* ---------------------------------------------------------------------
   * 2. API 레이어
   * ------------------------------------------------------------------- */
  const api = {
    async getAccounts() {
      const res = await fetch(`${API_BASE}/api/accounts`);
      if (!res.ok) throw new Error("계좌 목록을 불러올 수 없습니다.");
      return res.json();
    },

    async lookupOwner(bank, accountNo) {
      const url =
        `${API_BASE}/api/transfer/lookup` +
        `?bank=${encodeURIComponent(bank)}` +
        `&accountNo=${encodeURIComponent(accountNo)}`;
      const res = await fetch(url);
      const body = await res.json().catch(() => ({}));

      if (res.ok) return { ok: true, ownerName: body.ownerName };
      return {
        ok: false,
        message: body.message || "계좌 정보를 확인할 수 없습니다.",
      };
    },

    async createTransfer(payload) {
      const res = await fetch(`${API_BASE}/api/transfers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));

      console.log(body);

      if (res.ok) {
        return {
          ok: true,
          transaction: body.transaction,
          account: body.account,
        };
      }
      return { ok: false, message: body.message || "이체에 실패했습니다." };
    },
  };

  /* ---------------------------------------------------------------------
   * 3. 상태
   * ------------------------------------------------------------------- */
  const state = {
    accounts: [],
    accountsError: null,
    fromAccountId: null,
    bankName: BANKS[0],
    accountNo: "",
    ownerName: null,
    verifyError: null,
    verifiedKey: null, // 확인 당시의 "은행|계좌번호" — 입력이 바뀌면 무효화
    verifying: false,
    amount: 0,
    submitting: false,
    submitError: null,
    completed: false,
  };

  /* ---------------------------------------------------------------------
   * 4. DOM
   * ------------------------------------------------------------------- */
  const $ = (id) => document.getElementById(id);

  const el = {
    stepInfo: $("step-info"),
    stepReview: $("step-review"),
    stepDone: $("step-done"),

    fromAccount: $("from-account"),
    fromBalance: $("from-balance"),
    recipientBank: $("recipient-bank"),
    recipientAccount: $("recipient-account"),
    btnVerify: $("btn-verify"),
    ownerResult: $("owner-result"),
    amountSurface: $("amount-surface"),
    amountInput: $("amount-input"),
    amountCaption: $("amount-caption"),
    amountOptions: $("amount-options"),
    amountError: $("amount-error"),
    feeText: $("fee-text"),
    btnToReview: $("btn-to-review"),
    nextHint: $("next-hint"),

    reviewAvatar: $("review-avatar"),
    reviewOwner: $("review-owner"),
    reviewHeadAmount: $("review-head-amount"),
    reviewBankAccount: $("review-bank-account"),
    reviewBank: $("review-bank"),
    reviewAccountNo: $("review-accountno"),
    reviewOwnerName: $("review-owner-name"),
    reviewFrom: $("review-from"),
    reviewAmount: $("review-amount"),
    btnDoTransfer: $("btn-do-transfer"),
    reviewHint: $("review-hint"),

    doneOwner: $("done-owner"),
    doneAmount: $("done-amount"),
  };

  /* ---------------------------------------------------------------------
   * 5. 유틸
   * ------------------------------------------------------------------- */
  const formatMoney = (n) => Number(n || 0).toLocaleString("ko-KR");
  const onlyDigits = (s) => String(s || "").replace(/[^0-9]/g, "");

  const getFromAccount = () =>
    state.accounts.find((a) => a.id === state.fromAccountId) || null;

  const getFee = () =>
    state.bankName === MY_BANK ? FEE_SAME_BANK : FEE_OTHER_BANK;

  const currentKey = () => `${state.bankName}|${state.accountNo}`;

  function invalidateVerification() {
    if (state.verifiedKey !== null && state.verifiedKey !== currentKey()) {
      state.ownerName = null;
      state.verifyError = null;
      state.verifiedKey = null;
    }
  }

  /* ---------------------------------------------------------------------
   * 6. 화면 검증 (최종 검증은 서버가 합니다)
   * ------------------------------------------------------------------- */
  function validate() {
    const account = getFromAccount();
    const total = state.amount + getFee();
    const result = { amountError: null, hint: "", canProceed: false };

    if (state.accountsError) {
      result.hint = state.accountsError;
      return result;
    }
    if (!account) {
      result.hint = "출금 계좌를 선택해 주세요.";
      return result;
    }

    if (state.amount > 0 && state.amount < MIN_AMOUNT) {
      result.amountError = `이체 금액은 ${formatMoney(
        MIN_AMOUNT
      )}원 이상이어야 합니다`;
    } else if (state.amount > 0 && total > account.balance) {
      result.amountError = `잔액(${formatMoney(
        account.balance
      )}원)을 초과했습니다`;
    }

    if (state.verifying) {
      result.hint = "예금주를 조회하고 있어요.";
    } else if (!state.ownerName) {
      result.hint = "받는 계좌를 확인해 주세요.";
    } else if (state.amount <= 0) {
      result.hint = "보낼 금액을 입력해 주세요.";
    } else if (result.amountError) {
      result.hint = "금액을 다시 확인해 주세요.";
    }

    result.canProceed =
      !!state.ownerName &&
      !state.verifying &&
      state.amount > 0 &&
      !result.amountError;

    return result;
  }

  /* ---------------------------------------------------------------------
   * 7. 렌더링
   * ------------------------------------------------------------------- */
  function renderBankSelect() {
    el.recipientBank.innerHTML = BANKS.map(
      (b) => `<option value="${b}">${b}</option>`
    ).join("");
    el.recipientBank.value = state.bankName;
  }

  function renderAccountSelect() {
    if (state.accountsError) {
      el.fromAccount.innerHTML = `<option value="">계좌를 불러올 수 없습니다</option>`;
      el.fromAccount.disabled = true;
      return;
    }
    if (!state.accounts.length) {
      el.fromAccount.innerHTML = `<option value="">불러오는 중…</option>`;
      el.fromAccount.disabled = true;
      return;
    }

    el.fromAccount.disabled = false;
    el.fromAccount.innerHTML = state.accounts
      .map((a) => `<option value="${a.id}">${a.nickname} · ${a.accountNo}</option>`)
      .join("");
    el.fromAccount.value = state.fromAccountId;
  }

  function renderOwnerResult() {
    const box = el.ownerResult;

    if (state.verifying) {
      box.hidden = false;
      box.className = "owner-result is-loading";
      box.textContent = "조회 중…";
      return;
    }
    if (state.ownerName) {
      box.hidden = false;
      box.className = "owner-result is-ok";
      box.innerHTML =
        `<svg class="icon" aria-hidden="true"><use href="#i-check" /></svg>` +
        `${state.ownerName}님`;
      return;
    }
    if (state.verifyError) {
      box.hidden = false;
      box.className = "owner-result is-error";
      box.textContent = state.verifyError;
      return;
    }

    box.hidden = true;
    box.textContent = "";
  }

  function render() {
    const account = getFromAccount();
    const fee = getFee();
    const v = validate();

    el.fromBalance.textContent = account
      ? `출금 가능 ${formatMoney(account.balance)}원`
      : state.accountsError
        ? "잔액을 불러올 수 없습니다"
        : "출금 가능 …";

    if (document.activeElement !== el.amountInput) {
      el.amountInput.value = formatMoney(state.amount);
    }
    el.amountCaption.textContent = account
      ? `출금 가능 금액: ${formatMoney(account.balance)}원`
      : "출금 가능 금액: -원";

    if (v.amountError) {
      el.amountSurface.classList.add("is-error");
      el.amountError.hidden = false;
      el.amountError.textContent = v.amountError;
    } else {
      el.amountSurface.classList.remove("is-error");
      el.amountError.hidden = true;
      el.amountError.textContent = "";
    }

    el.feeText.textContent = fee === 0 ? "무료" : `${formatMoney(fee)}원`;

    el.btnVerify.disabled = state.verifying;
    el.btnVerify.textContent = state.verifying ? "조회 중" : "확인";

    renderOwnerResult();

    el.btnToReview.disabled = !v.canProceed;
    el.nextHint.textContent = v.hint;
    el.nextHint.classList.toggle("is-error", !!state.accountsError);
  }

  function renderReview() {
    const account = getFromAccount();

    el.reviewAvatar.textContent = state.ownerName
      ? state.ownerName.charAt(0)
      : "?";
    el.reviewOwner.textContent = state.ownerName || "-";
    el.reviewHeadAmount.textContent = formatMoney(state.amount);
    el.reviewBankAccount.textContent = `${state.bankName} · ${state.accountNo}`;

    el.reviewBank.textContent = state.bankName;
    el.reviewAccountNo.textContent = state.accountNo;
    el.reviewOwnerName.textContent = state.ownerName || "-";
    el.reviewFrom.textContent = account ? account.nickname : "-";
    el.reviewAmount.textContent = `${formatMoney(state.amount)}원`;

    el.btnDoTransfer.disabled = state.submitting;
    el.btnDoTransfer.textContent = state.submitting ? "이체 중…" : "이체하기";

    if (el.reviewHint) {
      el.reviewHint.textContent = state.submitError || "";
      el.reviewHint.classList.toggle("is-error", !!state.submitError);
    }
  }

  function renderDone() {
    el.doneOwner.textContent = state.ownerName || "-";
    el.doneAmount.textContent = formatMoney(state.amount);
  }

  /* ---------------------------------------------------------------------
   * 8. 단계 이동
   * ------------------------------------------------------------------- */
  function goStep(name) {
    if (name === "info") el.stepInfo.checked = true;
    if (name === "review") el.stepReview.checked = true;
    if (name === "done") el.stepDone.checked = true;
  }

  function resetForm() {
    state.fromAccountId = state.accounts.length ? state.accounts[0].id : null;
    state.bankName = BANKS[0];
    state.accountNo = "";
    state.ownerName = null;
    state.verifyError = null;
    state.verifiedKey = null;
    state.amount = 0;
    state.submitError = null;
    state.completed = false;

    el.recipientBank.value = state.bankName;
    el.recipientAccount.value = "";
    el.amountInput.value = "0";

    renderAccountSelect();
    goStep("info");
    render();
  }

  /* ---------------------------------------------------------------------
   * 9. 계좌 목록 불러오기 (GET /api/accounts)
   * ------------------------------------------------------------------- */
  async function loadAccounts() {
    try {
      const accounts = await api.getAccounts();
      state.accounts = accounts;
      state.accountsError = null;

      const stillExists = accounts.some((a) => a.id === state.fromAccountId);
      if (!stillExists && accounts.length) {
        state.fromAccountId = accounts[0].id;
      }
    } catch (err) {
      console.error("[transfer] 계좌 목록 조회 실패:", err);
      state.accounts = [];
      state.accountsError =
        "API 서버에 연결할 수 없습니다. 터미널에서 npm start 로 서버를 실행해 주세요.";
    }
    renderAccountSelect();
    render();
  }

  /* ---------------------------------------------------------------------
   * 10. 예금주 실명조회 (GET /api/transfer/lookup)
   * ------------------------------------------------------------------- */
  async function verifyOwner() {
    if (state.verifying) return;

    if (!state.accountNo) {
      state.ownerName = null;
      state.verifyError = "계좌번호를 입력해 주세요.";
      state.verifiedKey = currentKey();
      render();
      return;
    }

    const keyAtRequest = currentKey();
    state.verifying = true;
    state.ownerName = null;
    state.verifyError = null;
    render();

    try {
      const result = await api.lookupOwner(state.bankName, state.accountNo);

      // 조회 도중 입력이 바뀌었으면 결과를 버립니다.
      if (keyAtRequest !== currentKey()) return;

      if (result.ok) {
        state.ownerName = result.ownerName;
        state.verifyError = null;
      } else {
        state.ownerName = null;
        state.verifyError = result.message;
      }
      state.verifiedKey = keyAtRequest;
    } catch (err) {
      console.error("[transfer] 실명조회 실패:", err);
      state.ownerName = null;
      state.verifyError = "API 서버에 연결할 수 없습니다.";
      state.verifiedKey = keyAtRequest;
    } finally {
      state.verifying = false;
      render();
    }
  }

  /* ---------------------------------------------------------------------
   * 11. 이체 실행 (POST /api/transfers)
   * ------------------------------------------------------------------- */
  async function executeTransfer() {
    if (state.submitting) return;

    const v = validate();
    if (!v.canProceed) {
      goStep("info");
      render();
      return;
    }

    const account = getFromAccount();

    state.submitting = true;
    state.submitError = null;
    renderReview();

    try {
      const result = await api.createTransfer({
        fromAccountId: account.id,
        toBank: state.bankName,
        toAccountNo: state.accountNo,
        toOwnerName: state.ownerName,
        amount: state.amount,
      });

      if (!result.ok) {
        // 서버가 400 / 404 로 돌려준 메시지를 그대로 보여줍니다.
        state.submitError = result.message;
        return;
      }

      // 서버가 계산한 잔액으로 화면 상태를 갱신합니다.
      if (result.account) {
        const target = state.accounts.find((a) => a.id === result.account.id);
        if (target) target.balance = result.account.balance;
      }

      state.completed = true;
      renderDone();
      goStep("done");

      // 홈 · 거래내역 담당자가 이 이벤트를 듣고 다시 렌더링하면 됩니다.
      document.dispatchEvent(
        new CustomEvent("transfer:completed", {
          detail: { transaction: result.transaction, account: result.account },
        })
      );
    } catch (err) {
      console.error("[transfer] 이체 실패:", err);
      state.submitError = "API 서버에 연결할 수 없습니다.";
    } finally {
      state.submitting = false;
      renderReview();
      render();
    }
  }

  /* ---------------------------------------------------------------------
   * 12. 이벤트 바인딩
   * ------------------------------------------------------------------- */
  function bind() {
    el.fromAccount.addEventListener("change", (e) => {
      state.fromAccountId = e.target.value;
      render();
    });

    el.recipientBank.addEventListener("change", (e) => {
      state.bankName = e.target.value;
      invalidateVerification();
      render();
    });

    el.recipientAccount.addEventListener("input", (e) => {
      const digits = onlyDigits(e.target.value);
      e.target.value = digits;
      state.accountNo = digits;
      invalidateVerification();
      render();
    });

    el.recipientAccount.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        verifyOwner();
      }
    });

    el.btnVerify.addEventListener("click", verifyOwner);

    el.amountInput.addEventListener("input", (e) => {
      const digits = onlyDigits(e.target.value);
      state.amount = digits ? parseInt(digits, 10) : 0;
      e.target.value = state.amount ? formatMoney(state.amount) : "";
      render();
    });

    el.amountInput.addEventListener("blur", () => {
      el.amountInput.value = formatMoney(state.amount);
    });

    // 금액 버튼 — 이벤트 위임
    el.amountOptions.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      if (btn.dataset.add) {
        state.amount += parseInt(btn.dataset.add, 10);
        render();
        return;
      }
      if (btn.dataset.action === "manual") {
        el.amountInput.focus();
        el.amountInput.select();
      }
    });

    el.btnToReview.addEventListener("click", () => {
      if (el.btnToReview.disabled) return;
      state.submitError = null;
      renderReview();
      goStep("review");
    });

    el.btnDoTransfer.addEventListener("click", executeTransfer);

    // 이체 완료 후 다른 화면에 갔다 돌아오면 초기화 + 잔액 재조회
    document.querySelectorAll('input[name="view"]').forEach((input) => {
      input.addEventListener("change", (e) => {
        if (e.target.id === "view-transfer" && state.completed) {
          resetForm();
          loadAccounts();
        }
      });
    });
  }

  /* ---------------------------------------------------------------------
   * 13. 시작
   * ------------------------------------------------------------------- */
  function init() {
    // 이체 화면 마크업이 없는 페이지에서는 아무 것도 하지 않습니다.
    if (!el.fromAccount || !el.btnToReview) return;

    renderBankSelect();
    renderAccountSelect();
    bind();
    render();
    goStep("info");
    loadAccounts();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();