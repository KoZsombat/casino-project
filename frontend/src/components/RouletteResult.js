export function setupRouletteResult(element) {
  element.innerHTML = `
    <div class="current-number-display">
      <span id="current-number">-</span>
    </div>
    <div id="result"></div>
  `;

  const currentNumberEl = element.querySelector("#current-number");
  const resultEl = element.querySelector("#result");

  return {
    async animateRoll(roll) {
      resultEl.textContent = "";
      resultEl.style.color = "";

      for (let i = 0; i < roll.length - 1; i++) {
        currentNumberEl.textContent = roll[i];
        await new Promise((resolve) => globalThis.setTimeout(resolve, 70));
      }
    },

    showResult(data) {
      if (data.win) {
        resultEl.innerHTML = `🎉 Nyertél! Kifizetés: <strong>${data.payout} Ft</strong>`;
        resultEl.style.color = "#4ade80";
      } else {
        resultEl.textContent = "😢 Vesztettél. Próbáld újra!";
        resultEl.style.color = "#dc2626";
      }
    },

    reset() {
      currentNumberEl.textContent = "-";
      resultEl.textContent = "";
      resultEl.style.color = "";
    },
  };
}
