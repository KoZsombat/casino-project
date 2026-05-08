import { con } from "../db/connection";

export default async function Auth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "No Token" });

  try {
    const [tokenFound] = await con.query(
      "SELECT * FROM sessions WHERE token = ?",
      [token],
    );
    if (tokenFound.length > 0 && tokenFound[0].expires_at > new Date())
      return next();
    else return res.status(401).json({ error: "Expired or Invalid Token" });
  } catch {
    return res.status(500).json({ error: "DB Error" });
  }
}
