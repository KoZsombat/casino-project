const cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];
const cardValues = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 10,
  Q: 10,
  K: 10,
  A: 11,
};

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

    if (card === "A") {
      aces += 1;
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

export function BlackJack(playerCards, dealerCards, amount) {
  if (playerCards.length == 0 && dealerCards.length == 0) {
    drawCard(playerCards);
    drawCard(dealerCards);
    drawCard(dealerCards);
  } else {
    drawCard(playerCards);
  }

  return { playerCards, dealerCards, amount };
}

export function BlackJackCalc(playerCards, dealerCards, amount) {
  let playerValue = getHandValue(playerCards);
  let dealerValue = getHandValue(dealerCards);

  if (playerValue <= 21 && dealerValue < playerValue) {
    while (dealerValue < 17) {
      drawCard(dealerCards);
      dealerValue = getHandValue(dealerCards);

      if (dealerValue > playerValue) {
        break;
      }
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

  return {
    playerCards,
    dealerCards,
    payout,
    win: payout > 0,
  };
}
