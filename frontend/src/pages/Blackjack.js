import showAlert from "../components/showAlert.js";
import "./Blackjack.css";
import {
  startBlackjack,
  hitBlackjack,
  standBlackjack,
} from "../api/blackjack.js";
import { setupGameHeader } from "../components/GameHeader.js";
import { setupDealerHand } from "../components/DealerHand.js";
import { setupPlayerHand } from "../components/PlayerHand.js";
import { setupBetControls } from "../components/BetControls.js";
import { setupActionButtons } from "../components/ActionButtons.js";
import { setupRoundResult } from "../components/RoundResult.js";

export function setupBlackjack(element) {
  let balance = 1000;

  let gameState = {
    active: false,
    bet: 0,
    playerCards: [],
    dealerCards: [],
    playerScore: 0,
    dealerScore: 0,
    _hiddenCard: null,
  };

  element.innerHTML = `
    <div class="blackjack-page">
      <div id="header-container"></div>
      <h1>Blackjack</h1>
      <div id="dealer-container"></div>
      <div id="player-container"></div>
      <div id="bet-controls-container"></div>
      <div id="action-buttons-container"></div>
      <div id="round-result-container"></div>
    </div>
  `;

  const header = setupGameHeader(element.querySelector("#header-container"), {
    initialBalance: balance,
    onBack: () => {
      showAlert("Vissza a főoldalra (még nincs implementálva)");
    },
  });

  const dealerHand = setupDealerHand(
    element.querySelector("#dealer-container"),
  );

  const playerHand = setupPlayerHand(
    element.querySelector("#player-container"),
  );

  const betControls = setupBetControls(
    element.querySelector("#bet-controls-container"),
    {
      getBalance: () => balance,
      onStart: handleStart,
    },
  );

  const actionButtons = setupActionButtons(
    element.querySelector("#action-buttons-container"),
    {
      onHit: handleHit,
      onStand: handleStand,
    },
  );

  const roundResult = setupRoundResult(
    element.querySelector("#round-result-container"),
    {
      onNewRound: handleNewRound,
    },
  );

  async function handleStart(bet) {
    balance = balance - bet;
    header.setBalance(balance);

    betControls.hide();

    try {
      const data = await startBlackjack(bet);

      gameState = {
        active: true,
        bet: bet,
        playerCards: data.playerCards,
        dealerCards: data.dealerCards,
        playerScore: data.playerScore,
        dealerScore: data.dealerScore,
        _hiddenCard: data._hiddenCard,
      };

      dealerHand.setCards(data.dealerCards, data.dealerScore);
      playerHand.setCards(data.playerCards, data.playerScore);

      if (data.playerScore === 21) {
        await handleStand();
      } else {
        actionButtons.show();
      }
    } catch (err) {
      console.error("Hiba a kör indításakor:", err);
      showAlert("Hiba történt! Próbáld újra.");
      balance = balance + bet;
      header.setBalance(balance);
      betControls.show();
    }
  }

  async function handleHit() {
    actionButtons.setDisabled(true);

    try {
      const data = await hitBlackjack(gameState);

      gameState.playerCards = data.playerCards;
      gameState.playerScore = data.playerScore;

      playerHand.setCards(data.playerCards, data.playerScore);

      if (data.bust) {
        actionButtons.hide();
        endRound({
          result: "dealer_wins",
          payout: 0,
        });
      } else if (data.playerScore === 21) {
        await handleStand();
      } else {
        actionButtons.setDisabled(false);
      }
    } catch (err) {
      console.error("Hiba hit közben:", err);
      showAlert("Hiba történt!");
      actionButtons.setDisabled(false);
    }
  }

  async function handleStand() {
    actionButtons.setDisabled(true);
    actionButtons.hide();

    try {
      const data = await standBlackjack(gameState);

      dealerHand.setCards(data.dealerCards, data.dealerScore);

      balance = balance + data.payout;
      header.setBalance(balance);

      endRound({
        result: data.result,
        payout: data.payout,
      });
    } catch (err) {
      console.error("Hiba stand közben:", err);
      showAlert("Hiba történt!");
      actionButtons.show();
      actionButtons.setDisabled(false);
    }
  }

  function endRound(data) {
    gameState.active = false;
    roundResult.show(data);
  }

  function handleNewRound() {
    // Reset
    gameState = {
      active: false,
      bet: 0,
      playerCards: [],
      dealerCards: [],
      playerScore: 0,
      dealerScore: 0,
      _hiddenCard: null,
    };

    dealerHand.reset();
    playerHand.reset();
    roundResult.hide();
    betControls.show();
  }

  betControls.show();
}
