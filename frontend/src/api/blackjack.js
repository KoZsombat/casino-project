// Score utilities still needed for UI rendering during the game
function getRank(card) {
  return card.slice(0, -1);
}

function getCardValue(card) {
  const rank = getRank(card);
  if (rank === "J" || rank === "Q" || rank === "K") return 10;
  if (rank === "A") return 11;
  return parseInt(rank, 10);
}

export function calculateScore(cards) {
  let score = 0;
  let aces = 0;
  for (const card of cards) {
    const value = getCardValue(card);
    if (value === 11) aces++;
    score += value;
  }
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  return score;
}

async function post(path, body) {
  const res = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Server error ${res.status}`);
  }

  return res.json();
}

export async function startBlackjack(bet) {
  return post("/api/games/blackjack/start", { bet });
}

export async function hitBlackjack() {
  return post("/api/games/blackjack/hit");
}

export async function standBlackjack() {
  return post("/api/games/blackjack/stand");
}

export async function fetchBalance() {
  const res = await fetch("/api/user/balance", { credentials: "include" });
  if (!res.ok) return null;
  const data = await res.json();
  return parseFloat(data.balance);
}
