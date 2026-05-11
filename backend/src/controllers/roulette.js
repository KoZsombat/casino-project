export default function Roulette(bets) {
  const numbers = [];

  const possibilities = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
  ];

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

  for (let index = 0; index < 5 * 37; index++) {
    numbers.push(
      possibilities[Math.floor(Math.random() * possibilities.length)],
    );
  }

  const winner = numbers[numbers.length - 3];
  let payout = 0;

  bets.forEach((bet) => {
    switch (bet.type) {
      case "red":
        colors[winner] == "red"
          ? (payout += bets.find((e) => e.type == e.type)[0].amount * 2)
          : null;
        break;
      case "black":
        colors[winner] == "black"
          ? (payout += bets.find((e) => e.type == e.type)[0].amount * 2)
          : null;
        break;
      case "green":
        colors[winner] == "green"
          ? (payout += bets.find((e) => e.type == e.type)[0].amount * 36)
          : null;
        break;
      case "even":
        winner % 2 == 0
          ? (payout += bets.find((e) => e.type == e.type)[0].amount * 2)
          : null;
        break;
      case "odd":
        winner % 2 == 1
          ? (payout += bets.find((e) => e.type == e.type)[0].amount * 2)
          : null;
        break;
      case typeof bet.type == Number:
        winner == bet.type
          ? (payout += bets.find((e) => e.type == e.type)[0].amount * 36)
          : null;
        break;
    }
  });

  return { roll: numbers, win: payout > 0, payout: payout };
}
