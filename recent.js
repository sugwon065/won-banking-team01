fetch("http://localhost:4000/api/transactions?limit=3")
    .then(res => res.json())
    .then(data => {
      console.log("받아온 데이터:", data);
      renderTransactions(data);
    });

  function renderTransactions(list) {
    const container = document.querySelector(".transaction-list");
    container.innerHTML = list.map(tx => `
      <div class="transaction">
        <div class="transaction-info">
          <strong>${tx.desc}</strong><small>${tx.date.slice(5).replace('-', '.')} · ${tx.type === "out" ? "출금" : "입금"}</small>
        </div>
        <span class="transaction-amount">
          <span class="unmasked">${tx.type === "out" ? "−" : "+"}${tx.amount.toLocaleString("ko-KR")}원</span>
          <span class="masked">금액 숨김</span>
        </span>
      </div>
    `).join("");
  }