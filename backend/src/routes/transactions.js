import express from "express";
import { con } from "../db/connection.js";
import Auth from "../middleware/auth.js";

const transactionRouter = express.Router();

transactionRouter.post("/deposit", Auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 0)
      return res.status(400).json({ error: "Invalid Request" });

    const [sessionRow] = await con.query(
      "SELECT * FROM sessions WHERE token = ?",
      [req.cookies.token],
    );
    const [user] = await con.query("SELECT * FROM users WHERE id = ?", [
      sessionRow[0].user_id,
    ]);
    await con.query("UPDATE users SET balance = ? WHERE id = ?", [
      user[0].balance + amount,
      sessionRow[0].user_id,
    ]);

    return res.status(200).json({
      message: "Deposit successful",
      newBalance: user[0].balance + amount,
    });
  } catch (err) {
    return res.status(500).json({ error: "DB Error" + err });
  }
});

export default transactionRouter;
