// =====================================================================
// app-account.js
// =====================================================================
//
// [이 파일의 역할]
//
// 거래내역 화면에서 필요한 기능을 담당한다.
//
// 1. 서버에서 계좌 목록을 가져온다.
// 2. 계좌 선택 탭을 만든다.
// 3. 서버에서 거래내역을 가져온다.
// 4. 전체 / 입금 / 출금 필터를 처리한다.
// 5. 계좌별 거래내역을 조회한다.
// 6. 서버가 최신순으로 보내준 거래내역을 화면에 표시한다.
// 7. 같은 날짜의 거래를 하나의 날짜 그룹으로 묶는다.
// 8. 거래를 클릭하면 상세정보가 펼쳐지도록 HTML을 만든다.
//
// 서버 주소
// http://localhost:4000
//
// 사용하는 API
//
// GET /api/accounts
// → 전체 계좌 조회
//
// GET /api/transactions
// → 전체 거래내역 조회
//
// GET /api/transactions?accountId=acc1
// → acc1 계좌 거래 조회
//
// GET /api/transactions?type=in
// → 입금 거래만 조회
//
// GET /api/transactions?accountId=acc1&type=out
// → acc1 계좌의 출금 거래 조회
//
// =====================================================================


// =====================================================================
// 1. 기본 설정
// =====================================================================


// API 서버의 기본 주소.
//
// 서버를 실행하면 server.js가 4000번 포트에서 실행되므로
//
// http://localhost:4000
//
// 을 기본 주소로 사용한다.
//
// 나중에 서버 주소가 변경되면 여기 한 곳만 수정하면 된다.
const API_BASE_URL = "http://localhost:4000";


// =====================================================================
// 2. 상태(state)
// =====================================================================
//
// 상태란 현재 화면에서 사용자가 무엇을 선택했는지
// JavaScript가 기억하고 있는 값이라고 생각하면 된다.
// =====================================================================


// 서버에서 가져온 계좌 목록을 저장한다.
//
// 처음 페이지가 열렸을 때는 아직 서버에서 데이터를 받지 않았으므로
// 빈 배열 []로 시작한다.
//
// 나중에는 다음과 같은 데이터가 들어온다.
//
// [
//   {
//     id: "acc1",
//     nickname: "우리 첫급여통장",
//     ...
//   },
//   {
//     id: "acc2",
//     nickname: "우리 SUPER주거래통장",
//     ...
//   }
// ]
let accounts = [];


// 현재 선택된 계좌.
//
// "all" = 전체 계좌
// "acc1" = 첫 번째 계좌
// "acc2" = 두 번째 계좌
// "acc3" = 세 번째 계좌
//
// 처음 화면에서는 모든 계좌의 거래를 보여주기 때문에
// 기본값을 "all"로 설정한다.
let selectedAccount = "all";


// 현재 선택된 거래 유형.
//
// "all" = 전체 거래
// "in"  = 입금
// "out" = 출금
//
// 처음에는 전체 거래를 보여준다.
let selectedType = "all";


// =====================================================================
// 3. HTML 요소 가져오기
// =====================================================================
//
// document.querySelector(), getElementById() 등을 사용하면
// JavaScript가 HTML 요소를 찾아서 조작할 수 있다.
// =====================================================================


// 계좌 탭이 들어갈 공간.
//
  // HTML:
  //
  // <select id="account-tabs" name="history-account"></select>
//
const accountTabs = document.querySelector("#account-tabs");


// 거래내역이 들어갈 공간.
//
// HTML:
//
// <div id="transaction-list"></div>
//
const transactionList = document.querySelector("#transaction-list");


// 화면 상단의 월 표시.
//
// 예:
//
// 2026년 8월
//
const historyMonthTitle = document.querySelector("#history-month-title");


// 현재 선택한 계좌 설명.
//
// 예:
//
// 전체 계좌 · 최신순
//
// 우리 첫급여통장 · 최신순
//
const historySummary = document.querySelector("#history-summary");


// 이번 달 입금 합계가 표시되는 HTML 요소
const historyInTotal = document.querySelector("#history-in-total");


// 이번 달 출금 합계가 표시되는 HTML 요소
const historyOutTotal = document.querySelector("#history-out-total");


// 기존 HTML에 만들어져 있는
//
// 전체 / 입금 / 출금
//
// radio input을 모두 가져온다.
const typeFilters = document.querySelectorAll(
  'input[name="history-type"]'
);


// =====================================================================
// 4. 금액 표시 함수
// =====================================================================
//
// 숫자를 우리나라 원화 표시 형태로 바꿔주는 함수.
//
// 예:
//
// 5800
// ↓
// "5,800원"
//
// 3200000
// ↓
// "3,200,000원"
//
// 여러 곳에서 금액을 표시해야 하므로
// 반복해서 작성하지 않고 함수로 만든다.
// =====================================================================

function formatWon(amount) {

  // Number(amount)
  // → amount를 숫자로 변환한다.
  //
  // toLocaleString("ko-KR")
  // → 한국식 천 단위 쉼표를 넣는다.
  //
  // 마지막으로 "원"을 붙인다.

  return `${Number(amount).toLocaleString("ko-KR")}원`;
}


// =====================================================================
// 5. HTML 특수문자 처리 함수
// =====================================================================
//
// 서버에서 받은 문자열을 innerHTML 안에 넣기 때문에
// <, >, ", ' 같은 문자를 안전한 HTML 문자로 바꿔준다.
//
// 예:
//
// "<script>"
//
// 같은 문자열이 데이터에 들어오더라도
// 실제 HTML 태그로 실행되지 않도록 방지하는 역할이다.
//
// 실습 프로젝트에서는 크게 체감되지 않을 수 있지만
// 서버 데이터를 HTML에 넣을 때 좋은 습관이다.
// =====================================================================

function escapeHTML(value) {

  return String(value)

    // & 문자를 HTML 문자로 변경
    .replaceAll("&", "&amp;")

    // < 문자 변경
    .replaceAll("<", "&lt;")

    // > 문자 변경
    .replaceAll(">", "&gt;")

    // 큰따옴표 변경
    .replaceAll('"', "&quot;")

    // 작은따옴표 변경
    .replaceAll("'", "&#039;");
}


// =====================================================================
// 6. 계좌 ID로 계좌 정보 찾기
// =====================================================================
//
// transaction에는 계좌 이름이 직접 들어있지 않다.
//
// 거래 데이터:
//
// {
//   accountId: "acc1"
// }
//
// 계좌 데이터:
//
// {
//   id: "acc1",
//   nickname: "우리 첫급여통장"
// }
//
// 따라서 transaction.accountId와 account.id를 비교해서
// 해당 거래가 어떤 계좌인지 찾아야 한다.
// =====================================================================

function getAccountById(accountId) {

  return accounts.find((account) => {

    return account.id === accountId;

  });
}


// =====================================================================
// 7. 계좌 목록 가져오기
// =====================================================================
//
// 서버의
//
// GET /api/accounts
//
// API를 호출해서 전체 계좌 목록을 가져온다.
//
// async
// → 이 함수 안에서 비동기 처리를 하겠다는 의미.
//
// await
// → Promise 결과가 올 때까지 기다린 뒤 다음 줄을 실행한다.
// =====================================================================

async function loadAccounts() {

  // 서버에 계좌 목록 요청
  const response = await fetch(`${API_BASE_URL}/api/accounts`);


  // HTTP 요청 자체는 성공했지만
  // 서버가 404, 500 같은 오류를 반환할 수도 있다.
  //
  // response.ok가 false면 오류로 처리한다.
  if (!response.ok) {

    throw new Error(
      `계좌 목록 조회 실패: ${response.status}`
    );

  }


  // 서버가 보내준 JSON 데이터를
  // JavaScript 객체/배열 형태로 변환한다.
  const data = await response.json();


  // 서버에서 받은 계좌 목록을
  // 전역 상태 accounts에 저장한다.
  accounts = data;


  // 계좌 데이터를 받았으므로
  // 화면에 계좌 탭을 만든다.
  renderAccountTabs();
}


// =====================================================================
// 8. 계좌 탭 만들기
// =====================================================================
//
// accounts에 들어있는 계좌 데이터를 사용해서
// 계좌 선택 탭을 동적으로 만든다.
//
// 예:
//
// [전체 계좌]
// [우리 첫급여통장]
// [우리 SUPER주거래통장]
// [우리 청년도약계좌]
//
// HTML에 계좌를 직접 작성하지 않는 이유는
// 서버의 계좌 데이터가 바뀌더라도 자동으로 대응하기 위해서다.
// =====================================================================

function renderAccountTabs() {

  // HTML에 account-tabs가 없다면
  // 아래 코드를 실행할 수 없으므로 종료한다.
  if (!accountTabs) {

    console.error(
      "HTML에서 #account-tabs 요소를 찾을 수 없습니다."
    );

    return;
  }


  let html = `
    <option value="all" ${selectedAccount === "all" ? "selected" : ""}>
      전체 계좌
    </option>
  `;


  // ---------------------------------------------------------------
  // 실제 계좌 탭
  // ---------------------------------------------------------------
  //
  // accounts.map()
  //
  // accounts 배열의 계좌 하나하나를
  // HTML 문자열로 변경한다.
  //
  // 마지막 join("")
  //
  // 만들어진 여러 HTML 문자열을 하나로 합친다.
  // ---------------------------------------------------------------

  html += accounts
    .map((account) => {

      return `
        <option
          value="${escapeHTML(account.id)}"
          ${selectedAccount === account.id ? "selected" : ""}
        >
          ${escapeHTML(account.nickname)}
        </option>
      `;

    })
    .join("");


  // 완성된 HTML을 account-tabs 안에 넣는다.
  accountTabs.innerHTML = html;
}


// =====================================================================
// 9. 현재 필터 조건에 맞는 거래내역 API 주소 만들기
// =====================================================================
//
// 사용자가 어떤 필터를 선택했는지에 따라
// 서버 요청 URL을 변경한다.
//
// 예 1.
//
// 전체 계좌 + 전체 거래
//
// /api/transactions
//
//
// 예 2.
//
// acc1 + 전체
//
// /api/transactions?accountId=acc1
//
//
// 예 3.
//
// 전체 계좌 + 입금
//
// /api/transactions?type=in
//
//
// 예 4.
//
// acc1 + 출금
//
// /api/transactions?accountId=acc1&type=out
//
// =====================================================================

function createTransactionUrl() {

  // URLSearchParams는
  // URL의 ? 뒤에 붙는 query string을 편리하게 만들어주는 객체다.
  const params = new URLSearchParams();


  // 전체 계좌가 아니라 특정 계좌가 선택된 경우에만
  //
  // accountId=acc1
  //
  // 같은 조건을 URL에 추가한다.
  if (selectedAccount !== "all") {

    params.set("accountId", selectedAccount);

  }


  // 전체 거래가 아니라 입금/출금이 선택되었을 때만
  //
  // type=in
  //
  // 또는
  //
  // type=out
  //
  // 조건을 추가한다.
  if (selectedType !== "all") {

    params.set("type", selectedType);

  }


  // URLSearchParams를 실제 문자열로 변경한다.
  //
  // 예:
  //
  // accountId=acc1&type=out
  const queryString = params.toString();


  // queryString이 존재하면 ?를 붙여서 반환한다.
  if (queryString) {

    return `${API_BASE_URL}/api/transactions?${queryString}`;

  }


  // 아무 필터도 없다면
  // 전체 거래내역 API 주소를 반환한다.
  return `${API_BASE_URL}/api/transactions`;
}


// =====================================================================
// 10. 거래내역 가져오기
// =====================================================================
//
// 현재 선택된
//
// selectedAccount
// selectedType
//
// 값을 기반으로 서버에서 거래내역을 가져온다.
//
// 여기서는 JavaScript에서 다시 sort()하지 않는다.
//
// 이유:
// server.js의 /api/transactions에서 이미
// date + time 기준 최신순 정렬을 수행하고 있기 때문이다.
// =====================================================================

async function loadTransactions() {

  // 거래내역 영역이 존재하지 않으면 함수 종료
  if (!transactionList) {

    console.error(
      "HTML에서 #transaction-list 요소를 찾을 수 없습니다."
    );

    return;
  }


  // 데이터를 가져오는 동안
  // 사용자에게 로딩 상태를 보여준다.
  transactionList.innerHTML = `
    <p class="history-hint">
      거래내역을 불러오는 중입니다.
    </p>
  `;


  try {

    // 현재 필터에 맞는 API 주소 생성
    const url = createTransactionUrl();


    // 서버에 거래내역 요청
    const response = await fetch(url);


    // 서버 오류 검사
    if (!response.ok) {

      throw new Error(
        `거래내역 조회 실패: ${response.status}`
      );

    }


    // JSON → JavaScript 배열
    const transactions = await response.json();


    // 받아온 거래내역을 실제 화면에 출력한다.
    renderTransactions(transactions);


    // 현재 어떤 계좌를 조회 중인지
    // 상단 설명을 업데이트한다.
    updateHistorySummary();

  } catch (error) {

    // fetch 또는 서버 처리 과정에서 오류가 발생하면
    // 사용자 화면에 오류 메시지를 표시한다.
    transactionList.innerHTML = `
      <p class="history-hint">
        거래내역을 불러오지 못했습니다.
      </p>
    `;


    // 개발자는 Console에서 실제 오류 내용을 확인할 수 있다.
    console.error(error);
  }
}


// =====================================================================
// 11. 거래내역을 날짜별로 묶기
// =====================================================================
//
// 서버에서는 거래내역이 이런 배열로 온다.
//
// [
//   { date: "2026-08-23", ... },
//   { date: "2026-08-22", ... },
//   { date: "2026-08-22", ... },
//   { date: "2026-08-21", ... }
// ]
//
// 이것을:
//
// 8월 23일
//   거래1
//
// 8월 22일
//   거래2
//   거래3
//
// 8월 21일
//   거래4
//
// 형태로 보여주기 위해 날짜별로 묶는다.
// =====================================================================

function groupTransactionsByDate(transactions) {

  // Map은 key-value 형태로 데이터를 저장할 수 있다.
  //
  // key   = 날짜
  // value = 해당 날짜의 거래 배열
  const groups = new Map();


  transactions.forEach((transaction) => {

    const date = transaction.date;


    // 해당 날짜가 아직 Map에 없다면
    // 빈 배열을 먼저 만든다.
    if (!groups.has(date)) {

      groups.set(date, []);

    }


    // 해당 날짜 배열에 거래를 추가한다.
    groups.get(date).push(transaction);

  });


  return groups;
}


// =====================================================================
// 12. 날짜 제목 표시 함수
// =====================================================================
//
// "2026-08-23"
//
// 같은 값을
//
// "8월 23일"
//
// 형태로 바꿔준다.
//
// 오늘 날짜라면
//
// "오늘 · 9월 7일"
//
// 어제라면
//
// "어제 · 9월 6일"
//
// 형태로 표시한다.
// =====================================================================

function formatDayHeading(dateString) {

  // "2026-08-23"을 "-" 기준으로 나눈다.
  const [year, month, day] = dateString
    .split("-")
    .map(Number);


  // 오늘 날짜 객체
  const today = new Date();


  // 어제 날짜 객체
  const yesterday = new Date();

  yesterday.setDate(
    yesterday.getDate() - 1
  );


  // Date 객체를 YYYY-MM-DD 형태로 변경하는 내부 함수
  function formatLocalDate(date) {

    const y = date.getFullYear();

    const m = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const d = String(
      date.getDate()
    ).padStart(2, "0");


    return `${y}-${m}-${d}`;
  }


  const todayString = formatLocalDate(today);

  const yesterdayString = formatLocalDate(yesterday);


  if (dateString === todayString) {

    return `오늘 · ${month}월 ${day}일`;

  }


  if (dateString === yesterdayString) {

    return `어제 · ${month}월 ${day}일`;

  }


  return `${month}월 ${day}일`;
}


// =====================================================================
// 13. 거래 하나를 HTML로 만들기
// =====================================================================
//
// transaction 하나를 받아서
//
// <details>
//   <summary>
//      거래 기본정보
//   </summary>
//
//   거래 상세정보
// </details>
//
// 구조로 만든다.
//
// 기존 HTML 디자인이 이미 details / summary 방식을 사용하고 있으므로
// 동일한 구조를 유지한다.
// =====================================================================

function createTransactionHTML(transaction) {

  // ---------------------------------------------------------------
  // 해당 거래가 어느 계좌인지 찾는다.
  // ---------------------------------------------------------------

  const account = getAccountById(
    transaction.accountId
  );


  // 계좌를 정상적으로 찾았다면 실제 계좌 이름 사용
  //
  // 찾지 못했다면 accountId를 임시 표시
  const accountName = account
    ? account.nickname
    : transaction.accountId;


  // 계좌번호도 동일한 방식으로 처리
  const accountNo = account
    ? account.accountNo
    : "-";


  // ---------------------------------------------------------------
  // 입금인지 출금인지 판단
  // ---------------------------------------------------------------

  const isIncome = transaction.type === "in";


  // 입금이면 +
  // 출금이면 −
  const sign = isIncome
    ? "+"
    : "−";


  // 화면에 표시할 유형 한글명
  const typeText = isIncome
    ? "입금"
    : "출금";


  // ---------------------------------------------------------------
  // CSS 클래스 결정
  // ---------------------------------------------------------------
  //
  // 기존 CSS에서
  //
  // in-record
  // out-record
  //
  // 클래스를 사용하고 있기 때문에 그대로 사용한다.
  // ---------------------------------------------------------------

  const recordClass = isIncome
    ? "in-record"
    : "out-record";


  // 입금 금액은 기존 CSS의 income 클래스를 사용한다.
  const amountClass = isIncome
    ? "transaction-amount income"
    : "transaction-amount";


  // 아이콘 색상
  const iconClass = isIncome
    ? "transaction-icon green"
    : "transaction-icon blue";


  // SVG 아이콘 종류
  const iconId = isIncome
    ? "#i-arrow-in"
    : "#i-arrow-out";


  // ---------------------------------------------------------------
  // 거래 상태
  // ---------------------------------------------------------------

  const statusText =
    transaction.status === "done"
      ? "거래 완료"
      : "처리 중";


  const statusClass =
    transaction.status === "done"
      ? "status-done"
      : "";


  // ---------------------------------------------------------------
  // 최종 HTML 생성
  // ---------------------------------------------------------------

  return `
    <details class="transaction-detail ${recordClass}">

      <summary class="transaction">

        <span class="${iconClass}">
          <svg class="icon" aria-hidden="true">
            <use href="${iconId}"></use>
          </svg>
        </span>


        <span class="transaction-info">

          <strong>
            ${escapeHTML(transaction.desc)}
          </strong>

          <small>
            ${escapeHTML(transaction.time)} · ${typeText}
          </small>

        </span>


        <span class="${amountClass}">

          ${sign}${formatWon(transaction.amount)}

          <small>
            ${formatWon(transaction.balanceAfter)}
          </small>

        </span>

      </summary>


      <div class="transaction-more">

        <dl>

          <div class="detail-line">
            <dt>거래 계좌</dt>
            <dd>${escapeHTML(accountName)}</dd>
          </div>


          <div class="detail-line">
            <dt>계좌번호</dt>
            <dd>${escapeHTML(accountNo)}</dd>
          </div>


          <div class="detail-line">
            <dt>거래일시</dt>
            <dd>
              ${escapeHTML(transaction.date)}
              ${escapeHTML(transaction.time)}
            </dd>
          </div>


          <div class="detail-line">
            <dt>거래 후 잔액</dt>
            <dd>
              ${formatWon(transaction.balanceAfter)}
            </dd>
          </div>


          <div class="detail-line">
            <dt>상태</dt>

            <dd class="${statusClass}">
              ${statusText}
            </dd>
          </div>

        </dl>

      </div>

    </details>
  `;
}


// =====================================================================
// 14. 전체 거래내역 화면 출력
// =====================================================================
//
// 서버에서 받은 transactions 배열을 실제 화면에 출력한다.
//
// 1. 거래가 없으면 안내문 표시
// 2. 날짜별로 그룹화
// 3. 날짜 제목 생성
// 4. 해당 날짜 거래 HTML 생성
// 5. transaction-list에 삽입
// =====================================================================

function renderTransactions(transactions) {

  // 거래가 하나도 없는 경우
  if (transactions.length === 0) {

    transactionList.innerHTML = `
      <p class="history-hint">
        조건에 맞는 거래내역이 없습니다.
      </p>
    `;

    return;
  }


  // 거래를 날짜별로 묶는다.
  const groupedTransactions =
    groupTransactionsByDate(transactions);


  // 최종적으로 transaction-list에 넣을 HTML 문자열
  let html = "";


  // Map을 순회한다.
  //
  // 서버에서 이미 최신순으로 정렬되어 오기 때문에
  // Map에 들어가는 날짜 순서 역시 최신순이다.
  groupedTransactions.forEach(
    (dailyTransactions, date) => {

      // 해당 날짜의 모든 거래를 HTML로 만든다.
      const transactionHTML =
        dailyTransactions
          .map((transaction) => {

            return createTransactionHTML(
              transaction
            );

          })
          .join("");


      // 날짜 그룹 HTML 생성
      html += `
        <section
          class="day-group"
          aria-label="${escapeHTML(date)}"
        >

          <h2 class="day-heading">
            ${formatDayHeading(date)}
          </h2>


          <div class="day-transactions">

            ${transactionHTML}

          </div>

        </section>
      `;

    }
  );


  // 최종 결과를 화면에 출력
  transactionList.innerHTML = html;
}


// =====================================================================
// 15. 현재 선택된 계좌 표시
// =====================================================================
//
// 거래내역 상단의
//
// "전체 계좌 · 최신순"
//
// 부분을 현재 선택한 계좌에 맞게 변경한다.
// =====================================================================

function updateHistorySummary() {

  if (!historySummary) {

    return;
  }


  // 전체 계좌 선택
  if (selectedAccount === "all") {

    historySummary.textContent =
      "전체 계좌 · 최신순";

    return;
  }


  // 특정 계좌 선택
  const account = getAccountById(
    selectedAccount
  );


  if (account) {

    historySummary.textContent =
      `${account.nickname} · 최신순`;

  }
}


// =====================================================================
// 16. 월간 입금/출금 합계 조회
// =====================================================================
//
// 상단에:
//
// 이번 달 입금
// 이번 달 출금
//
// 정보를 표시하기 위한 함수.
//
// 중요:
//
// 입금/출금 필터(selectedType)는 사용하지 않는다.
//
// 예를 들어 사용자가 "입금" 버튼을 눌렀다고 해서
// 출금 총액이 0원이 되어서는 안 되기 때문이다.
//
// 계좌 선택 조건만 적용해서 해당 계좌의 모든 거래를 가져온다.
// =====================================================================

async function loadOverview() {

  try {

    const params =
      new URLSearchParams();


    // 특정 계좌가 선택된 경우에만 accountId 추가
    if (selectedAccount !== "all") {

      params.set(
        "accountId",
        selectedAccount
      );

    }


    const queryString =
      params.toString();


    const url = queryString
      ? `${API_BASE_URL}/api/transactions?${queryString}`
      : `${API_BASE_URL}/api/transactions`;


    const response =
      await fetch(url);


    if (!response.ok) {

      throw new Error(
        `거래 합계 조회 실패: ${response.status}`
      );

    }


    const transactions =
      await response.json();


    updateOverview(
      transactions
    );

  } catch (error) {

    console.error(error);

  }
}


// =====================================================================
// 17. 상단 월/입금합계/출금합계 업데이트
// =====================================================================

function updateOverview(transactions) {

  // 거래가 하나도 없다면
  if (transactions.length === 0) {

    if (historyInTotal) {

      historyInTotal.textContent = "0원";

    }


    if (historyOutTotal) {

      historyOutTotal.textContent = "0원";

    }


    return;
  }


  // 서버가 최신순으로 데이터를 보내기 때문에
  // 첫 번째 거래의 날짜가 가장 최근 날짜다.
  //
  // 예:
  //
  // "2026-08-23"
  //
  const latestDate =
    transactions[0].date;


  // YYYY-MM 부분만 사용
  //
  // "2026-08"
  //
  const targetMonth =
    latestDate.slice(0, 7);


  // 화면에 보여줄 월
  const [year, month] =
    targetMonth.split("-");


  if (historyMonthTitle) {

    historyMonthTitle.textContent =
      `${year}년 ${Number(month)}월`;

  }


  // 최신 거래가 존재하는 월의 거래만 선택
  const monthlyTransactions =
    transactions.filter(
      (transaction) => {

        return transaction.date.startsWith(
          targetMonth
        );

      }
    );


  // 입금 합계
  const totalIn =
    monthlyTransactions

      .filter((transaction) => {

        return transaction.type === "in";

      })

      .reduce(
        (sum, transaction) => {

          return sum + transaction.amount;

        },
        0
      );


  // 출금 합계
  const totalOut =
    monthlyTransactions

      .filter((transaction) => {

        return transaction.type === "out";

      })

      .reduce(
        (sum, transaction) => {

          return sum + transaction.amount;

        },
        0
      );


  if (historyInTotal) {

    historyInTotal.textContent =
      formatWon(totalIn);

  }


  if (historyOutTotal) {

    historyOutTotal.textContent =
      formatWon(totalOut);

  }
}


// =====================================================================
// 18. 입금/출금 필터 이벤트 연결
// =====================================================================
//
// 기존 HTML의
//
// 전체
// 입금
// 출금
//
// radio 버튼이 변경될 때 실행된다.
// =====================================================================

function setupTypeFilterEvents() {

  typeFilters.forEach((radio) => {

    radio.addEventListener(
      "change",
      async (event) => {

        // 선택되지 않은 radio 이벤트는 처리하지 않는다.
        if (!event.target.checked) {

          return;

        }


        // value 값을 현재 거래 유형 상태에 저장한다.
        //
        // all / in / out
        selectedType =
          event.target.value;


        // 새로운 필터 조건으로
        // 거래내역을 서버에서 다시 받아온다.
        await loadTransactions();

      }
    );

  });
}


// =====================================================================
// 19. 계좌 탭 이벤트 연결
// =====================================================================
//
// 계좌 탭은 서버 데이터를 받은 뒤 동적으로 만들어진다.
//
// 따라서 각각의 radio에 이벤트를 따로 붙이기보다
// 부모인 #account-tabs에 change 이벤트를 한 번만 등록한다.
//
// 이것을 "이벤트 위임" 방식이라고 이해하면 된다.
// =====================================================================

function setupAccountTabEvent() {

  if (!accountTabs) {

    return;
  }


  accountTabs.addEventListener(
    "change",
    async (event) => {

      // history-account radio가 아니면 무시
      if (
        event.target.name !==
        "history-account"
      ) {

        return;
      }


      // 선택된 계좌 ID를 상태에 저장
      //
      // all
      // acc1
      // acc2
      // acc3
      selectedAccount =
        event.target.value;


      // 계좌가 변경되었으므로
      // 상단 입출금 합계도 다시 조회한다.
      await loadOverview();


      // 선택한 계좌에 맞는 거래내역 재조회
      await loadTransactions();

    }
  );
}


// =====================================================================
// 20. 거래내역 화면에 들어올 때 새로 조회
// =====================================================================
//
// 향후 다른 팀원이 이체 기능을 구현하면
// 서버의 transactions 배열에 새로운 거래가 추가된다.
//
// 따라서 사용자가 거래내역 탭에 들어왔을 때
// 한 번 더 데이터를 조회해주면
// 최신 거래가 바로 화면에 반영될 수 있다.
// =====================================================================

function setupHistoryRefreshEvent() {

  const historyView =
    document.querySelector("#view-history");


  if (!historyView) {

    return;
  }


  historyView.addEventListener(
    "change",
    async () => {

      // 실제로 거래내역 화면이 선택됐을 때만 실행
      if (!historyView.checked) {

        return;

      }


      await loadOverview();

      await loadTransactions();

    }
  );
}


// =====================================================================
// 21. 이체 완료 후 거래내역 갱신
// =====================================================================
//
// transfer.js는 이체가 성공하면 transfer:completed 이벤트를 발생시킨다.
// 이 이벤트를 받아 합계와 목록을 함께 다시 조회해야 이체 직후에도
// 거래내역 화면의 금액이 최신 상태로 유지된다.
// =====================================================================


function setupTransferCompletedEvent() {

  document.addEventListener(
    "transfer:completed",
    async () => {

      await Promise.all([
        loadOverview(),
        loadTransactions(),
      ]);

    }
  );
}


// =====================================================================
// 22. 최초 실행 함수
// =====================================================================
//
// 페이지가 처음 열렸을 때 필요한 작업을 순서대로 수행한다.
//
// 실행 순서:
//
// 이벤트 준비
// ↓
// 계좌 데이터 조회
// ↓
// 계좌 탭 생성
// ↓
// 월간 합계 조회
// ↓
// 거래내역 조회
// ↓
// 화면 출력
//
// =====================================================================

async function initAccount() {

  try {

    // 기존 전체/입금/출금 버튼 이벤트 연결
    setupTypeFilterEvents();


    // 계좌 탭 이벤트 연결
    setupAccountTabEvent();


    // 거래내역 화면 진입 시 새로고침 이벤트
    setupHistoryRefreshEvent();


    // 이체 성공 시 합계와 거래내역을 즉시 갱신
    setupTransferCompletedEvent();


    // ---------------------------------------------------------------
    // 계좌 데이터를 먼저 가져온다.
    // ---------------------------------------------------------------
    //
    // 거래 상세 화면에서
    //
    // accountId → 계좌 이름
    //
    // 변환이 필요하기 때문에 계좌 목록을 먼저 받아야 한다.
    //
    await loadAccounts();


    // 월간 입출금 합계 표시
    await loadOverview();


    // 실제 거래내역 표시
    await loadTransactions();


  } catch (error) {

    // 초기 실행 과정에서 발생한 오류
    console.error(
      "거래내역 화면 초기화 실패:",
      error
    );


    if (transactionList) {

      transactionList.innerHTML = `
        <p class="history-hint">
          거래내역 화면을 불러오지 못했습니다.
        </p>
      `;

    }
  }
}


// =====================================================================
// 23. app-account.js 시작
// =====================================================================
//
// 위에서 함수들을 정의만 해두었기 때문에
// 마지막으로 initAccount()를 실행해야 실제 프로그램이 시작된다.
// =====================================================================

initAccount();
