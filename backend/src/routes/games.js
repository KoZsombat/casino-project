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
import {
  slotSpinSchema,
  rouletteSpinSchema,
  blackjackStartSchema,
  validate,
} from "../validators.js";

const gamesRouter = express.Router();

gamesRouter.post("/slot/spin", Auth, async (req, res) => {
  try {
    const data = validate(slotSpinSchema, req.body, res);
    if (!data) return;

    const { amount } = data;
    await Bet(amount, req, res);
    if (res.headersSent) return;

    const { symbols, win, payout } = await Slot(amount);
    const { newBalance } = await GetBalance(payout, req);

    return res.status(200).json({ symbols, win, payout, newBalance });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

gamesRouter.post("/roulette/spin", Auth, async (req, res) => {
  try {
    const data = validate(rouletteSpinSchema, req.body, res);
    if (!data) return;

    const { bets } = data;

    for (const bet of bets) {
      await Bet(bet.amount, req, res);
      if (res.headersSent) return;
    }

    const { roll, payout, win } = await Roulette(bets);
    const { newBalance } = await GetBalance(payout, req);

    return res.status(200).json({ roll, win, payout, newBalance });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

gamesRouter.post("/blackjack/start", Auth, async (req, res) => {
  try {
    const data = validate(blackjackStartSchema, req.body, res);
    if (!data) return;

    const { bet } = data;
    await Bet(bet, req, res);
    if (res.headersSent) return;

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
    if (!result) return res.status(400).json({ error: "No active blackjack game" });

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

gamesRouter.post("/blackjack/stand", Auth, async (req, res) => {
  try {
    const result = BlackJackStand(req.cookies.token);
    if (!result) return res.status(400).json({ error: "No active blackjack game" });

    const { newBalance } = await GetBalance(result.payout, req);

    return res.status(200).json({
      dealerCards: result.dealerCards,
      dealerScore: result.dealerScore,
      result: result.result,
      payout: result.payout,
      newBalance,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default gamesRouter;
