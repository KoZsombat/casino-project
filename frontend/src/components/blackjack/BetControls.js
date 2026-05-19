import showAlert from "../showAlert.js";

const CHIP_DENOMS = [10, 50, 100, 500, 1000, 5000];
const MAX_BET = 10000;

function formatChipLabel(value) {
  if (value >= 1000) return `${value / 1000}K`;
  return String(value);
}

export function setupBetControls(element, options) {
  const placedChips = [];

  element.innerHTML = `
    <div class="bet-controls">
      <div class="chips-rack">
        ${CHIP_DENOMS.map(
          (v) =>
            `<button type="button" class="chip chip-${v}" data-value="${v}" title="Add $${v}">${formatChipLabel(v)}</button>`,
        ).join("")}
        <button type="button" class="clear-bet-btn">Clear All</button>
      </div>
      <div class="bet-spot">
        <div class="bet-spot-circle">
          <div class="bet-spot-chips"></div>
          <div class="bet-amount">$0</div>
        </div>
        <button id="start-btn" type="button" disabled>Deal</button>
        <p class="bet-hint">Click chips to add bet (max $${MAX_BET.toLocaleString("en-US")}) · Right-click to remove</p>
      </div>
    </div>
  `;

  const chipButtons = Array.from(element.querySelectorAll(".chip[data-value]"));
  const clearBtn = element.querySelector(".clear-bet-btn");
  const startBtn = element.querySelector("#start-btn");
  const betAmountEl = element.querySelector(".bet-amount");
  const betSpotChipsEl = element.querySelector(".bet-spot-chips");
  const betSpotCircleEl = element.querySelector(".bet-spot-circle");

  function totalBet() {
    return placedChips.reduce((sum, v) => sum + v, 0);
  }

  function renderSpot() {
    const total = totalBet();
    betAmountEl.textContent = `$${total.toLocaleString("en-US")}`;

    betSpotChipsEl.innerHTML = "";
    const stackOffsetY = 4;
    const baseY = 24;
    placedChips.slice(-12).forEach((value, idx) => {
      const chip = document.createElement("div");
      chip.className = `chip chip-${value}`;
      chip.textContent = formatChipLabel(value);
      chip.style.transform = `translateY(${baseY - idx * stackOffsetY}px)`;
      betSpotChipsEl.appendChild(chip);
    });

    refreshChipStates();
    startBtn.disabled = total <= 0;
    clearBtn.disabled = total <= 0;
  }

  function refreshChipStates() {
    const total = totalBet();
    const balance = options.getBalance();
    chipButtons.forEach((btn) => {
      const value = parseInt(btn.dataset.value, 10);
      const wouldExceedMax = total + value > MAX_BET;
      const wouldExceedBalance = total + value > balance;
      btn.disabled = wouldExceedMax || wouldExceedBalance;
    });
  }

  function addChip(value) {
    const total = totalBet();
    const balance = options.getBalance();
    if (total + value > MAX_BET) {
      showAlert(`Maximum bet is $${MAX_BET.toLocaleString("en-US")}.`);
      return;
    }
    if (total + value > balance) {
      showAlert("Insufficient balance!");
      return;
    }
    placedChips.push(value);
    renderSpot();
  }

  function removeChip(value) {
    const lastIdx = placedChips.lastIndexOf(value);
    if (lastIdx !== -1) {
      placedChips.splice(lastIdx, 1);
      renderSpot();
    }
  }

  function clearBet() {
    placedChips.length = 0;
    renderSpot();
  }

  chipButtons.forEach((btn) => {
    const value = parseInt(btn.dataset.value, 10);
    btn.addEventListener("click", () => addChip(value));
    btn.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      removeChip(value);
    });
  });

  betSpotCircleEl.addEventListener("click", () => {
    if (placedChips.length === 0) return;
    placedChips.pop();
    renderSpot();
  });

  clearBtn.addEventListener("click", clearBet);

  startBtn.addEventListener("click", () => {
    const bet = totalBet();
    if (bet <= 0) return;
    if (bet > options.getBalance()) {
      showAlert("Insufficient balance!");
      return;
    }
    if (options.onStart) {
      options.onStart(bet);
    }
  });

  renderSpot();

  return {
    show() {
      element.style.display = "block";
      refreshChipStates();
    },
    hide() {
      element.style.display = "none";
    },
    reset() {
      clearBet();
    },
    refreshChips() {
      refreshChipStates();
    },
  };
}
