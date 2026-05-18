import showAlert from "../showAlert";

const RED_NUMBERS = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];
const CHIPS = [
  { value: 10, color: "#f5f5f5", text: "#222" },
  { value: 50, color: "#e74c3c", text: "#fff" },
  { value: 100, color: "#3498db", text: "#fff" },
  { value: 500, color: "#8e44ad", text: "#fff" },
  { value: 1000, color: "#f1c40f", text: "#222" },
];

const OUTSIDE_LABELS = {
  red: "PIROS",
  black: "FEKETE",
  odd: "PÁRATLAN",
  even: "PÁROS",
  low: "1-18",
  high: "19-36",
  dozen1: "1st 12",
  dozen2: "2nd 12",
  dozen3: "3rd 12",
  col1: "2:1",
  col2: "2:1",
  col3: "2:1",
};

function numberColor(n) {
  if (n === 0) return "zero";
  return RED_NUMBERS.includes(n) ? "red" : "black";
}

export function setupBettingTable(element, options) {
  // options: { getBalance, onBetsChange }
  const bets = new Map(); // type -> amount
  let lastBets = []; // legutóbbi körben elhelyezett tétek (újrafogadáshoz)
  let selectedChip = 100;
  let disabled = false;

  element.innerHTML = `
    <div class="betting-area">
      <div class="chip-selector">
        ${CHIPS.map(
          (c) => `
          <button class="chip ${c.value === selectedChip ? "selected" : ""}"
                  data-chip="${c.value}"
                  style="background:${c.color};color:${c.text}">
            ${c.value}
          </button>
        `,
        ).join("")}
        <button class="rebet-btn" id="rebet" disabled>↻ Újra</button>
        <button class="clear-btn" id="clear-all">Mind törlése</button>
      </div>

      <div class="table-grid" id="table-grid"></div>

      <div class="bet-summary">
        <span>Aktív tét: <strong id="total-bet">0 Ft</strong></span>
        <span>(Kattints: tét hozzáadása · Jobb klikk: levétel)</span>
      </div>
    </div>
  `;

  const grid = element.querySelector("#table-grid");
  const totalBetEl = element.querySelector("#total-bet");
  const chipBtns = element.querySelectorAll(".chip");
  const clearBtn = element.querySelector("#clear-all");
  const rebetBtn = element.querySelector("#rebet");

  // Build cells
  const cellMap = {}; // type -> element

  function makeCell(type, label, classes, style) {
    const cell = document.createElement("div");
    cell.className = `bet-cell ${classes || ""}`;
    if (style) cell.setAttribute("style", style);
    cell.innerHTML = `
      <span class="cell-label">${label}</span>
      <span class="chip-stack"></span>
    `;
    cell.addEventListener("click", () => placeBet(type));
    cell.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      removeBet(type);
    });
    cellMap[type] = cell;
    return cell;
  }

  // 0 - tall green cell
  const zeroCell = makeCell(
    "0",
    "0",
    "num-cell zero",
    "grid-column:1; grid-row:1 / span 3;",
  );
  grid.appendChild(zeroCell);

  // Numbers 1-36 arranged: row 1 top = 3,6,9...; row 2 = 2,5,8...; row 3 = 1,4,7...
  for (let col = 0; col < 12; col++) {
    for (let row = 0; row < 3; row++) {
      // top row (row 0) -> 3,6,9... -> 3 + col*3
      // mid row (row 1) -> 2,5,8... -> 2 + col*3
      // bot row (row 2) -> 1,4,7... -> 1 + col*3
      const num = (3 - row) + col * 3;
      const c = numberColor(num);
      const cell = makeCell(
        String(num),
        String(num),
        `num-cell ${c}`,
        `grid-column:${col + 2}; grid-row:${row + 1};`,
      );
      grid.appendChild(cell);
    }
  }

  // 2:1 column bets (right side)
  // top (row 1) -> col3 (3,6,9...), mid -> col2, bot -> col1
  const colMap = ["col3", "col2", "col1"];
  for (let row = 0; row < 3; row++) {
    const cell = makeCell(
      colMap[row],
      "2:1",
      "outside-cell col-bet",
      `grid-column:14; grid-row:${row + 1};`,
    );
    grid.appendChild(cell);
  }

  // Dozens row (row 4)
  const dozens = [
    { type: "dozen1", cols: "2 / span 4" },
    { type: "dozen2", cols: "6 / span 4" },
    { type: "dozen3", cols: "10 / span 4" },
  ];
  dozens.forEach((d) => {
    const cell = makeCell(
      d.type,
      OUTSIDE_LABELS[d.type],
      "outside-cell dozen",
      `grid-column:${d.cols}; grid-row:4;`,
    );
    grid.appendChild(cell);
  });

  // Outside bets row (row 5)
  const outsides = [
    { type: "low", cols: "2 / span 2", cls: "" },
    { type: "even", cols: "4 / span 2", cls: "" },
    { type: "red", cols: "6 / span 2", cls: "red-bg" },
    { type: "black", cols: "8 / span 2", cls: "black-bg" },
    { type: "odd", cols: "10 / span 2", cls: "" },
    { type: "high", cols: "12 / span 2", cls: "" },
  ];
  outsides.forEach((o) => {
    const cell = makeCell(
      o.type,
      OUTSIDE_LABELS[o.type],
      `outside-cell ${o.cls}`,
      `grid-column:${o.cols}; grid-row:5;`,
    );
    grid.appendChild(cell);
  });

  // Chip selector
  chipBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (disabled) return;
      selectedChip = parseInt(btn.dataset.chip);
      chipBtns.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  clearBtn.addEventListener("click", () => clearAll());
  rebetBtn.addEventListener("click", () => rebet());

  function placeBet(type) {
    if (disabled) return;
    const balance = options.getBalance();
    if (selectedChip > balance) {
      showAlert("Nincs elég egyenleged!");
      return;
    }
    const current = bets.get(type) || 0;
    bets.set(type, current + selectedChip);
    renderCell(type);
    updateTotal();
    options.onBetsChange?.(asArray(), -selectedChip);
  }

  function removeBet(type) {
    if (disabled) return;
    const current = bets.get(type) || 0;
    if (current === 0) return;
    const refund = Math.min(selectedChip, current);
    const next = current - refund;
    if (next === 0) bets.delete(type);
    else bets.set(type, next);
    renderCell(type);
    updateTotal();
    options.onBetsChange?.(asArray(), refund);
  }

  function clearAll() {
    if (disabled) return;
    let refund = 0;
    bets.forEach((v) => (refund += v));
    bets.clear();
    Object.keys(cellMap).forEach(renderCell);
    updateTotal();
    if (refund > 0) options.onBetsChange?.(asArray(), refund);
  }

  function rebet() {
    if (disabled || lastBets.length === 0) return;
    const totalCost = lastBets.reduce((acc, b) => acc + b.amount, 0);
    const balance = options.getBalance();
    if (totalCost > balance) {
      showAlert("Nincs elég egyenleged az újrafogadáshoz!");
      return;
    }
    lastBets.forEach((b) => {
      const current = bets.get(b.type) || 0;
      bets.set(b.type, current + b.amount);
      renderCell(b.type);
    });
    updateTotal();
    options.onBetsChange?.(asArray(), -totalCost);
  }

  function updateRebetButton() {
    rebetBtn.disabled = disabled || lastBets.length === 0;
  }

  function renderCell(type) {
    const cell = cellMap[type];
    if (!cell) return;
    const stack = cell.querySelector(".chip-stack");
    const amount = bets.get(type) || 0;
    if (amount === 0) {
      stack.innerHTML = "";
      cell.classList.remove("has-bet");
    } else {
      stack.innerHTML = `<span class="bet-chip">${amount}</span>`;
      cell.classList.add("has-bet");
    }
  }

  function updateTotal() {
    let total = 0;
    bets.forEach((v) => (total += v));
    totalBetEl.textContent = `${total} Ft`;
  }

  function asArray() {
    return [...bets.entries()].map(([type, amount]) => ({ type, amount }));
  }

  return {
    getBets() {
      return asArray();
    },
    clear() {
      // pörgetés után hívjuk — őrizzük meg az utolsó tétlistát újrafogadáshoz
      const snapshot = asArray();
      if (snapshot.length > 0) lastBets = snapshot;
      bets.clear();
      Object.keys(cellMap).forEach(renderCell);
      updateTotal();
      updateRebetButton();
    },
    setDisabled(value) {
      disabled = value;
      element.classList.toggle("disabled", value);
      updateRebetButton();
    },
  };
}
