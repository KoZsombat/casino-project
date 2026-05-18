// MOCK API - fejlesztéshez, később lecseréljük igazi fetch-re
export async function spinRoulette(bets) {
  await new Promise((resolve) => globalThis.setTimeout(resolve, 300));

  const winningNumber = Math.floor(Math.random() * 37);

  let payout = 0;
  bets.forEach((bet) => {
    if (isBetWinning(bet, winningNumber)) {
      payout += bet.amount * payoutMultiplier(bet.type);
    }
  });

  return {
    win: payout > 0,
    payout,
    winningNumber,
  };
}

const RED_NUMBERS = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];
const COL1 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
const COL2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
const COL3 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];

// Payout = amount * multiplier (visszakapja a tétet + nyereség)
function payoutMultiplier(type) {
  if (["red", "black", "odd", "even", "low", "high"].includes(type)) return 2;
  if (["dozen1", "dozen2", "dozen3", "col1", "col2", "col3"].includes(type))
    return 3;
  return 36; // konkrét szám (35:1)
}

function isBetWinning(bet, n) {
  if (n === 0) {
    return bet.type === "0";
  }

  switch (bet.type) {
    case "red":
      return RED_NUMBERS.includes(n);
    case "black":
      return !RED_NUMBERS.includes(n);
    case "odd":
      return n % 2 === 1;
    case "even":
      return n % 2 === 0;
    case "low":
      return n >= 1 && n <= 18;
    case "high":
      return n >= 19 && n <= 36;
    case "dozen1":
      return n >= 1 && n <= 12;
    case "dozen2":
      return n >= 13 && n <= 24;
    case "dozen3":
      return n >= 25 && n <= 36;
    case "col1":
      return COL1.includes(n);
    case "col2":
      return COL2.includes(n);
    case "col3":
      return COL3.includes(n);
    default:
      return bet.type === n.toString();
  }
}
