import { apiPath } from "./client.js";

export async function spinSlot(amount) {
  const res = await fetch(apiPath("/api/games/slot/spin"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Server error ${res.status}`);
  }

  return res.json();
}
