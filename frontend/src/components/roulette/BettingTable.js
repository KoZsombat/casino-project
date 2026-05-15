import showAlert from "../showAlert";

export function setupBettingTable(element, options) {
  // options = {
  //   getBalance: function,    // visszaadja az aktuális egyenleget
  //   onBetsChange: function   // hívjuk, ha változik a bets lista (kapja a bets-et)
  //                            // és a "költség delta"-t (negatív = pénz kivét, pozitív = visszaadás)
  // }

  let bets = [];
  let disabled = false;

  element.innerHTML = `
    <div class="betting-table">
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
    </div>
  `;

  // ===== DOM ELEMEK =====
  const betTypeEl = element.querySelector("#bet-type");
  const betNumberEl = element.querySelector("#bet-number");
  const betAmountEl = element.querySelector("#bet-amount");
  const addBetBtn = element.querySelector("#add-bet-btn");
  const betsUl = element.querySelector("#bets-ul");

  function renderBets() {
    betsUl.innerHTML = "";
    bets.forEach((bet, index) => {
      const li = document.createElement("li");
      const label = getBetLabel(bet.type);
      li.textContent = `${label} - ${bet.amount} Ft`;

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "X";
      removeBtn.addEventListener("click", () => removeBet(index));
      removeBtn.disabled = disabled;
      li.appendChild(removeBtn);
      betsUl.appendChild(li);
    });
    addBetBtn.disabled = disabled;
  }

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
        return `Szám: ${type}`;
    }
  }

  function addBet() {
    let type = betTypeEl.value;
    const amount = parseInt(betAmountEl.value);

    if (type === "number") {
      const number = parseInt(betNumberEl.value);
      if (isNaN(number) || number < 0 || number > 36) {
        showAlert("Adj meg egy számot 0 és 36 között!");
        return;
      }
      type = number.toString();
    }

    if (!amount || amount <= 0) {
      showAlert("Adj meg érvényes összeget!");
      return;
    }

    const balance = options.getBalance();
    if (amount > balance) {
      showAlert("Nincs elég egyenleged!");
      return;
    }

    bets.push({ type, amount });
    renderBets();
    betAmountEl.value = "";
    betNumberEl.value = "";

    if (options.onBetsChange) {
      options.onBetsChange(bets, -amount);
    }
  }

  function removeBet(index) {
    const refundAmount = bets[index].amount;
    bets.splice(index, 1);
    renderBets();

    if (options.onBetsChange) {
      options.onBetsChange(bets, refundAmount);
    }
  }

  function clearBets() {
    bets = [];
    renderBets();
  }

  addBetBtn.addEventListener("click", addBet);

  betTypeEl.addEventListener("change", () => {
    if (betTypeEl.value === "number") {
      betNumberEl.style.display = "inline-block";
    } else {
      betNumberEl.style.display = "none";
      betNumberEl.value = "";
    }
  });

  renderBets();

  return {
    getBets() {
      return bets;
    },
    clear() {
      clearBets();
    },
    setDisabled(value) {
      disabled = value;
      renderBets();
    },
  };
}
