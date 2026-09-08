/* ==========================================================================
   아래는 이체 화면용으로 추가한 부분입니다. 위 코드는 수정하지 않았습니다.

   위의 request() 는 응답이 실패하면 본문을 버리고 상태 코드만 남깁니다.
   이체는 서버가 400 으로 주는 "잔액이 부족합니다" 같은 메시지를 화면에
   그대로 보여줘야 하므로, 본문을 살리는 함수를 따로 두었습니다.
   ========================================================================== */

async function requestWithMessage(path, options, signal) {
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, signal });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(body.message ?? `API request failed: ${response.status}`);
    error.status = response.status;
    error.serverMessage = body.message ?? null;
    throw error;
  }

  return body;
}

/* GET /api/transfer/lookup — 예금주 실명조회
   성공: { ownerName } / 실패: 404 + { message } */
export function lookupOwner({ bank, accountNo }, signal) {
  const query = new URLSearchParams({ bank, accountNo });
  return requestWithMessage(`/api/transfer/lookup?${query}`, { method: "GET" }, signal);
}

/* POST /api/transfers — 이체 실행
   성공: 201 + { transaction, account }
   실패: 400 잔액부족·최소금액미만·필드누락 / 404 계좌없음 */
export function createTransfer(payload, signal) {
  return requestWithMessage(
    "/api/transfers",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    signal
  );
}