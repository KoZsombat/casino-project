import showAlert from "../showAlert.js";
export function setupBetControls(element, options) {
  element.innerHTML = `
    <div class="bet-controls">
      <h2>Új kör</h2>
      <input type="number" id="bet-amount" placeholder="Tét összege" min="1" />
      <button id="start-btn">Kör indítása</button>
    </div>
  `;

  const betAmountEl = element.querySelector("#bet-amount");
  const startBtn = element.querySelector("#start-btn");

  startBtn.addEventListener("click", () => {
    const bet = parseInt(betAmountEl.value);

    if (!bet || bet <= 0) {
      showAlert("Adj meg érvényes tét összeget!");
      return;
    }

    const balance = options.getBalance();
    if (bet > balance) {
      showAlert("Nincs elég egyenleged!");
      return;
    }

    if (options.onStart) {
      options.onStart(bet);
    }

    betAmountEl.value = "";
  });

  return {
    show() {
      element.style.display = "block";
    },
    hide() {
      element.style.display = "none";
    },
  };
}
