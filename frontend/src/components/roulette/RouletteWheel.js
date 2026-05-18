// Európai rulett pocket-sorrend (0-tól óramutató járásával)
const EUROPEAN_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];
const RED_NUMBERS = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];
const SLICE = 360 / 37;
const SPIN_MS = 4000;

function pocketColor(num) {
  if (num === 0) return "#0a7d3c";
  return RED_NUMBERS.includes(num) ? "#c0392b" : "#1a1a1a";
}

function buildSlices(cx, cy, outerR, innerR, textR) {
  let out = "";
  for (let i = 0; i < 37; i++) {
    const num = EUROPEAN_ORDER[i];
    const a1 = ((i * SLICE - 90) * Math.PI) / 180;
    const a2 = (((i + 1) * SLICE - 90) * Math.PI) / 180;
    const aMid = (((i + 0.5) * SLICE - 90) * Math.PI) / 180;

    const x1 = cx + outerR * Math.cos(a1);
    const y1 = cy + outerR * Math.sin(a1);
    const x2 = cx + outerR * Math.cos(a2);
    const y2 = cy + outerR * Math.sin(a2);
    const x3 = cx + innerR * Math.cos(a2);
    const y3 = cy + innerR * Math.sin(a2);
    const x4 = cx + innerR * Math.cos(a1);
    const y4 = cy + innerR * Math.sin(a1);

    const path = `M ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 0 0 ${x4} ${y4} Z`;

    const tx = cx + textR * Math.cos(aMid);
    const ty = cy + textR * Math.sin(aMid);
    const textRot = (i + 0.5) * SLICE;

    out += `
      <path d="${path}" fill="${pocketColor(num)}" stroke="#d4af37" stroke-width="0.4"/>
      <text x="${tx}" y="${ty}" text-anchor="middle" dominant-baseline="central"
            fill="#fff" font-size="11" font-weight="700" font-family="Georgia, serif"
            transform="rotate(${textRot} ${tx} ${ty})">${num}</text>
    `;
  }
  return out;
}

export function setupRouletteWheel(element) {
  const cx = 200,
    cy = 200;
  const outerR = 185;
  const innerR = 115;
  const textR = 150;
  const ballOrbitR = 100;

  element.innerHTML = `
    <div class="wheel-frame">
      <div class="wheel-pointer"></div>
      <svg class="wheel-svg" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <!-- külső arany gyűrű -->
        <circle cx="${cx}" cy="${cy}" r="195" fill="#3a2a14" stroke="#d4af37" stroke-width="3"/>
        <circle cx="${cx}" cy="${cy}" r="190" fill="none" stroke="#8a6d2a" stroke-width="1"/>

        <!-- forgó kerék (számok) -->
        <g class="wheel-rotation">
          ${buildSlices(cx, cy, outerR, innerR, textR)}
          <!-- belső barna fa -->
          <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="#5a3a1a" stroke="#d4af37" stroke-width="2"/>
          <circle cx="${cx}" cy="${cy}" r="${innerR - 8}" fill="none" stroke="#8a6d2a" stroke-width="1"/>
          <!-- 8 küllős mintázat -->
          <g stroke="#d4af37" stroke-width="1.5" opacity="0.7">
            <line x1="${cx}" y1="${cy - innerR + 10}" x2="${cx}" y2="${cy + innerR - 10}"/>
            <line x1="${cx - innerR + 10}" y1="${cy}" x2="${cx + innerR - 10}" y2="${cy}"/>
            <line x1="${cx - (innerR - 10) * 0.707}" y1="${cy - (innerR - 10) * 0.707}" x2="${cx + (innerR - 10) * 0.707}" y2="${cy + (innerR - 10) * 0.707}"/>
            <line x1="${cx + (innerR - 10) * 0.707}" y1="${cy - (innerR - 10) * 0.707}" x2="${cx - (innerR - 10) * 0.707}" y2="${cy + (innerR - 10) * 0.707}"/>
          </g>
          <!-- középső gomb -->
          <circle cx="${cx}" cy="${cy}" r="22" fill="#d4af37" stroke="#8a6d2a" stroke-width="2"/>
          <circle cx="${cx}" cy="${cy}" r="14" fill="#8a6d2a"/>
        </g>

        <!-- golyó pálya -->
        <g class="ball-rotation">
          <circle cx="${cx}" cy="${cy - ballOrbitR}" r="7" fill="#fafafa" stroke="#888" stroke-width="0.5">
            <title>ball</title>
          </circle>
          <circle cx="${cx - 2}" cy="${cy - ballOrbitR - 2}" r="2" fill="#fff"/>
        </g>
      </svg>
    </div>
    <div id="wheel-result"></div>
  `;

  const wheelG = element.querySelector(".wheel-rotation");
  const ballG = element.querySelector(".ball-rotation");
  const resultEl = element.querySelector("#wheel-result");

  let wheelAngle = 0;
  let ballAngle = 0;
  // lassú folyamatos forgás amíg nincs pörgetés
  let idleRaf = null;
  let idleStart = null;

  function startIdle() {
    cancelIdle();
    idleStart = globalThis.performance.now();
    const baseWheel = wheelAngle;
    const baseBall = ballAngle;
    const tick = (t) => {
      const dt = (t - idleStart) / 1000;
      wheelG.style.transition = "none";
      ballG.style.transition = "none";
      wheelAngle = baseWheel + dt * 6; // 6°/s
      ballAngle = baseBall - dt * 10;
      wheelG.style.transform = `rotate(${wheelAngle}deg)`;
      ballG.style.transform = `rotate(${ballAngle}deg)`;
      idleRaf = globalThis.requestAnimationFrame(tick);
    };
    idleRaf = globalThis.requestAnimationFrame(tick);
  }

  function cancelIdle() {
    if (idleRaf) globalThis.cancelAnimationFrame(idleRaf);
    idleRaf = null;
  }

  async function spinTo(winningNumber) {
    cancelIdle();
    resultEl.textContent = "";
    resultEl.className = "";

    const winIndex = EUROPEAN_ORDER.indexOf(winningNumber);
    const pocketCenter = (winIndex + 0.5) * SLICE;

    // Kerék: 5 teljes körforgás előre + landolás úgy, hogy a nyerőszám felül legyen
    const baseForward = 5 * 360;
    const targetMod = ((-pocketCenter) % 360 + 360) % 360;
    let newWheel = wheelAngle + baseForward;
    const curMod = ((newWheel % 360) + 360) % 360;
    newWheel += ((targetMod - curMod) + 360) % 360;

    // Golyó: 8 körforgás visszafelé, és landoljon a felső pont fölött (a kerék felfelé hozza a nyerő számot)
    let newBall = ballAngle - 8 * 360;
    const curBallMod = ((newBall % 360) + 360) % 360;
    newBall -= curBallMod; // hogy 0° legyen mod 360

    const easing = "cubic-bezier(0.17, 0.67, 0.21, 1)";
    wheelG.style.transition = `transform ${SPIN_MS}ms ${easing}`;
    ballG.style.transition = `transform ${SPIN_MS}ms ${easing}`;
    wheelG.style.transform = `rotate(${newWheel}deg)`;
    ballG.style.transform = `rotate(${newBall}deg)`;

    wheelAngle = newWheel;
    ballAngle = newBall;

    await new Promise((r) => globalThis.setTimeout(r, SPIN_MS + 100));
  }

  function showResult(data) {
    const num = data.winningNumber;
    const color =
      num === 0 ? "green" : RED_NUMBERS.includes(num) ? "red" : "black";
    if (data.win) {
      resultEl.innerHTML = `<span class="res-num res-${color}">${num}</span> <span class="res-msg win">🎉 Nyertél! +${data.payout} Ft</span>`;
    } else {
      resultEl.innerHTML = `<span class="res-num res-${color}">${num}</span> <span class="res-msg lose">😢 Vesztettél</span>`;
    }
  }

  function reset() {
    resultEl.textContent = "";
    resultEl.className = "";
  }

  startIdle();

  return {
    spinTo,
    showResult,
    reset,
  };
}
