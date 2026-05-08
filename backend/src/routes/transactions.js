import express from "express";
import { con } from "../db/connection";
import Auth from "../middleware/auth";

const transactionRouter = express.Router();

transactionRouter.post("/deposit", Auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 0)
      return res.status(400).json({ error: "Invalid Request" });

    const [user_id] = await con.query(
      "SELECT user_id FROM sessions WHERE token = ?",
      [req.cookies.token],
    );
    const [balance] = await con.query(
      "SELECT balance FROM users WHERE user_id = ?",
      [user_id[0]],
    );
    await con.query("UPDATE users SET balance = ? WHERE user_id = ?", [
      balance[0] + amount,
    ]);

    return res
      .status(200)
      .json({ message: "Deposit successful", newBalance: balance[0] + amount });
  } catch (err) {
    return res.status(500).json({ error: "DB Error" });
  }
});

export default transactionRouter;
