import express from "express";
import { con } from "../db/connection";
import Auth from "../middleware/auth";

const userRouter = express.Router();

userRouter.post("/balance", Auth, async (req, res) => {
  try {
    const [user_id] = await con.query(
      "SELECT user_id FROM sessions WHERE token = ?",
      [req.cookies.token],
    );
    const [balance] = await con.query(
      "SELECT balance FROM users WHERE user_id = ?",
      [user_id[0]],
    );

    return res.status(200).json({ balance: balance[0] });
  } catch (err) {
    return res.status(500).json({ error: "DB Error" });
  }
});

export default userRouter;
