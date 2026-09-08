# 거래내역 페이지 React 전환 가이드

## 담당 범위

`TransactionsScreen`은 전체 거래내역 조회와 필터링을 담당한다.

- 계좌 탭 선택
- 전체, 입금, 출금 필터
- 선택 계좌의 월간 입금 및 출금 합계
- 최신순 거래 목록과 날짜별 그룹화
- 거래별 인라인 상세 펼침
- 빈 목록, 로딩, 오류 상태 표시

## 상위 컴포넌트 계약

`App.jsx`는 여러 화면이 공유하는 상태를 관리한다.

```jsx
<TransactionsScreen
  accounts={accounts}
  transactions={transactions}
  isLoading={isLoading}
  error={loadError}
/>
```

| Props | 설명 |
| --- | --- |
| `accounts` | 전체 계좌 목록 |
| `transactions` | 전체 거래 목록 |
| `isLoading` | 공통 데이터 로딩 상태 |
| `error` | 공통 데이터 로드 오류 |

`App.jsx`의 전역 상태는 `activeView`, `accounts`, `transactions`다. 현재 임시 `App.jsx`는 거래내역 화면을 기본값으로 렌더링한다.

## 거래내역 내부 상태

| 상태 | 기본값 | 설명 |
| --- | --- | --- |
| `selectedAccountId` | `"all"` | 선택한 계좌 ID. 전체 계좌 포함 |
| `typeFilter` | `"all"` | 거래 유형: `all`, `in`, `out` |
| `openTxId` | `null` | 인라인 상세가 열린 거래 ID |

## 필터 및 합계 흐름

1. 전체 거래에서 선택 계좌 기준 거래를 구한다.
2. 선택 계좌의 전체 거래를 기준으로 최신 거래 월의 입금 및 출금 합계를 계산한다.
3. 계좌 필터 결과에 전체, 입금, 출금 필터를 적용한다.
4. 최종 거래를 날짜별로 그룹화해 렌더링한다.

월간 합계에는 거래 유형 필터를 적용하지 않는다. 입금 또는 출금만 보는 중에도 두 합계는 유지된다.

## 공통 컴포넌트

### `TransactionRow`

홈 최근 거래와 거래내역 목록이 공유하는 행 내용이다.

- 입출금 아이콘
- 거래 설명
- 거래 시각과 유형
- 거래 금액
- 거래 후 잔액

홈은 일반 목록 또는 모달 실행 컨테이너를 사용하고, 거래내역은 `details`를 사용한다. 따라서 바깥 껍데기는 공유하지 않는다.

### `TransactionDetailContent`

홈 상세 모달과 거래내역 인라인 상세가 공유하는 상세 정보다.

1. 거래 계좌
2. 계좌번호
3. 거래일시
4. 거래 후 잔액
5. 상태

모달과 인라인 상세의 껍데기는 각 화면에서 구현하고, 상세 정보만 공유한다.

### `AccountTabs`

거래내역 전용 계좌 선택 탭이다. 전체 계좌와 API에서 받은 계좌 목록을 렌더링한다.

## 파일 구성

```text
src/
├─ App.jsx
├─ main.jsx
├─ api/banking.js
├─ components/
│  ├─ AccountTabs.jsx
│  ├─ TransactionDetailContent.jsx
│  └─ TransactionRow.jsx
├─ screens/TransactionsScreen.jsx
├─ styles/transactions.css
└─ utils/transactions.js
```

기존 `app-account.js`와 정적 목업 HTML은 수정하지 않는다. React 앱 전환 완료 후 담당자 합의에 따라 제거한다.
