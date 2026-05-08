import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { con } from "../db/connection";
import Auth from "../middleware/auth";

const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: "Invalid Request" });

    const [userDup] = await con.query(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [email, username],
    );

    if (userDup.length > 0)
      return res.status(409).json({ error: "Duplicate Email or Username" });

    const date = new Date();
    const hashedPass = await bcrypt.hash(password, 10);

    await con.query(
      "INSERT INTO user (username, email, password_hash, balance, created_at, updated_at) VALUES (?,?,?,?,?,?)",
      [username, email, hashedPass, 1000, date, date],
    );

    return res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    return res.status(500).json({ error: "DB Error" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "Invalid Request" });

    const [user] = await con.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    const passMatch = await bcrypt.compare(password, user[0].password_hash);

    if (!passMatch) return res.status(401).json({ error: "Bad Password" });

    const token = `${username}_token_${crypto.randomBytes(10)}`;
    const date = new Date();
    const expires_at = new Date(date.getTime() + 3 * 60 * 60 * 1000);
    await con.query(
      "INSERT INTO sessions (user_id, token, expires_at, created_at) VALUES (?,?,?,?)",
      [user[0].id, token, expires_at, date],
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      message: "Login successful",
      username: user[0].username,
      balance: user[0].balance,
    });
  } catch (err) {
    return res.status(500).json({ error: "DB Error" });
  }
});

authRouter.post("/logout", Auth, async (req, res) => {
  try {
    await con.query("DELETE * FROM sessions WHERE token = ?", [
      req.cookies.token,
    ]);

    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ error: "DB Error" });
  }
});

export default authRouter;
