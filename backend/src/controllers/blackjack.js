const cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];
const cardValues = {
  2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10,
  J: 10, Q: 10, K: 10, A: 11,
};

const GAME_TIMEOUT_MS = 30 * 60 * 1000;

const blackjackGames = new Map();
const gameTimers = new Map();

function clearGame(token) {
  globalThis.clearTimeout(gameTimers.get(token));
  gameTimers.delete(token);
  blackjackGames.delete(token);
}

function scheduleExpiry(token) {
  globalThis.clearTimeout(gameTimers.get(token));
  const timer = globalThis.setTimeout(() => clearGame(token), GAME_TIMEOUT_MS);
  gameTimers.set(token, timer);
}

function drawCard(hand) {
  const card = cards[Math.floor(Math.random() * cards.length)];
  hand.push(card);
  return card;
}

function getHandValue(hand) {
  let total = 0;
  let aces = 0;

  for (const card of hand) {
    total += cardValues[card] ?? 0;
    if (card === "A") aces += 1;
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

function formatCard(rank) {
  const suits = ["♠", "♥", "♦", "♣"];
  return `${rank}${suits[Math.floor(Math.random() * suits.length)]}`;
}

function syncDisplayCards(displayCards, ranks, startIndex = 0) {
  for (let index = startIndex; index < ranks.length; index++) {
    displayCards[index] = formatCard(ranks[index]);
  }
}

export function BlackJack(playerRanks, dealerRanks, amount) {
  if (playerRanks.length === 0 && dealerRanks.length === 0) {
    drawCard(playerRanks);
    drawCard(playerRanks);
    drawCard(dealerRanks);
    drawCard(dealerRanks);
  } else {
    drawCard(playerRanks);
  }

  return { playerRanks, dealerRanks, amount };
}

export function BlackJackCalc(playerRanks, dealerRanks, amount) {
  let playerValue = getHandValue(playerRanks);
  let dealerValue = getHandValue(dealerRanks);

  if (playerValue <= 21) {
    while (dealerValue < 17) {
      drawCard(dealerRanks);
      dealerValue = getHandValue(dealerRanks);
    }
  }

  let payout = 0;

  if (playerValue > 21 && dealerValue > 21) {
    payout = amount;
  } else if (playerValue > 21) {
    payout = 0;
  } else if (dealerValue > 21) {
    payout = amount * 2;
  } else if (playerValue > dealerValue) {
    payout = amount * 2;
  } else if (playerValue === dealerValue) {
    payout = amount;
  }

  return { playerRanks, dealerRanks, payout, win: payout > 0, playerValue, dealerValue };
}

export function BlackJackStart(token, bet) {
  const state = {
    bet,
    playerRanks: [],
    dealerRanks: [],
    playerCards: [],
    dealerCards: [],
  };

  BlackJack(state.playerRanks, state.dealerRanks, bet);
  syncDisplayCards(state.playerCards, state.playerRanks);
  syncDisplayCards(state.dealerCards, state.dealerRanks);

  blackjackGames.set(token, state);
  scheduleExpiry(token);

  return {
    playerCards: state.playerCards,
    dealerCards: [state.dealerCards[0], "?"],
    playerScore: getHandValue(state.playerRanks),
    dealerScore: getHandValue([state.dealerRanks[0]]),
  };
}

export function BlackJackHit(token) {
  const state = blackjackGames.get(token);
  if (!state) return null;

  const previousPlayerLength = state.playerRanks.length;
  BlackJack(state.playerRanks, state.dealerRanks, state.bet);
  syncDisplayCards(state.playerCards, state.playerRanks, previousPlayerLength);

  const newCard = state.playerCards[state.playerCards.length - 1];
  const playerScore = getHandValue(state.playerRanks);

  scheduleExpiry(token);

  return { newCard, playerCards: state.playerCards, playerScore, bust: playerScore > 21 };
}

export function BlackJackStand(token) {
  const state = blackjackGames.get(token);
  if (!state) return null;

  const previousDealerLength = state.dealerRanks.length;
  const { payout } = BlackJackCalc(state.playerRanks, state.dealerRanks, state.bet);
  syncDisplayCards(state.dealerCards, state.dealerRanks, previousDealerLength);

  const playerScore = getHandValue(state.playerRanks);
  const dealerScore = getHandValue(state.dealerRanks);
  let result = "dealer_wins";

  if (playerScore > 21) {
    result = "dealer_wins";
  } else if (dealerScore > 21) {
    result = "player_wins";
  } else if (playerScore > dealerScore) {
    result = "player_wins";
  } else if (playerScore === dealerScore) {
    result = "push";
  }

  clearGame(token);

  return { dealerCards: state.dealerCards, dealerScore, result, payout };
}
