import { apiPath } from "./client.js";

export async function spinRoulette(bets) {
  const normalizedBets = bets.map((bet) => {
    const asNum = Number(bet.type);
    return { ...bet, type: Number.isInteger(asNum) ? asNum : bet.type };
  });

  const res = await fetch(apiPath("/api/games/roulette/spin"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bets: normalizedBets }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Server error ${res.status}`);
  }

  const data = await res.json();
  return {
    ...data,
    winningNumber: data.roll[data.roll.length - 3],
  };
}
