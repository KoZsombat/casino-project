import "./Roulette.css";
import { spinRoulette } from "../api/roulette.js";

export function setupRoulette(element) {
  // ===== STATE =====
  let balance = 1000;
  let bets = [];
  let isSpinning = false;

  // ===== HTML =====
  element.innerHTML = `
    <div class="roulette-page">
      <h1>Rulett</h1>
      <p>Egyenleg: <span id="balance">${balance}</span> Ft</p>

      <div class="current-number-display">
        <span id="current-number">-</span>
      </div>

      <div class="betting-form">
        <h2>Új fogadás</h2>
        <select id="bet-type">
          <option value="red">Piros (1:1)</option>
          <option value="black">Fekete (1:1)</option>
          <option value="odd">Páratlan (1:1)</option>
          <option value="even">Páros (1:1)</option>
          <option value="number">Konkrét szám (35:1)</option>
        </select>
        <input type="number" id="bet-number" placeholder="Szám (0-36)" min="0" max="36" style="display: none;" />
        <input type="number" id="bet-amount" placeholder="Összeg" min="1" />
        <button id="add-bet-btn">Fogadás hozzáadása</button>
      </div>

      <div class="bets-list">
        <h2>Aktív fogadások</h2>
        <ul id="bets-ul"></ul>
      </div>

      <button id="spin-btn" disabled>Pörgetés</button>
      <div id="result"></div>
    </div>
  `;

  // ===== DOM ELEMEK =====
  const balanceEl = document.getElementById("balance");
  const currentNumberEl = document.getElementById("current-number");
  const betTypeEl = document.getElementById("bet-type");
  const betNumberEl = document.getElementById("bet-number"); // ← ÚJ
  const betAmountEl = document.getElementById("bet-amount");
  const addBetBtn = document.getElementById("add-bet-btn");
  const betsUl = document.getElementById("bets-ul");
  const spinBtn = document.getElementById("spin-btn");
  const resultEl = document.getElementById("result");

  // ===== RENDER FÜGGVÉNYEK =====
  function renderBalance() {
    balanceEl.textContent = balance;
  }

  function renderBets() {
    betsUl.innerHTML = "";
    bets.forEach((bet, index) => {
      const li = document.createElement("li");
      // Olvasható típus label
      const label = getBetLabel(bet.type);
      li.textContent = `${label} - ${bet.amount} Ft`;
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "X";
      removeBtn.addEventListener("click", () => removeBet(index));
      removeBtn.disabled = isSpinning;
      li.appendChild(removeBtn);
      betsUl.appendChild(li);
    });
    spinBtn.disabled = bets.length === 0 || isSpinning;
    addBetBtn.disabled = isSpinning;
  }

  // Olvasható label a fogadás típushoz
  function getBetLabel(type) {
    switch (type) {
      case "red":
        return "Piros";
      case "black":
        return "Fekete";
      case "odd":
        return "Páratlan";
      case "even":
        return "Páros";
      default:
        return `Szám: ${type}`; // pl. "Szám: 17"
    }
  }

  // ===== STATE MÓDOSÍTÓK =====
  function showAlert(message) {
    if (typeof window !== "undefined" && typeof window.alert === "function") {
      window.alert(message);
    }
  }

  function addBet() {
    let type = betTypeEl.value;
    const amount = parseInt(betAmountEl.value);

    // Ha konkrét számot fogad, akkor a "type" maga a szám lesz (string)
    if (type === "number") {
      const number = parseInt(betNumberEl.value);
      if (isNaN(number) || number < 0 || number > 36) {
        showAlert("Adj meg egy számot 0 és 36 között!");
        return;
      }
      type = number.toString(); // pl. '17' lesz a type
    }

    if (!amount || amount <= 0) {
      showAlert("Adj meg érvényes összeget!");
      return;
    }
    if (amount > balance) {
      showAlert("Nincs elég egyenleged!");
      return;
    }

    bets.push({ type, amount });
    balance = balance - amount;

    renderBalance();
    renderBets();
    betAmountEl.value = "";
    betNumberEl.value = ""; // ezt is ürítsük
  }

  function removeBet(index) {
    balance = balance + bets[index].amount;
    bets.splice(index, 1);
    renderBalance();
    renderBets();
  }

  // ===== PÖRGETÉS =====
  async function handleSpin() {
    // 1. Lock - ne lehessen kétszer kattintani vagy közben módosítani
    isSpinning = true;
    resultEl.textContent = "";
    renderBets(); // letiltja a gombokat

    try {
      // 2. API hívás (most még mock)
      const data = await spinRoulette(bets);
      // data = { roll: [...], win: true/false, payout: 100, winningNumber: 17 }

      // 3. Animáció: végigmegyünk a roll listán
      await animateRoll(data.roll);

      // 4. Eredmény megjelenítése
      showResult(data);

      // 5. Egyenleg frissítése (a payout-ot adjuk hozzá - a téteket már levontuk korábban)
      balance = balance + data.payout;
      renderBalance();

      // 6. Fogadások törlése (új körhöz)
      bets = [];
    } catch (err) {
      console.error("Hiba a pörgetés közben:", err);
      showAlert("Hiba történt a pörgetés közben!");
    } finally {
      // 7. Unlock - bármi is történt, oldjuk a zárolást
      isSpinning = false;
      renderBets();
    }
  }

  // Animáció: végigmegyünk a roll listán 70ms-enként
  async function animateRoll(roll) {
    // Az issue szerint az utolsó előtti az igazi nyertes -> roll[roll.length - 2]
    // Tehát csak roll.length - 1-ig megyünk (nem írjuk ki az utolsó "padding" elemet)
    for (let i = 0; i < roll.length - 1; i++) {
      currentNumberEl.textContent = roll[i];
      // Várunk 70ms-et a következő szám előtt
      await new Promise((resolve) => globalThis.setTimeout(resolve, 70));
    }
  }

  function showResult(data) {
    if (data.win) {
      resultEl.innerHTML = `🎉 Nyertél! Kifizetés: <strong>${data.payout} Ft</strong>`;
      resultEl.style.color = "#4ade80";
    } else {
      resultEl.textContent = "😢 Vesztettél. Próbáld újra!";
      resultEl.style.color = "#dc2626";
    }
  }

  // ===== EVENT BEKÖTÉSEK =====
  addBetBtn.addEventListener("click", addBet);
  spinBtn.addEventListener("click", handleSpin);

  betTypeEl.addEventListener("change", () => {
    if (betTypeEl.value === "number") {
      betNumberEl.style.display = "inline-block";
    } else {
      betNumberEl.style.display = "none";
      betNumberEl.value = ""; // ürítjük is, ha eltűnik
    }
  });

  // ===== KEZDŐ RENDER =====
  renderBets();
}
