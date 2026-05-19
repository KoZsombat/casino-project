import showAlert from "../components/showAlert.js";
import "./Blackjack.css";
import {
  startBlackjack,
  hitBlackjack,
  standBlackjack,
  calculateScore,
  fetchBalance,
} from "../api/blackjack.js";
import { setupGameHeader } from "../components/GameHeader.js";
import { setupDealerHand } from "../components/blackjack/DealerHand.js";
import { setupPlayerHand } from "../components/blackjack/PlayerHand.js";
import { setupBetControls } from "../components/blackjack/BetControls.js";
import { setupActionButtons } from "../components/blackjack/ActionButtons.js";
import { setupRoundResult } from "../components/blackjack/RoundResult.js";

const DEALER_DRAW_DELAY = 550;
const REVEAL_DELAY = 450;

function wait(ms) {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}

export function setupBlackjack(element, options = {}) {
  let balance = 0;

  let gameState = createInitialState();

  function createInitialState() {
    return {
      active: false,
      initialBet: 0,
      hands: [],
      activeHandIndex: 0,
      dealerCards: [],
      dealerScore: 0,
    };
  }

  element.innerHTML = `
    <div class="blackjack-page">
      <div id="header-container"></div>
      <h1>Blackjack</h1>
      <div class="table-banner">BLACKJACK PAYS 3 TO 2</div>
      <div class="table-divider"></div>
      <div id="dealer-container"></div>
      <div id="player-container"></div>
      <div id="action-buttons-container"></div>
      <div id="bet-controls-container"></div>
      <div id="round-result-container"></div>
    </div>
  `;

  const pageEl = element.querySelector(".blackjack-page");

  const header = setupGameHeader(element.querySelector("#header-container"), {
    initialBalance: balance,
    onBack: () => {
      if (options.onBack) options.onBack();
    },
  });

  fetchBalance().then((bal) => {
    if (bal != null) {
      balance = bal;
      header.setBalance(balance);
      betControls.refreshChips();
    }
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
      onDouble: () => {},
      onSplit: () => {},
    },
  );

  const roundResult = setupRoundResult(
    element.querySelector("#round-result-container"),
    {
      onNewRound: handleNewRound,
    },
  );

  function activeHand() {
    return gameState.hands[gameState.activeHandIndex];
  }

  function updateCompactMode() {
    const manyCards = gameState.hands.some((h) => h.cards.length >= 4);
    pageEl.classList.toggle("compact", manyCards);
  }

  function renderPlayer() {
    updateCompactMode();
    const hand = gameState.hands[0];
    playerHand.setCards(hand?.cards ?? [], hand?.score ?? null, {});
  }

  function refreshActionButtons() {
    const hand = activeHand();
    if (!hand || hand.finished) {
      actionButtons.hide();
      return;
    }

    actionButtons.show({
      canHit: !hand.finished,
      canStand: !hand.finished,
      canDouble: false,
      canSplit: false,
      showDouble: false,
      showSplit: false,
    });
  }

  async function handleStart(bet) {
    balance -= bet;
    header.setBalance(balance);

    betControls.hide();
    roundResult.hide();

    try {
      const data = await startBlackjack(bet);

      gameState = createInitialState();
      gameState.active = true;
      gameState.initialBet = bet;
      gameState.hands = [
        {
          cards: data.playerCards,
          score: data.playerScore,
          bet,
          finished: false,
          bust: false,
        },
      ];
      gameState.dealerCards = data.dealerCards;
      gameState.dealerScore = data.dealerScore;

      dealerHand.setCards(data.dealerCards, data.dealerScore);
      renderPlayer();

      if (data.playerScore === 21) {
        await finishRound();
      } else {
        refreshActionButtons();
      }
    } catch (err) {
      console.error("Error starting round:", err);
      showAlert(err.message === "Not Enough Balance" ? "Insufficient balance!" : "An error occurred. Please try again.");
      balance += bet;
      header.setBalance(balance);
      betControls.show();
    }
  }

  async function handleHit() {
    actionButtons.setDisabled(true);
    try {
      const data = await hitBlackjack();
      const hand = activeHand();
      hand.cards = data.playerCards;
      hand.score = data.playerScore;
      hand.bust = data.bust;
      renderPlayer();

      if (data.bust || data.playerScore === 21) {
        hand.finished = true;
        await finishRound();
      } else {
        refreshActionButtons();
      }
    } catch (err) {
      console.error("Error on hit:", err);
      showAlert("An error occurred!");
      refreshActionButtons();
    }
  }

  async function handleStand() {
    actionButtons.setDisabled(true);
    activeHand().finished = true;
    await finishRound();
  }

  async function finishRound() {
    actionButtons.hide();

    try {
      const data = await standBlackjack();

      // Animate: reveal dealer's hidden card first
      let dealerCards = [gameState.dealerCards[0], data.dealerCards[1]];
      dealerHand.setCards(dealerCards, calculateScore(dealerCards));
      await wait(REVEAL_DELAY);

      // Then show any additional cards the dealer drew
      for (let i = 2; i < data.dealerCards.length; i++) {
        await wait(DEALER_DRAW_DELAY);
        dealerCards = [...dealerCards, data.dealerCards[i]];
        dealerHand.setCards(dealerCards, calculateScore(dealerCards));
      }

      balance = data.newBalance;
      header.setBalance(balance);
      gameState.active = false;

      roundResult.show({
        result: data.result,
        payout: data.payout,
        totalPayout: data.payout,
      });
    } catch (err) {
      console.error("Error ending round:", err);
      showAlert("An error occurred while ending the round!");
      betControls.show();
    }
  }

  function handleNewRound() {
    gameState = createInitialState();
    dealerHand.reset();
    playerHand.reset();
    roundResult.hide();
    betControls.reset();
    betControls.show();
    updateCompactMode();
  }

  betControls.show();
}
