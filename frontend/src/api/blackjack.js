const RANKS = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];
const SUITS = ["♠", "♥", "♦", "♣"];

const NUM_DECKS = 2;
const RESHUFFLE_AT = 26;

let shoe = [];

function buildShoe(numDecks = NUM_DECKS) {
  const cards = [];
  for (let d = 0; d < numDecks; d++) {
    for (const r of RANKS) {
      for (const s of SUITS) {
        cards.push(r + s);
      }
    }
  }
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function ensureShoe() {
  if (shoe.length <= RESHUFFLE_AT) {
    shoe = buildShoe();
  }
}

function drawCard() {
  ensureShoe();
  return shoe.pop();
}

export function getCardsRemaining() {
  ensureShoe();
  return shoe.length;
}

export function getDeckCount() {
  return NUM_DECKS;
}

function getRank(card) {
  return card.slice(0, -1);
}

function getCardValue(card) {
  const rank = getRank(card);
  if (rank === "J" || rank === "Q" || rank === "K") return 10;
  if (rank === "A") return 11;
  return parseInt(rank, 10);
}

export function calculateScore(cards) {
  let score = 0;
  let aces = 0;
  for (const card of cards) {
    const value = getCardValue(card);
    if (value === 11) aces++;
    score += value;
  }
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  return score;
}

export function canSplit(cards) {
  if (!cards || cards.length !== 2) return false;
  return getCardValue(cards[0]) === getCardValue(cards[1]);
}

export function isPairOfAces(cards) {
  return (
    cards &&
    cards.length === 2 &&
    getRank(cards[0]) === "A" &&
    getRank(cards[1]) === "A"
  );
}

async function delay(ms = 200) {
  await new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}

export async function startBlackjack() {
  await delay();

  const playerCards = [drawCard(), drawCard()];
  const dealerFirstCard = drawCard();
  const dealerHiddenCard = drawCard();

  return {
    playerCards,
    dealerCards: [dealerFirstCard, "?"],
    playerScore: calculateScore(playerCards),
    dealerScore: getCardValue(dealerFirstCard),
    _hiddenCard: dealerHiddenCard,
  };
}

export async function drawForHand(cards) {
  await delay();
  const newCard = drawCard();
  const nextCards = [...cards, newCard];
  return {
    newCard,
    cards: nextCards,
    score: calculateScore(nextCards),
  };
}

export function settleHand(playerScore, dealerScore, bet) {
  if (playerScore > 21) {
    return { result: "dealer_wins", payout: 0 };
  }
  if (dealerScore > 21 || playerScore > dealerScore) {
    return { result: "player_wins", payout: bet * 2 };
  }
  if (playerScore < dealerScore) {
    return { result: "dealer_wins", payout: 0 };
  }
  return { result: "tie", payout: bet };
}
