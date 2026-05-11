import express from "express";
import Auth from "../middleware/auth.js";
import Slot from "../controllers/slot.js";
import Roulette from "../controllers/roulette.js";
import { BlackJack, BlackJackCalc } from "../controllers/blackjack.js";
import { Bet, GetBalance } from "../controllers/helper.js";

const gamesRouter = express.Router();
const blackjackGames = new Map();

const blackjackSuits = ["♠", "♥", "♦", "♣"];
const blackjackRankValues = {
  A: 11,
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
};

function scoreBlackjackHand(cards) {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    total += blackjackRankValues[card] ?? 0;

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

function formatBlackjackCard(rank) {
  return `${rank}${blackjackSuits[Math.floor(Math.random() * blackjackSuits.length)]}`;
}

function getBlackjackGame(req) {
  return blackjackGames.get(req.cookies.token);
}

function syncDisplayCards(displayCards, ranks, startIndex = 0) {
  for (let index = startIndex; index < ranks.length; index++) {
    displayCards[index] = formatBlackjackCard(ranks[index]);
  }
}

gamesRouter.post("/slot/spin", Auth, async (req, res) => {
  try {
    const { amount } = req.body;
    await Bet(amount, req, res);

    if (res.headersSent) {
      return;
    }

    const { symbols, win, payout } = await Slot(amount);
    const { newBalance } = await GetBalance(payout, req);

    return res.status(200).json({
      symbols: symbols,
      win: win,
      payout: payout,
      newBalance: newBalance,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

gamesRouter.post("/roulette/spin", Auth, async (req, res) => {
  try {
    const { bets } = req.body;

    for (const bet of bets) {
      await Bet(bet.amount, req, res);

      if (res.headersSent) {
        return;
      }
    }

    const { roll, payout, win } = await Roulette(bets);
    const { newBalance } = await GetBalance(payout, req);

    return res.status(200).json({
      roll: roll,
      win: win,
      payout: payout,
      newBalance: newBalance,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

gamesRouter.post("/blackjack/start", Auth, async (req, res) => {
  try {
    const { bet } = req.body;
    await Bet(bet, req, res);

    if (res.headersSent) {
      return;
    }

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

    blackjackGames.set(req.cookies.token, state);

    return res.status(200).json({
      playerCards: state.playerCards,
      dealerCards: [state.dealerCards[0], "?"],
      playerScore: scoreBlackjackHand(state.playerRanks),
      dealerScore: scoreBlackjackHand([state.dealerRanks[0]]),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

gamesRouter.post("/blackjack/hit", Auth, async (req, res) => {
  try {
    const state = getBlackjackGame(req);

    if (!state) {
      return res.status(400).json({ error: "No active blackjack game" });
    }

    const previousPlayerLength = state.playerRanks.length;
    BlackJack(state.playerRanks, state.dealerRanks, state.bet);
    syncDisplayCards(
      state.playerCards,
      state.playerRanks,
      previousPlayerLength,
    );

    const newCard = state.playerCards[state.playerCards.length - 1];
    const playerScore = scoreBlackjackHand(state.playerRanks);

    return res.status(200).json({
      newCard: newCard,
      playerCards: state.playerCards,
      playerScore: playerScore,
      bust: playerScore > 21,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

gamesRouter.post("/blackjack/stand", Auth, async (req, res) => {
  try {
    const state = getBlackjackGame(req);

    if (!state) {
      return res.status(400).json({ error: "No active blackjack game" });
    }

    const previousDealerLength = state.dealerRanks.length;
    const { payout } = BlackJackCalc(
      state.playerRanks,
      state.dealerRanks,
      state.bet,
    );
    syncDisplayCards(
      state.dealerCards,
      state.dealerRanks,
      previousDealerLength,
    );

    const playerScore = scoreBlackjackHand(state.playerRanks);
    const dealerScore = scoreBlackjackHand(state.dealerRanks);
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

    const { newBalance } = await GetBalance(payout, req);
    blackjackGames.delete(req.cookies.token);

    return res.status(200).json({
      dealerCards: state.dealerCards,
      dealerScore: dealerScore,
      result: result,
      payout: payout,
      newBalance: newBalance,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default gamesRouter;
