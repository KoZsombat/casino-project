import { con } from "../db/connection.js";

export async function Bet(amount, req, res) {
  const [sessionRow] = await con.query(
    "SELECT * FROM sessions WHERE token = ?",
    [req.cookies.token],
  );

  const [user] = await con.query("SELECT * FROM users WHERE id = ?", [
    sessionRow[0].user_id,
  ]);

  if (user[0].balance - amount < 0)
    return res.status(400).json({ error: "Not Enough Balance" });

  await con.query("UPDATE users SET balance = ? WHERE id = ?", [
    user[0].balance - amount,
    sessionRow[0].user_id,
  ]);
}

export async function GetBalance(win, req) {
  const [sessionRow] = await con.query(
    "SELECT * FROM sessions WHERE token = ?",
    [req.cookies.token],
  );

  const [user] = await con.query("SELECT * FROM users WHERE id = ?", [
    sessionRow[0].user_id,
  ]);

  await con.query("UPDATE users SET balance = ? WHERE id = ?", [
    user[0].balance + win,
    sessionRow[0].user_id,
  ]);

  const [updatedUser] = await con.query("SELECT * FROM users WHERE id = ?", [
    sessionRow[0].user_id,
  ]);

  return { newBalance: updatedUser[0].balance };
}
