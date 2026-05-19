import { con } from "../db/connection.js";

export async function Bet(amount, req, res) {
  const [sessionRow] = await con.query(
    "SELECT user_id FROM sessions WHERE token = ?",
    [req.cookies.token],
  );

  // Atomic deduction: only succeeds if balance >= amount, eliminating the race condition
  const [result] = await con.query(
    "UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?",
    [amount, sessionRow[0].user_id, amount],
  );

  if (result.affectedRows === 0)
    return res.status(400).json({ error: "Not Enough Balance" });
}

export async function GetBalance(win, req) {
  const [sessionRow] = await con.query(
    "SELECT user_id FROM sessions WHERE token = ?",
    [req.cookies.token],
  );

  await con.query("UPDATE users SET balance = balance + ? WHERE id = ?", [
    win,
    sessionRow[0].user_id,
  ]);

  const [updatedUser] = await con.query(
    "SELECT balance FROM users WHERE id = ?",
    [sessionRow[0].user_id],
  );

  return { newBalance: updatedUser[0].balance };
}
