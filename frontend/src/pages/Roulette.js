import "./Roulette.css";
import { spinRoulette } from "../api/roulette.js";
import { fetchBalance } from "../api/blackjack.js";
import { setupGameHeader } from "../components/GameHeader.js";
import { setupBettingTable } from "../components/roulette/BettingTable.js";
import { setupSpinButton } from "../components/roulette/Spinbutton.js";
import { setupRouletteWheel } from "../components/roulette/RouletteWheel.js";
import showAlert from "../components/showAlert.js";

export function setupRoulette(element, options = {}) {
  let balance = 0;        // effective balance used for chip validation
  let startingBalance = 0; // balance at start of each betting round (shown in header)
  let isSpinning = false;

  element.innerHTML = `
    <div class="roulette-page">
      <div id="header-container"></div>
      <h1>Roulette</h1>

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
    initialBalance: 0,
    onBack: () => {
      if (options.onBack) options.onBack();
    },
  });

  fetchBalance().then((bal) => {
    if (bal != null) {
      balance = bal;
      startingBalance = bal;
      header.setBalance(bal);
    }
  });

  const wheel = setupRouletteWheel(element.querySelector("#wheel-container"));

  const bettingTable = setupBettingTable(
    element.querySelector("#betting-container"),
    {
      getBalance: () => balance,
      onBetsChange: (bets, costDelta) => {
        balance = balance + costDelta;
        const totalBet = startingBalance - balance;
        header.setBalance(startingBalance);
        header.setTotalBet(totalBet);
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
      startingBalance = data.newBalance;
      header.setBalance(data.newBalance);
      header.setTotalBet(0);

      bettingTable.clear();
    } catch (err) {
      console.error("Error during spin:", err);
      // Refund the bets back to effective balance on error
      const refund = startingBalance - balance;
      balance = startingBalance;
      header.setTotalBet(0);
      showAlert("An error occurred during spin. Please try again.");
    } finally {
      isSpinning = false;
      bettingTable.setDisabled(false);
      spinButton.setEnabled(bettingTable.getBets().length > 0);
    }
  }
}
