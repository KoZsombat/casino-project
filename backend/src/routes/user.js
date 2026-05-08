import express from "express";
import { con } from "../db/connection.js";
import Auth from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/balance", Auth, async (req, res) => {
  try {
    const [sessionRow] = await con.query(
      "SELECT * FROM sessions WHERE token = ?",
      [req.cookies.token],
    );
    const [user] = await con.query("SELECT * FROM users WHERE id = ?", [
      sessionRow[0].user_id,
    ]);

    return res.status(200).json({ balance: user[0]?.balance });
  } catch (err) {
    return res.status(500).json({ error: "DB Error" + err });
  }
});

export default userRouter;
