/* =========================================================================
 * WON뱅킹 실습 · STEP 02 — 이체 플로우 인터랙션 (바닐라 JS)
 *
 * 전제
 *  - data.js 는 수정하지 않습니다. (module.exports 그대로)
 *    HTML에서 아래 순서로 불러오면 브라우저에서도 읽힙니다.
 *      <script>window.module = { exports: {} };</script>
 *      <script src="data.js"></script>
 *      <script src="app.js"></script>
 *  - 화면 전환(name="view")과 단계 표시(name="transfer-step")는
 *    기존 CSS 라디오 방식을 그대로 씁니다. JS는 라디오의 checked만 바꿉니다.
 *  - 이체가 완료되면 data.js 의 accounts / transactions 배열을 직접 갱신하고
 *    document 에 'transfer:completed' 이벤트를 발생시킵니다.
 *    (홈·거래내역 담당자가 이 이벤트를 듣고 다시 렌더링하면 됩니다)
 * ========================================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
   * 0. data.js 연결
   * ------------------------------------------------------------------- */
  var DB = (window.module && window.module.exports) || null;

  if (!DB || !DB.accounts) {
    console.error(
      "[app.js] data.js를 읽지 못했습니다.\n" +
        "index.html에서 아래 순서를 확인하세요.\n" +
        '  <script>window.module = { exports: {} };</script>\n' +
        '  <script src="data.js"></script>\n' +
        '  <script src="app.js"></script>'
    );
    return;
  }

  /* ---------------------------------------------------------------------
   * 1. 상수
   * ------------------------------------------------------------------- */
  var BANKS = [
    "우리은행",
    "국민은행",
    "신한은행",
    "하나은행",
    "카카오뱅크",
  ];

  // 수수료 정책. 지금은 마크업과 동일하게 전부 무료(0원)입니다.
  // 타행 수수료를 걸어보고 싶으면 FEE_OTHER_BANK 를 500 으로 바꾸세요.
  var FEE_SAME_BANK = 0;
  var FEE_OTHER_BANK = 0;
  var MY_BANK = "우리은행";

  var QUICK_AMOUNTS = [10000, 50000, 100000];

  /* ---------------------------------------------------------------------
   * 2. 상태
   * ------------------------------------------------------------------- */
  var state = {
    fromAccountId: DB.accounts.length ? DB.accounts[0].id : null,
    bankName: BANKS[0],
    accountNo: "",
    ownerName: null, // 실명조회 성공 시 예금주 이름
    verifyError: null, // 실명조회 실패 메시지
    verifiedKey: null, // 확인 당시의 "은행|계좌번호" — 입력이 바뀌면 무효화
    amount: 0,
    completed: false,
  };

  /* ---------------------------------------------------------------------
   * 3. DOM 참조
   * ------------------------------------------------------------------- */
  var $ = function (id) {
    return document.getElementById(id);
  };

  var el = {
    // 단계 라디오 (CSS가 이걸 보고 패널을 전환합니다)
    stepInfo: $("step-info"),
    stepReview: $("step-review"),
    stepDone: $("step-done"),

    // STEP 1 — 정보 입력
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

    // STEP 2 — 내용 확인
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

    // STEP 3 — 완료
    doneOwner: $("done-owner"),
    doneAmount: $("done-amount"),
  };

  /* ---------------------------------------------------------------------
   * 4. 유틸
   * ------------------------------------------------------------------- */
  function formatMoney(n) {
    return Number(n || 0).toLocaleString("ko-KR");
  }

  function onlyDigits(str) {
    return String(str || "").replace(/[^0-9]/g, "");
  }

  function getFromAccount() {
    for (var i = 0; i < DB.accounts.length; i++) {
      if (DB.accounts[i].id === state.fromAccountId) return DB.accounts[i];
    }
    return null;
  }

  function getFee() {
    return state.bankName === MY_BANK ? FEE_SAME_BANK : FEE_OTHER_BANK;
  }

  function currentKey() {
    return state.bankName + "|" + state.accountNo;
  }

  // 은행이나 계좌번호가 바뀌면 이전 실명조회 결과를 버립니다.
  function invalidateVerification() {
    if (state.verifiedKey !== null && state.verifiedKey !== currentKey()) {
      state.ownerName = null;
      state.verifyError = null;
      state.verifiedKey = null;
    }
  }

  /* ---------------------------------------------------------------------
   * 5. 검증
   * ------------------------------------------------------------------- */
  function validate() {
    var account = getFromAccount();
    var fee = getFee();
    var total = state.amount + fee;

    var result = {
      amountError: null, // 금액 입력란 아래에 뜨는 빨간 메시지
      hint: "", // 다음 버튼 아래 안내 문구
      canProceed: false,
    };

    if (!account) {
      result.hint = "출금 계좌를 선택해 주세요.";
      return result;
    }

    if (state.amount > 0 && total > account.balance) {
      result.amountError =
        "잔액(" + formatMoney(account.balance) + "원)을 초과했습니다";
    }

    if (!state.ownerName) {
      result.hint = "받는 계좌를 확인해 주세요.";
    } else if (state.amount <= 0) {
      result.hint = "보낼 금액을 입력해 주세요.";
    } else if (result.amountError) {
      result.hint = "출금 가능 금액 안에서 입력해 주세요.";
    }

    result.canProceed =
      !!state.ownerName && state.amount > 0 && !result.amountError;

    return result;
  }

  /* ---------------------------------------------------------------------
   * 6. 렌더링
   * ------------------------------------------------------------------- */
  function renderSelects() {
    // 출금 계좌 — data.js 의 accounts 로 초기 세팅
    el.fromAccount.innerHTML = DB.accounts
      .map(function (a) {
        return (
          '<option value="' +
          a.id +
          '">' +
          a.nickname +
          " · " +
          a.accountNo +
          "</option>"
        );
      })
      .join("");
    el.fromAccount.value = state.fromAccountId;

    // 받는 은행
    el.recipientBank.innerHTML = BANKS.map(function (b) {
      return '<option value="' + b + '">' + b + "</option>";
    }).join("");
    el.recipientBank.value = state.bankName;
  }

  function renderOwnerResult() {
    var box = el.ownerResult;

    if (state.ownerName) {
      box.hidden = false;
      box.className = "owner-result is-ok";
      box.innerHTML =
        '<svg class="icon" aria-hidden="true"><use href="#i-check" /></svg>' +
        state.ownerName +
        "님";
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
    var account = getFromAccount();
    var fee = getFee();
    var v = validate();

    // 출금 가능 금액
    el.fromBalance.textContent = account
      ? "출금 가능 " + formatMoney(account.balance) + "원"
      : "출금 가능 -원";

    // 금액 입력란 · 캡션
    if (document.activeElement !== el.amountInput) {
      el.amountInput.value = formatMoney(state.amount);
    }
    el.amountCaption.textContent = account
      ? "출금 가능 금액: " + formatMoney(account.balance) + "원"
      : "출금 가능 금액: -원";

    // 잔액 초과 에러
    if (v.amountError) {
      el.amountSurface.classList.add("is-error");
      el.amountError.hidden = false;
      el.amountError.textContent = v.amountError;
    } else {
      el.amountSurface.classList.remove("is-error");
      el.amountError.hidden = true;
      el.amountError.textContent = "";
    }

    // 수수료
    el.feeText.textContent = fee === 0 ? "무료" : formatMoney(fee) + "원";

    // 예금주 확인 결과
    renderOwnerResult();

    // 다음 버튼
    el.btnToReview.disabled = !v.canProceed;
    el.nextHint.textContent = v.hint;
  }

  function renderReview() {
    var account = getFromAccount();

    el.reviewAvatar.textContent = state.ownerName
      ? state.ownerName.charAt(0)
      : "?";
    el.reviewOwner.textContent = state.ownerName || "-";
    el.reviewHeadAmount.textContent = formatMoney(state.amount);
    el.reviewBankAccount.textContent =
      state.bankName + " · " + state.accountNo;

    el.reviewBank.textContent = state.bankName;
    el.reviewAccountNo.textContent = state.accountNo;
    el.reviewOwnerName.textContent = state.ownerName || "-";
    el.reviewFrom.textContent = account ? account.nickname : "-";
    el.reviewAmount.textContent = formatMoney(state.amount) + "원";
  }

  function renderDone() {
    el.doneOwner.textContent = state.ownerName || "-";
    el.doneAmount.textContent = formatMoney(state.amount);
  }

  /* ---------------------------------------------------------------------
   * 7. 단계 이동
   * ------------------------------------------------------------------- */
  function goStep(name) {
    if (name === "info") el.stepInfo.checked = true;
    if (name === "review") el.stepReview.checked = true;
    if (name === "done") el.stepDone.checked = true;
  }

  function resetFlow() {
    state.fromAccountId = DB.accounts.length ? DB.accounts[0].id : null;
    state.bankName = BANKS[0];
    state.accountNo = "";
    state.ownerName = null;
    state.verifyError = null;
    state.verifiedKey = null;
    state.amount = 0;
    state.completed = false;

    el.fromAccount.value = state.fromAccountId;
    el.recipientBank.value = state.bankName;
    el.recipientAccount.value = "";
    el.amountInput.value = "0";

    goStep("info");
    render();
  }

  /* ---------------------------------------------------------------------
   * 8. 실명조회 (data.js 의 ownerLookup 사용)
   * ------------------------------------------------------------------- */
  function verifyOwner() {
    var no = state.accountNo;

    if (!no) {
      state.ownerName = null;
      state.verifyError = "계좌번호를 입력해 주세요.";
      state.verifiedKey = currentKey();
      render();
      return;
    }

    var owner = DB.ownerLookup[no];

    if (owner) {
      state.ownerName = owner;
      state.verifyError = null;
    } else {
      state.ownerName = null;
      state.verifyError = "계좌 정보를 확인할 수 없습니다.";
    }
    state.verifiedKey = currentKey();
    render();
  }

  /* ---------------------------------------------------------------------
   * 9. 이체 실행 — data.js 의 배열을 직접 갱신
   * ------------------------------------------------------------------- */
  function executeTransfer() {
    var v = validate();
    if (!v.canProceed) {
      goStep("info");
      render();
      return;
    }

    var account = getFromAccount();
    var fee = getFee();
    var total = state.amount + fee;

    // 잔액 차감
    account.balance = account.balance - total;

    // 거래내역 추가 (data.js 의 transactions 는 최신순이라 맨 앞에 넣습니다)
    var now = new Date();
    var pad = function (n) {
      return String(n).padStart(2, "0");
    };

    var tx = {
      id: DB.getNextTxId(),
      accountId: account.id,
      date:
        now.getFullYear() +
        "-" +
        pad(now.getMonth() + 1) +
        "-" +
        pad(now.getDate()),
      time: pad(now.getHours()) + ":" + pad(now.getMinutes()),
      desc: state.ownerName,
      type: "out",
      amount: state.amount,
      balanceAfter: account.balance,
      status: "done",
    };

    DB.transactions.unshift(tx);

    state.completed = true;

    renderDone();
    goStep("done");

    // 홈 · 거래내역 담당자가 이 이벤트를 듣고 다시 렌더링하면 됩니다.
    document.dispatchEvent(
      new CustomEvent("transfer:completed", {
        detail: { transaction: tx, account: account, fee: fee },
      })
    );
  }

  /* ---------------------------------------------------------------------
   * 10. 이벤트 바인딩
   * ------------------------------------------------------------------- */
  function bind() {
    // 출금 계좌 선택
    el.fromAccount.addEventListener("change", function (e) {
      state.fromAccountId = e.target.value;
      render();
    });

    // 받는 은행 선택
    el.recipientBank.addEventListener("change", function (e) {
      state.bankName = e.target.value;
      invalidateVerification();
      render();
    });

    // 계좌번호 입력 — 숫자만
    el.recipientAccount.addEventListener("input", function (e) {
      var digits = onlyDigits(e.target.value);
      e.target.value = digits;
      state.accountNo = digits;
      invalidateVerification();
      render();
    });

    // Enter 로도 확인
    el.recipientAccount.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        verifyOwner();
      }
    });

    // 확인하기 버튼
    el.btnVerify.addEventListener("click", verifyOwner);

    // 금액 직접 입력
    el.amountInput.addEventListener("input", function (e) {
      var digits = onlyDigits(e.target.value);
      state.amount = digits ? parseInt(digits, 10) : 0;
      e.target.value = state.amount ? formatMoney(state.amount) : "";
      render();
    });

    el.amountInput.addEventListener("blur", function () {
      el.amountInput.value = formatMoney(state.amount);
    });

    // 금액 버튼 — 이벤트 위임
    el.amountOptions.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;

      if (btn.dataset.add) {
        // +1만 / +5만 / +10만 — 현재 금액에 더합니다
        state.amount = state.amount + parseInt(btn.dataset.add, 10);
        render();
        return;
      }

      if (btn.dataset.action === "manual") {
        // 직접입력 — 입력란으로 포커스 이동 후 전체 선택
        el.amountInput.focus();
        el.amountInput.select();
      }
    });

    // 다음
    el.btnToReview.addEventListener("click", function () {
      if (el.btnToReview.disabled) return;
      renderReview();
      goStep("review");
    });

    // 이체하기
    el.btnDoTransfer.addEventListener("click", executeTransfer);

    // 이체를 완료한 뒤 다른 화면에 갔다 돌아오면 초기화
    var views = document.querySelectorAll('input[name="view"]');
    for (var i = 0; i < views.length; i++) {
      views[i].addEventListener("change", function (e) {
        if (e.target.id === "view-transfer" && state.completed) {
          resetFlow();
        }
      });
    }
  }

  /* ---------------------------------------------------------------------
   * 11. 시작
   * ------------------------------------------------------------------- */
  function init() {
    // 이체 화면 마크업이 없는 페이지에서는 아무 것도 하지 않습니다.
    if (!el.fromAccount || !el.btnToReview) return;

    renderSelects();
    bind();
    render();
    goStep("info");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();