import showAlert from "../components/showAlert.js";
import "./Blackjack.css";
import {
  startBlackjack,
  drawForHand,
  settleHand,
  canSplit,
  isPairOfAces,
  calculateScore,
  getCardsRemaining,
  getDeckCount,
} from "../api/blackjack.js";
import { setupGameHeader } from "../components/GameHeader.js";
import { setupDealerHand } from "../components/blackjack/DealerHand.js";
import { setupPlayerHand } from "../components/blackjack/PlayerHand.js";
import { setupBetControls } from "../components/blackjack/BetControls.js";
import { setupActionButtons } from "../components/blackjack/ActionButtons.js";
import { setupRoundResult } from "../components/blackjack/RoundResult.js";
import { setupDeck } from "../components/blackjack/Deck.js";

const MAX_HANDS = 4;
const DEALER_DRAW_DELAY = 550;
const REVEAL_DELAY = 450;

function wait(ms) {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}

export function setupBlackjack(element) {
  let balance = 1000;

  let gameState = createInitialState();

  function createInitialState() {
    return {
      active: false,
      initialBet: 0,
      hands: [],
      activeHandIndex: 0,
      dealerCards: [],
      dealerScore: 0,
      _hiddenCard: null,
      _split: false,
    };
  }

  const totalDeckCards = getDeckCount() * 52;

  element.innerHTML = `
    <div class="blackjack-page">
      <div id="header-container"></div>
      <h1>Blackjack</h1>
      <div class="table-banner">BLACKJACK PAYS 3 TO 2</div>
      <div class="table-divider"></div>
      <div id="deck-container"></div>
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
      showAlert("Vissza a főoldalra (még nincs implementálva)");
    },
  });

  const deck = setupDeck(element.querySelector("#deck-container"), {
    totalCount: totalDeckCards,
    initialCount: getCardsRemaining(),
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
      onDouble: handleDouble,
      onSplit: handleSplit,
    },
  );

  const roundResult = setupRoundResult(
    element.querySelector("#round-result-container"),
    {
      onNewRound: handleNewRound,
    },
  );

  function refreshDeck() {
    deck.update(getCardsRemaining());
  }

  function activeHand() {
    return gameState.hands[gameState.activeHandIndex];
  }

  function updateCompactMode() {
    const multi = gameState.hands.length > 1;
    const manyCards = gameState.hands.some((h) => h.cards.length >= 4);
    pageEl.classList.toggle("compact", multi || manyCards);
  }

  function renderPlayer() {
    updateCompactMode();
    if (gameState.hands.length > 1) {
      playerHand.setHands(gameState.hands, gameState.activeHandIndex);
    } else {
      const hand = gameState.hands[0];
      const doubledIndex =
        hand?.doubled && hand.cards.length > 0
          ? hand.cards.length - 1
          : undefined;
      playerHand.setCards(hand?.cards ?? [], hand?.score ?? null, {
        doubledIndex,
      });
    }
  }

  function refreshActionButtons() {
    const hand = activeHand();
    if (!hand || hand.finished) {
      actionButtons.hide();
      return;
    }

    const isFirstAction = hand.cards.length === 2 && !hand.doubled;
    const canAffordExtra = balance >= hand.bet;

    const splitAvailable =
      isFirstAction &&
      canSplit(hand.cards) &&
      canAffordExtra &&
      gameState.hands.length < MAX_HANDS;

    const doubleAvailable = isFirstAction && canAffordExtra && !hand.finished;

    actionButtons.show({
      canHit: !hand.finished,
      canStand: !hand.finished,
      canDouble: doubleAvailable,
      canSplit: splitAvailable,
      showDouble: true,
      showSplit: true,
    });
  }

  async function handleStart(bet) {
    balance = balance - bet;
    header.setBalance(balance);

    betControls.hide();
    roundResult.hide();

    try {
      const data = await startBlackjack();
      refreshDeck();

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
          doubled: false,
          blackjack: data.playerScore === 21,
          splitAce: false,
        },
      ];
      gameState.dealerCards = data.dealerCards;
      gameState.dealerScore = data.dealerScore;
      gameState._hiddenCard = data._hiddenCard;

      dealerHand.setCards(data.dealerCards, data.dealerScore);
      renderPlayer();

      if (data.playerScore === 21) {
        await finishRound();
      } else {
        refreshActionButtons();
      }
    } catch (err) {
      console.error("Hiba a kör indításakor:", err);
      showAlert("Hiba történt! Próbáld újra.");
      balance = balance + bet;
      header.setBalance(balance);
      betControls.show();
    }
  }

  async function drawCardForActiveHand() {
    const hand = activeHand();
    const result = await drawForHand(hand.cards);
    hand.cards = result.cards;
    hand.score = result.score;
    if (hand.score > 21) hand.bust = true;
    if (hand.score === 21) hand.blackjack = hand.cards.length === 2;
    renderPlayer();
    refreshDeck();
    return result;
  }

  async function handleHit() {
    actionButtons.setDisabled(true);
    try {
      await drawCardForActiveHand();
      const hand = activeHand();

      if (hand.bust) {
        hand.finished = true;
        await advanceOrFinish();
      } else if (hand.score === 21) {
        hand.finished = true;
        await advanceOrFinish();
      } else {
        refreshActionButtons();
      }
    } catch (err) {
      console.error("Hiba hit közben:", err);
      showAlert("Hiba történt!");
      refreshActionButtons();
    }
  }

  async function handleStand() {
    actionButtons.setDisabled(true);
    const hand = activeHand();
    hand.finished = true;
    await advanceOrFinish();
  }

  async function handleDouble() {
    const hand = activeHand();
    if (balance < hand.bet) {
      showAlert("Nincs elég egyenleged a duplázáshoz!");
      refreshActionButtons();
      return;
    }

    actionButtons.setDisabled(true);

    balance -= hand.bet;
    header.setBalance(balance);
    hand.bet *= 2;
    hand.doubled = true;

    try {
      await drawCardForActiveHand();
      const updated = activeHand();
      updated.finished = true;
      await advanceOrFinish();
    } catch (err) {
      console.error("Hiba double közben:", err);
      showAlert("Hiba történt!");
      refreshActionButtons();
    }
  }

  async function handleSplit() {
    const idx = gameState.activeHandIndex;
    const hand = gameState.hands[idx];
    if (!hand || !canSplit(hand.cards)) return;
    if (gameState.hands.length >= MAX_HANDS) {
      showAlert(`Legfeljebb ${MAX_HANDS} kéz lehet egyszerre.`);
      return;
    }
    if (balance < hand.bet) {
      showAlert("Nincs elég egyenleged a splithez!");
      refreshActionButtons();
      return;
    }

    actionButtons.setDisabled(true);

    balance -= hand.bet;
    header.setBalance(balance);

    const splitAces = isPairOfAces(hand.cards);
    const [card1, card2] = hand.cards;

    gameState._split = true;

    // Active hand keeps the first card; second card seeds a new hand
    // inserted right after, so play continues through it before any
    // earlier-split sibling hands.
    gameState.hands[idx] = {
      cards: [card1],
      score: calculateScore([card1]),
      bet: hand.bet,
      finished: false,
      bust: false,
      doubled: false,
      blackjack: false,
      splitAce: splitAces,
    };
    gameState.hands.splice(idx + 1, 0, {
      cards: [card2],
      score: calculateScore([card2]),
      bet: hand.bet,
      finished: false,
      bust: false,
      doubled: false,
      blackjack: false,
      splitAce: splitAces,
    });

    updateCompactMode();
    renderPlayer();

    try {
      await drawCardForActiveHand();

      if (splitAces) {
        activeHand().finished = true;
        gameState.activeHandIndex = idx + 1;
        renderPlayer();
        await drawCardForActiveHand();
        activeHand().finished = true;
        await advanceOrFinish();
        return;
      }

      if (activeHand().score === 21) {
        activeHand().finished = true;
        await advanceOrFinish();
      } else {
        refreshActionButtons();
      }
    } catch (err) {
      console.error("Hiba split közben:", err);
      showAlert("Hiba történt!");
      refreshActionButtons();
    }
  }

  async function advanceOrFinish() {
    const nextIndex = gameState.hands.findIndex(
      (h, i) => i > gameState.activeHandIndex && !h.finished,
    );

    renderPlayer();

    if (nextIndex !== -1) {
      gameState.activeHandIndex = nextIndex;
      const next = activeHand();
      if (!next.splitAce && next.cards.length === 1) {
        await drawCardForActiveHand();
        const drawn = activeHand();
        if (drawn.score === 21) {
          drawn.finished = true;
          await advanceOrFinish();
          return;
        }
      }
      refreshActionButtons();
      return;
    }

    await finishRound();
  }

  async function finishRound() {
    actionButtons.hide();

    // Reveal the dealer's hidden card.
    let dealerCards = [gameState.dealerCards[0], gameState._hiddenCard];
    let dealerScore = calculateScore(dealerCards);
    dealerHand.setCards(dealerCards, dealerScore);
    await wait(REVEAL_DELAY);

    const aliveScores = gameState.hands
      .filter((h) => !h.bust)
      .map((h) => h.score);
    const maxAliveScore = aliveScores.length
      ? Math.max(...aliveScores)
      : -Infinity;

    // Dealer hits to 17, but stops early if already ahead of every alive
    // player hand — no need to risk busting on a hand it already wins.
    while (dealerScore < 17 && dealerScore <= maxAliveScore) {
      await wait(DEALER_DRAW_DELAY);
      const result = await drawForHand(dealerCards);
      dealerCards = result.cards;
      dealerScore = result.score;
      dealerHand.setCards(dealerCards, dealerScore);
      refreshDeck();
    }

    gameState.dealerCards = dealerCards;
    gameState.dealerScore = dealerScore;

    let totalPayout = 0;
    const handResults = gameState.hands.map((hand) => {
      const settled = settleHand(hand.score, dealerScore, hand.bet);
      totalPayout += settled.payout;
      return {
        bet: hand.bet,
        score: hand.score,
        result: settled.result,
        payout: settled.payout,
      };
    });

    balance += totalPayout;
    header.setBalance(balance);

    gameState.active = false;

    if (gameState.hands.length > 1) {
      roundResult.show({ hands: handResults, totalPayout });
    } else {
      roundResult.show({
        result: handResults[0].result,
        payout: handResults[0].payout,
        totalPayout,
      });
    }
  }

  function handleNewRound() {
    gameState = createInitialState();
    dealerHand.reset();
    playerHand.reset();
    roundResult.hide();
    betControls.reset();
    betControls.show();
    refreshDeck();
    updateCompactMode();
  }

  betControls.show();
  refreshDeck();
}
