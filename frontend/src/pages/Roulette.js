import "./Roulette.css";
import { spinRoulette } from "../api/roulette.js";
import { setupGameHeader } from "../components/GameHeader.js";
import { setupBettingTable } from "../components/roulette/BettingTable.js";
import { setupSpinButton } from "../components/roulette/Spinbutton.js";
import { setupRouletteResult } from "../components/roulette/RouletteResult.js";
import showAlert from "../components/showAlert.js";

export function setupRoulette(element) {
  let balance = 1000;
  let isSpinning = false;

  element.innerHTML = `
    <div class="roulette-page">
      <div id="header-container"></div>
      <h1>Rulett</h1>
      <div id="result-container"></div>
      <div id="betting-container"></div>
      <div id="spin-container"></div>
    </div>
  `;

  const header = setupGameHeader(element.querySelector("#header-container"), {
    initialBalance: balance,
    onBack: () => {
      console.log("Vissza gomb megnyomva");
      showAlert("Vissza a főoldalra (még nincs implementálva)");
    },
  });

  const result = setupRouletteResult(
    element.querySelector("#result-container"),
  );

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

    // 1. LOCK
    isSpinning = true;
    bettingTable.setDisabled(true);
    spinButton.setEnabled(false);

    try {
      const data = await spinRoulette(bets);

      await result.animateRoll(data.roll);

      result.showResult(data);

      balance = balance + data.payout;
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
