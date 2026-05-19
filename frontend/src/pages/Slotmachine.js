import showAlert from "../components/showAlert.js";
import "./SlotMachine.css";
import { setupGameHeader } from "../components/GameHeader.js";

const SYMBOLS = [
  { id: "cherry",  label: "🍒", name: "Cseresznye", weight: 30, payout: 2   },
  { id: "lemon",   label: "🍋", name: "Citrom",     weight: 25, payout: 3   },
  { id: "orange",  label: "🍊", name: "Narancs",    weight: 20, payout: 4   },
  { id: "grape",   label: "🍇", name: "Szőlő",      weight: 15, payout: 6   },
  { id: "bell",    label: "🔔", name: "Csengő",     weight: 6,  payout: 15  },
  { id: "seven",   label: "7",  name: "Hetes",      weight: 3,  payout: 50  },
  { id: "diamond", label: "♦",  name: "Gyémánt",    weight: 1,  payout: 100 },
];

const TOTAL_WEIGHT = SYMBOLS.reduce((s, sym) => s + sym.weight, 0);

function wait(ms) {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}

function pickSymbol() {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const sym of SYMBOLS) {
    r -= sym.weight;
    if (r <= 0) return sym;
  }
  return SYMBOLS[0];
}

function calcResult(reels, bet) {
  const [a, b, c] = reels;
  if (a.id === b.id && b.id === c.id) {
    const jackpot = a.id === "diamond";
    return {
      type: jackpot ? "jackpot" : "win3",
      payout: bet * a.payout,
      label: jackpot ? "JACKPOT!" : `Három ${a.name}!`,
    };
  }
  if (a.id === b.id || b.id === c.id || a.id === c.id) {
    return { type: "win2", payout: Math.floor(bet * 0.5), label: "Pár — fél tét vissza!" };
  }
  return { type: "lose", payout: 0, label: "Nem nyertél. Próbáld újra!" };
}

const VISIBLE   = 3;
const STRIP_LEN = 24;

function getSymH() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sm-sym-h")) || 130;
}

function buildStrip(target) {
  const strip = Array.from({ length: STRIP_LEN }, () =>
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
  );
  strip[STRIP_LEN - 2] = target;
  return strip;
}

function setupReel(container) {
  const el = container.querySelector(".sm-reel-inner");

  function setSymbols(syms) {
    el.innerHTML = syms
      .map((s) => `<div class="sm-symbol sm-sym-${s.id}"><span class="sm-sym-label">${s.label}</span></div>`)
      .join("");
  }

  setSymbols(Array.from({ length: VISIBLE }, () =>
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
  ));

  async function spin(target, duration) {
    const symH = getSymH();
    const strip = buildStrip(target);
    setSymbols(strip);
    const totalScroll = (strip.length - VISIBLE) * symH;
    el.style.transition = "none";
    el.style.transform  = "translateY(0)";
    await wait(20);
    el.style.transition = `transform ${duration}ms cubic-bezier(0.12, 0.8, 0.35, 1)`;
    el.style.transform  = `translateY(-${totalScroll}px)`;
    await wait(duration);
    const visible = strip.slice(strip.length - VISIBLE);
    el.style.transition = "none";
    el.style.transform  = "translateY(0)";
    setSymbols(visible);
  }

  function highlight(on) {
    container.classList.toggle("sm-reel-win", on);
  }

  return { spin, highlight };
}

function setupLever(leverWrap, onPull) {
  const track = leverWrap.querySelector(".sm-lever-track");
  const ball  = leverWrap.querySelector(".sm-lever-ball");
  const stick = leverWrap.querySelector(".sm-lever-stick");
  const hint  = leverWrap.querySelector(".sm-lever-hint");
  let locked  = false;

  async function pull() {
    if (locked) return;
    locked = true;
    hint.style.opacity = "0";

    // Asztali: gömb lefelé, rúd rövidül (szemből nézett perspektíva-hatás)
    // Mobil: gömb balra (kihúzás a gép felé), rúd rövidül X-ben
    const mobile  = window.innerWidth <= 860;
    const dist    = mobile ? 80  : 130;   // px, gömb elmozdulása
    const scale   = mobile ? 0.5 : 0.52;  // rúd összehúzódás mértéke

    const ballPullKf = mobile
      ? [{ transform: "translateX(0)" }, { transform: `translateX(${dist}px)` }]
      : [{ transform: "translateY(0)" }, { transform: `translateY(${dist}px)` }];

    const stickPullKf = mobile
      ? [{ transform: "scaleX(1)" }, { transform: `scaleX(${scale})` }]
      : [{ transform: "scaleY(1)" }, { transform: `scaleY(${scale})` }];

    const opts = { duration: 360, easing: "cubic-bezier(0.55,0,1,0.45)", fill: "forwards" };
    const bP = ball.animate(ballPullKf,  opts);
    const sP = stick.animate(stickPullKf, opts);
    await Promise.all([bP.finished, sP.finished]);

    // Rugós visszapattanás — gömb és rúd koordináltan lő vissza
    const ballRetKf = mobile
      ? [
          { transform: `translateX(${dist}px)` },
          { transform: "translateX(-12px)", offset: 0.45 },
          { transform: "translateX(4px)",  offset: 0.68 },
          { transform: "translateX(-1px)", offset: 0.84 },
          { transform: "translateX(0)" },
        ]
      : [
          { transform: `translateY(${dist}px)` },
          { transform: "translateY(-18px)", offset: 0.45 },
          { transform: "translateY(6px)",   offset: 0.68 },
          { transform: "translateY(-2px)",  offset: 0.84 },
          { transform: "translateY(0)" },
        ];

    const stickRetKf = mobile
      ? [
          { transform: `scaleX(${scale})` },
          { transform: "scaleX(1.06)",   offset: 0.45 },
          { transform: "scaleX(0.97)",   offset: 0.68 },
          { transform: "scaleX(1.01)",   offset: 0.84 },
          { transform: "scaleX(1)" },
        ]
      : [
          { transform: `scaleY(${scale})` },
          { transform: "scaleY(1.06)",   offset: 0.45 },
          { transform: "scaleY(0.97)",   offset: 0.68 },
          { transform: "scaleY(1.01)",   offset: 0.84 },
          { transform: "scaleY(1)" },
        ];

    const retOpts = { duration: 520, easing: "linear", fill: "forwards" };
    const bR = ball.animate(ballRetKf,  retOpts);
    const sR = stick.animate(stickRetKf, retOpts);
    await Promise.all([bR.finished, sR.finished]);

    bP.cancel(); sP.cancel(); bR.cancel(); sR.cancel();

    await onPull();

    locked = false;
    hint.style.opacity = "1";
  }

  track.addEventListener("click", pull);

  function setLocked(val) {
    locked = val;
    leverWrap.classList.toggle("sm-lever-disabled", val);
  }

  return { setLocked };
}

export function setupSlotMachine(element, options = {}) {
  let balance    = 1000;
  let spinning   = false;
  let currentBet = 10;

  const BET_OPTIONS = [5, 10, 25, 50, 100, 500];

  element.innerHTML = `
    <div class="sm-page">
      <div id="sm-header"></div>

      <h1 class="sm-title">Slot Machine</h1>
      <div class="sm-subtitle">Match symbols · Pull the lever</div>
      <div class="sm-table-divider"></div>

      <div class="sm-arena">

        <aside class="sm-paytable">
          <div class="sm-paytable-title">Kifizetések</div>
          <div class="sm-paytable-grid">
            ${SYMBOLS.slice().reverse().map((s) => `
              <div class="sm-pay-row">
                <span class="sm-pay-sym sm-sym-${s.id}">${s.label}${s.label}${s.label}</span>
                <span class="sm-pay-mult">×${s.payout}</span>
              </div>`).join("")}
            <div class="sm-pay-row sm-pay-pair">
              <span class="sm-pay-sym">Pár</span>
              <span class="sm-pay-mult">×0.5</span>
            </div>
          </div>
        </aside>

        <div class="sm-machine-col">
          <div class="sm-cabinet">
            <div class="sm-reels-frame">
              <div class="sm-payline sm-payline-top"></div>
              <div class="sm-payline sm-payline-mid"></div>
              <div class="sm-payline sm-payline-bot"></div>
              <div class="sm-reels">
                ${[0, 1, 2].map((i) => `
                  <div class="sm-reel" id="sm-reel-${i}">
                    <div class="sm-reel-inner"></div>
                  </div>`).join("")}
              </div>
            </div>
            <div class="sm-result-area" id="sm-result-area"></div>
          </div>

          <div class="sm-controls">
            <div class="sm-bet-label">Tét</div>
            <div class="sm-chips-rack" id="sm-chips-rack">
              ${BET_OPTIONS.map((v) =>
                `<button class="sm-chip sm-chip-${v}${v === currentBet ? " sm-chip-active" : ""}" data-bet="${v}">${v}</button>`
              ).join("")}
            </div>
            <div class="sm-bet-display">
              Jelenlegi tét: <span class="sm-bet-value" id="sm-bet-value">${currentBet}</span>
            </div>
          </div>
        </div>

        <div class="sm-lever-col" id="sm-lever-wrap">
          <div class="sm-lever-track">
            <div class="sm-lever-ball"  id="sm-lever-ball">PULL</div>
            <div class="sm-lever-stick" id="sm-lever-stick"></div>
          </div>
          <div class="sm-lever-base"></div>
          <div class="sm-lever-hint" id="sm-lever-hint">Húzd le!</div>
        </div>

      </div>
    </div>
  `;

  const header = setupGameHeader(element.querySelector("#sm-header"), {
    initialBalance: balance,
    onBack: () => { if (options.onBack) options.onBack(); },
  });

  const reels = [0, 1, 2].map((i) => setupReel(element.querySelector(`#sm-reel-${i}`)));

  const lever = setupLever(element.querySelector("#sm-lever-wrap"), handleSpin);

  const chipsRack  = element.querySelector("#sm-chips-rack");
  const betValueEl = element.querySelector("#sm-bet-value");
  const resultEl   = element.querySelector("#sm-result-area");

  chipsRack.addEventListener("click", (e) => {
    const btn = e.target.closest(".sm-chip");
    if (!btn || spinning) return;
    currentBet = parseInt(btn.dataset.bet, 10);
    betValueEl.textContent = currentBet;
    chipsRack.querySelectorAll(".sm-chip").forEach((b) =>
      b.classList.toggle("sm-chip-active", b === btn)
    );
  });

  async function handleSpin() {
    if (spinning) return;
    if (balance < currentBet) {
      showAlert("Nincs elegendő egyenleged!");
      return;
    }

    spinning = true;
    lever.setLocked(true);
    resultEl.className = "sm-result-area";
    resultEl.textContent = "";
    reels.forEach((r) => r.highlight(false));

    balance -= currentBet;
    header.setBalance(balance);

    const targets = [pickSymbol(), pickSymbol(), pickSymbol()];
    const result  = calcResult(targets, currentBet);

    await Promise.all(targets.map((t, i) => reels[i].spin(t, 900 + i * 350)));

    balance += result.payout;
    header.setBalance(balance);

    if (result.type !== "lose") reels.forEach((r) => r.highlight(true));
    showResult(result);

    spinning = false;
    lever.setLocked(false);
  }

  function showResult(result) {
    let cls = "sm-result-lose";
    if (result.type === "jackpot") cls = "sm-result-jackpot";
    else if (result.type === "win3") cls = "sm-result-win";
    else if (result.type === "win2") cls = "sm-result-half";

    resultEl.className = `sm-result-area ${cls} sm-result-show`;
    resultEl.innerHTML = `
      <span class="sm-result-label">${result.label}</span>
      ${result.payout > 0 ? `<span class="sm-result-payout">+${result.payout}</span>` : ""}
    `;
  }
}