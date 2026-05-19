const COL1 = new Set([1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]);
const COL2 = new Set([2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35]);
const COL3 = new Set([3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]);

const colors = [
  "green",
  "red",
  "black",
  "red",
  "black",
  "red",
  "black",
  "red",
  "black",
  "red",
  "black",
  "black",
  "red",
  "black",
  "red",
  "black",
  "red",
  "black",
  "red",
  "red",
  "black",
  "red",
  "black",
  "red",
  "black",
  "red",
  "black",
  "red",
  "black",
  "black",
  "red",
  "black",
  "red",
  "black",
  "red",
  "black",
  "red",
];

export default function Roulette(bets) {
  const possibilities = Array.from({ length: 37 }, (_, i) => i);
  const numbers = [];

  for (let index = 0; index < 5 * 37; index++) {
    numbers.push(possibilities[Math.floor(Math.random() * possibilities.length)]);
  }

  const winner = numbers[numbers.length - 3];
  let payout = 0;

  bets.forEach((bet) => {
    switch (bet.type) {
      case "red":
        if (colors[winner] === "red") payout += bet.amount * 2;
        break;
      case "black":
        if (colors[winner] === "black") payout += bet.amount * 2;
        break;
      case "green":
        if (colors[winner] === "green") payout += bet.amount * 36;
        break;
      case "even":
        if (winner > 0 && winner % 2 === 0) payout += bet.amount * 2;
        break;
      case "odd":
        if (winner > 0 && winner % 2 === 1) payout += bet.amount * 2;
        break;
      case "low":
        if (winner >= 1 && winner <= 18) payout += bet.amount * 2;
        break;
      case "high":
        if (winner >= 19 && winner <= 36) payout += bet.amount * 2;
        break;
      case "dozen1":
        if (winner >= 1 && winner <= 12) payout += bet.amount * 3;
        break;
      case "dozen2":
        if (winner >= 13 && winner <= 24) payout += bet.amount * 3;
        break;
      case "dozen3":
        if (winner >= 25 && winner <= 36) payout += bet.amount * 3;
        break;
      case "col1":
        if (COL1.has(winner)) payout += bet.amount * 3;
        break;
      case "col2":
        if (COL2.has(winner)) payout += bet.amount * 3;
        break;
      case "col3":
        if (COL3.has(winner)) payout += bet.amount * 3;
        break;
      default:
        if (typeof bet.type === "number" && winner === bet.type) {
          payout += bet.amount * 36;
        }
        break;
    }
  });

  return { roll: numbers, win: payout > 0, payout };
}
