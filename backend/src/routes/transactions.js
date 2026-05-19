import express from "express";
import { con } from "../db/connection.js";
import Auth from "../middleware/auth.js";
import { depositSchema, validate } from "../validators.js";

const transactionRouter = express.Router();

transactionRouter.post("/deposit", Auth, async (req, res) => {
  try {
    const data = validate(depositSchema, req.body, res);
    if (!data) return;

    const { amount } = data;

    const [sessionRow] = await con.query(
      "SELECT user_id FROM sessions WHERE token = ?",
      [req.cookies.token],
    );

    if (!sessionRow.length)
      return res.status(401).json({ error: "Unauthorized" });

    await con.query("UPDATE users SET balance = balance + ? WHERE id = ?", [
      amount,
      sessionRow[0].user_id,
    ]);

    const [user] = await con.query("SELECT balance FROM users WHERE id = ?", [
      sessionRow[0].user_id,
    ]);

    return res.status(200).json({
      message: "Deposit successful",
      newBalance: user[0].balance,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default transactionRouter;
