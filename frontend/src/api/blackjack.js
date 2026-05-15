function drawCard() {
  const values = [
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
  const suits = ["♠", "♥", "♦", "♣"];
  const value = values[Math.floor(Math.random() * values.length)];
  const suit = suits[Math.floor(Math.random() * suits.length)];
  return value + suit;
}

function getCardValue(card) {
  const value = card.slice(0, -1);
  if (value === "J" || value === "Q" || value === "K") return 10;
  if (value === "A") return 11;
  return parseInt(value);
}

function calculateScore(cards) {
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

export async function startBlackjack(bet) {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const playerCards = [drawCard(), drawCard()];
  const dealerFirstCard = drawCard();
  const dealerHiddenCard = drawCard();

  const dealerCards = [dealerFirstCard, "?"];

  return {
    playerCards,
    dealerCards,
    playerScore: calculateScore(playerCards),
    dealerScore: getCardValue(dealerFirstCard),
    _hiddenCard: dealerHiddenCard,
  };
}

export async function hitBlackjack(state) {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const newCard = drawCard();
  const playerCards = [...state.playerCards, newCard];
  const playerScore = calculateScore(playerCards);
  const bust = playerScore > 21;

  return {
    newCard,
    playerCards,
    playerScore,
    bust,
  };
}

export async function standBlackjack(state) {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const dealerCards = [state.dealerCards[0], state._hiddenCard];
  let dealerScore = calculateScore(dealerCards);

  while (dealerScore < 17) {
    const newCard = drawCard();
    dealerCards.push(newCard);
    dealerScore = calculateScore(dealerCards);
  }

  let result, payout;
  const playerScore = state.playerScore;

  if (dealerScore > 21) {
    result = "player_wins";
    payout = state.bet * 2;
  } else if (dealerScore > playerScore) {
    result = "dealer_wins";
    payout = 0;
  } else if (dealerScore < playerScore) {
    result = "player_wins";
    payout = state.bet * 2;
  } else {
    result = "tie";
    payout = state.bet;
  }

  return {
    dealerCards,
    dealerScore,
    result,
    payout,
    newBalance: null,
  };
}
