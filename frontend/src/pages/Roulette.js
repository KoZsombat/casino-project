import "./Roulette.css";
import { spinRoulette } from "../api/roulette.js";
import { fetchBalance } from "../api/blackjack.js";
import { setupGameHeader } from "../components/GameHeader.js";
import { setupBettingTable } from "../components/roulette/BettingTable.js";
import { setupSpinButton } from "../components/roulette/Spinbutton.js";
import { setupRouletteWheel } from "../components/roulette/RouletteWheel.js";
import showAlert from "../components/showAlert.js";

export function setupRoulette(element, options = {}) {
  let balance = 0;
  let isSpinning = false;

  element.innerHTML = `
    <div class="roulette-page">
      <div id="header-container"></div>
      <h1>Rulett</h1>

      <div class="roulette-stage">
        <div class="wheel-column">
          <div id="wheel-container"></div>
          <div id="spin-container"></div>
        </div>
        <div class="table-column">
          <div id="betting-container"></div>
        </div>
      </div>
    </div>
  `;

  const header = setupGameHeader(element.querySelector("#header-container"), {
    initialBalance: balance,
    onBack: () => {
      if (options.onBack) options.onBack();
    },
  });

  fetchBalance().then((bal) => {
    if (bal !== null) {
      balance = bal;
      header.setBalance(balance);
    }
  });

  const wheel = setupRouletteWheel(element.querySelector("#wheel-container"));

  const bettingTable = setupBettingTable(
    element.querySelector("#betting-container"),
    {
      getBalance: () => balance,
      onBetsChange: (bets, costDelta) => {
        balance = balance + costDelta;
        header.setBalance(balance);
        spinButton.setEnabled(bets.length > 0 && !isSpinning);
      },
    },
  );

  const spinButton = setupSpinButton(element.querySelector("#spin-container"), {
    onSpin: handleSpin,
  });

  async function handleSpin() {
    const bets = bettingTable.getBets();
    if (bets.length === 0) return;

    isSpinning = true;
    bettingTable.setDisabled(true);
    spinButton.setEnabled(false);

    try {
      const data = await spinRoulette(bets);

      await wheel.spinTo(data.winningNumber);
      wheel.showResult(data);

      balance = data.newBalance;
      header.setBalance(balance);

      bettingTable.clear();
    } catch (err) {
      console.error("Hiba a pörgetés közben:", err);
      showAlert("Hiba történt a pörgetés közben!");
    } finally {
      isSpinning = false;
      bettingTable.setDisabled(false);
      spinButton.setEnabled(bettingTable.getBets().length > 0);
    }
  }
}
