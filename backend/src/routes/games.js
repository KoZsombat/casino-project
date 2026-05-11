import express from "express";
import Auth from "../middleware/auth.js";
import Slot from "../controllers/slot.js";
import Roulette from "../controllers/roulette.js";
import {
  BlackJackHit,
  BlackJackStand,
  BlackJackStart,
} from "../controllers/blackjack.js";
import { Bet, GetBalance } from "../controllers/helper.js";

const gamesRouter = express.Router();

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

    const result = BlackJackStart(req.cookies.token, bet);

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

gamesRouter.post("/blackjack/hit", Auth, async (req, res) => {
  try {
    const result = BlackJackHit(req.cookies.token);

    if (!result) {
      return res.status(400).json({ error: "No active blackjack game" });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

gamesRouter.post("/blackjack/stand", Auth, async (req, res) => {
  try {
    const result = BlackJackStand(req.cookies.token);

    if (!result) {
      return res.status(400).json({ error: "No active blackjack game" });
    }

    const { newBalance } = await GetBalance(result.payout, req);

    return res.status(200).json({
      dealerCards: result.dealerCards,
      dealerScore: result.dealerScore,
      result: result.result,
      payout: result.payout,
      newBalance: newBalance,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default gamesRouter;
