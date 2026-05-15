// MOCK API - fejlesztéshez, később lecseréljük igazi fetch-re
export async function spinRoulette(bets) {
  // Szimuláljuk a hálózati késleltetést (300 ms)
  await new Promise((resolve) => globalThis.setTimeout(resolve, 300));

  // Generáljunk egy random roll listát (kb. 20-30 szám hosszú)
  const roll = [];
  const rollLength = 20 + Math.floor(Math.random() * 10);
  for (let i = 0; i < rollLength; i++) {
    roll.push(Math.floor(Math.random() * 37)); // 0-36 közötti szám
  }

  // A nyertes szám az utolsó előtti
  const winningNumber = roll[roll.length - 2];

  // Számoljuk ki a kifizetést a fogadások alapján
  let payout = 0;
  bets.forEach((bet) => {
    if (isBetWinning(bet, winningNumber)) {
      // Pirosa/fekete/páros/páratlan = 1:1, vagyis amount * 2 (visszakapja + nyer ugyanannyit)
      if (["red", "black", "odd", "even"].includes(bet.type)) {
        payout += bet.amount * 2;
      }
      // Konkrét szám = 35:1, vagyis amount * 36
      else if (!isNaN(parseInt(bet.type))) {
        payout += bet.amount * 36;
      }
    }
  });

  return {
    roll,
    win: payout > 0,
    payout,
    winningNumber,
  };
}

// Eldönti, hogy egy fogadás nyert-e a winningNumber alapján
function isBetWinning(bet, winningNumber) {
  // 0 mindig vesztes a külső fogadásokra
  if (winningNumber === 0) {
    return bet.type === "0";
  }

  // Piros számok a rulettben
  const redNumbers = [
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ];

  switch (bet.type) {
    case "red":
      return redNumbers.includes(winningNumber);
    case "black":
      return !redNumbers.includes(winningNumber);
    case "odd":
      return winningNumber % 2 === 1;
    case "even":
      return winningNumber % 2 === 0;
    default:
      // Konkrét szám
      return bet.type === winningNumber.toString();
  }
}
