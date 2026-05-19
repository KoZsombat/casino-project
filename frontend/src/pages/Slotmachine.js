import showAlert from "../components/showAlert.js";
import "./Slotmachine.css";
import { setupGameHeader } from "../components/GameHeader.js";
import { fetchBalance } from "../api/blackjack.js";
import { spinSlot } from "../api/slot.js";

const SYMBOLS = [
  { id: "cherry",  label: "🍒" },
  { id: "lemon",   label: "🍋" },
  { id: "orange",  label: "🍊" },
  { id: "grape",   label: "🍇" },
  { id: "bell",    label: "🔔" },
  { id: "seven",   label: "7"  },
  { id: "diamond", label: "♦"  },
  { id: "bonus",   label: "🎰" },
];

const BACKEND_TO_SYMBOL = {
  20:      { id: "cherry",  label: "🍒", name: "Cherry"  },
  50:      { id: "lemon",   label: "🍋", name: "Lemon"   },
  100:     { id: "orange",  label: "🍊", name: "Orange"  },
  200:     { id: "grape",   label: "🍇", name: "Grape"   },
  500:     { id: "bell",    label: "🔔", name: "Bell"    },
  1000:    { id: "seven",   label: "7",  name: "Seven"   },
  2000:    { id: "diamond", label: "♦",  name: "Diamond" },
  "Bonus": { id: "bonus",   label: "🎰", name: "Bonus"   },
};

const PAYTABLE = [
  { id: "bonus",   label: "🎰", payout: "$5,000" },
  { id: "diamond", label: "♦",  payout: "×20"   },
  { id: "seven",   label: "7",  payout: "×10"   },
  { id: "bell",    label: "🔔", payout: "×5"    },
  { id: "grape",   label: "🍇", payout: "×2"    },
  { id: "orange",  label: "🍊", payout: "×1"    },
  { id: "lemon",   label: "🍋", payout: "×0.5"  },
  { id: "cherry",  label: "🍒", payout: "×0.2"  },
];

function wait(ms) {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}

const VISIBLE   = 3;
const STRIP_LEN = 24;

function getSymH() {
  return parseFloat(window.getComputedStyle(document.documentElement).getPropertyValue("--sm-sym-h")) || 130;
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

    const mobile  = window.innerWidth <= 860;
    const dist    = mobile ? 80  : 130;
    const scale   = mobile ? 0.5 : 0.52;

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

    const ballRetKf = mobile
      ? [
          { transform: `translateX(${dist}px)` },
          { transform: "translateX(-12px)", offset: 0.45 },
          { transform: "translateX(4px)",   offset: 0.68 },
          { transform: "translateX(-1px)",  offset: 0.84 },
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
          { transform: "scaleX(1.06)",  offset: 0.45 },
          { transform: "scaleX(0.97)",  offset: 0.68 },
          { transform: "scaleX(1.01)",  offset: 0.84 },
          { transform: "scaleX(1)" },
        ]
      : [
          { transform: `scaleY(${scale})` },
          { transform: "scaleY(1.06)",  offset: 0.45 },
          { transform: "scaleY(0.97)",  offset: 0.68 },
          { transform: "scaleY(1.01)",  offset: 0.84 },
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
  let balance    = 0;
  let spinning   = false;
  let currentBet = 10;

  const BET_OPTIONS = [10, 25, 50, 100, 500];

  element.innerHTML = `
    <div class="sm-page">
      <div id="sm-header"></div>

      <h1 class="sm-title">Slot Machine</h1>
      <div class="sm-subtitle">Match symbols · Pull the lever</div>
      <div class="sm-table-divider"></div>

      <div class="sm-arena">

        <aside class="sm-paytable">
          <div class="sm-paytable-title">Payouts</div>
          <div class="sm-paytable-grid">
            ${PAYTABLE.map((s) => `
              <div class="sm-pay-row">
                <span class="sm-pay-sym sm-sym-${s.id}">${s.label}${s.label}${s.label}</span>
                <span class="sm-pay-mult">${s.payout}</span>
              </div>`).join("")}
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
            <div class="sm-bet-label">Bet</div>
            <div class="sm-chips-rack" id="sm-chips-rack">
              ${BET_OPTIONS.map((v) =>
                `<button class="sm-chip sm-chip-${v}${v === currentBet ? " sm-chip-active" : ""}" data-bet="${v}">${v}</button>`
              ).join("")}
            </div>
            <div class="sm-bet-display">
              Current bet: <span class="sm-bet-value" id="sm-bet-value">$${currentBet}</span>
            </div>
          </div>
        </div>

        <div class="sm-lever-col" id="sm-lever-wrap">
          <div class="sm-lever-track">
            <div class="sm-lever-ball"  id="sm-lever-ball">PULL</div>
            <div class="sm-lever-stick" id="sm-lever-stick"></div>
          </div>
          <div class="sm-lever-base"></div>
          <div class="sm-lever-hint" id="sm-lever-hint">Pull!</div>
        </div>

      </div>
    </div>
  `;

  const header = setupGameHeader(element.querySelector("#sm-header"), {
    initialBalance: 0,
    onBack: () => { if (options.onBack) options.onBack(); },
  });

  fetchBalance().then((bal) => {
    if (bal != null) {
      balance = bal;
      header.setBalance(bal);
    }
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
    betValueEl.textContent = `$${currentBet}`;
    chipsRack.querySelectorAll(".sm-chip").forEach((b) =>
      b.classList.toggle("sm-chip-active", b === btn)
    );
  });

  async function handleSpin() {
    if (spinning) return;
    if (balance < currentBet) {
      showAlert("Insufficient balance!");
      return;
    }

    spinning = true;
    lever.setLocked(true);
    resultEl.className = "sm-result-area";
    resultEl.textContent = "";
    reels.forEach((r) => r.highlight(false));

    try {
      const data = await spinSlot(currentBet);
      const { symbols, win, payout, newBalance } = data;

      // Winning symbol is at index 27 (length - 3) per reel
      const targets = [0, 1, 2].map((i) => {
        const key = symbols[i][27];
        return BACKEND_TO_SYMBOL[key] ?? SYMBOLS[0];
      });

      await Promise.all(targets.map((t, i) => reels[i].spin(t, 900 + i * 350)));

      balance = parseFloat(newBalance);
      header.setBalance(balance);

      if (win) reels.forEach((r) => r.highlight(true));
      showResult({ win, payout, winSym: targets[0] });
    } catch (err) {
      showAlert(err.message || "An error occurred. Please try again.");
    } finally {
      spinning = false;
      lever.setLocked(false);
    }
  }

  function showResult({ win, payout, winSym }) {
    let cls = "sm-result-lose";
    let label = "No match. Try again!";
    let payoutStr = "";

    if (win) {
      if (winSym.id === "bonus") {
        cls = "sm-result-jackpot";
        label = "JACKPOT!";
      } else {
        cls = "sm-result-win";
        label = `Three ${winSym.name}!`;
      }
      payoutStr = `+$${Math.round(payout).toLocaleString("en-US")}`;
    }

    resultEl.className = `sm-result-area ${cls} sm-result-show`;
    resultEl.innerHTML = `
      <span class="sm-result-label">${label}</span>
      ${payoutStr ? `<span class="sm-result-payout">${payoutStr}</span>` : ""}
    `;
  }
}
