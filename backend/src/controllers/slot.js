export default function Slot(amount) {
  const symbols = [[], [], []];
  let win = false;
  let payout = 0;

  const possibilities = [20, 50, 100, 200, 500, 1000, 2000, "Bonus"];

  for (let index = 0; index < 30; index++) {
    symbols[0].push(
      possibilities[Math.floor(Math.random() * possibilities.length)],
    );
    symbols[1].push(
      possibilities[Math.floor(Math.random() * possibilities.length)],
    );
    symbols[2].push(
      possibilities[Math.floor(Math.random() * possibilities.length)],
    );
  }

  if (
    symbols[0][symbols[0].length - 3] == symbols[1][symbols[1].length - 3] &&
    symbols[1][symbols[1].length - 3] == symbols[2][symbols[2].length - 3]
  ) {
    win = true;
    payout =
      symbols[0][symbols[0].length - 3] == "Bonus"
        ? 5000
        : (symbols[0][symbols[0].length - 3] / 100) * amount;
  }

  return { symbols, win, payout };
}
