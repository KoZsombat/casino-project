export function setupGameHeader(element, options) {
  element.innerHTML = `
    <div class="game-header">
      <button id="back-btn" class="back-btn">← Back</button>
      <div class="balance-display">
        Balance: <span id="balance">$0</span><span id="bet-deduction" style="display:none"> &ndash; <span id="bet-amount">$0</span></span>
      </div>
    </div>
  `;

  const balanceEl = element.querySelector("#balance");
  const betDeduction = element.querySelector("#bet-deduction");
  const betAmountEl = element.querySelector("#bet-amount");
  const backBtn = element.querySelector("#back-btn");

  backBtn.addEventListener("click", () => {
    if (options.onBack) options.onBack();
  });

  return {
    setBalance(newBalance) {
      const val = parseFloat(newBalance);
      balanceEl.textContent = `$${(Number.isFinite(val) ? Math.round(val) : 0).toLocaleString("en-US")}`;
    },
    setTotalBet(amount) {
      if (amount > 0) {
        betAmountEl.textContent = `$${Math.round(amount).toLocaleString("en-US")}`;
        betDeduction.style.display = "";
      } else {
        betDeduction.style.display = "none";
      }
    },
  };
}
