import express from "express";
import Auth from "../middleware/auth.js";
import Slot from "../controllers/slot.js";
import Roulette from "../controllers/roulette.js";
import { Bet, GetBalance } from "../controllers/helper.js";

const gamesRouter = express.Router();

gamesRouter.post("/slot/spin", Auth, async (req, res) => {
  try {
    const { amount } = req.body;
    await Bet(amount, req, res);

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

export default gamesRouter;
