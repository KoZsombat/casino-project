// src/components/auth/authShell.js
// Shared wireframe for Login and Register pages: navbar, floating bg,
// card with title/tabs, form slot, footnote, footer.

export function renderAuthShell(element, { mode, navigate, onBack }) {
  const isLogin = mode === "login";

  element.innerHTML = `
    <div class="auth-page">

      <div class="floating-bg" id="floatingBgContainer"></div>

      <header class="casino-navbar">
        <button class="nav-logo" id="navLogo">🎰 CASINO</button>
        <div class="nav-actions">
          <button class="btn btn-back" id="backBtn">← Vissza</button>
        </div>
      </header>

      <main class="auth-main">
        <div class="auth-card">
          <h1 class="auth-title">${isLogin ? "Bejelentkezés" : "Regisztráció"}</h1>
          <p class="auth-subtitle">${
            isLogin
              ? "Üdvözlünk újra az asztalnál!"
              : "Csatlakozz, és 1.000 Ft kezdő egyenleget kapsz!"
          }</p>

          <div class="auth-tabs" role="tablist">
            <button class="auth-tab ${isLogin ? "active" : ""}" data-target="/login" role="tab">Bejelentkezés</button>
            <button class="auth-tab ${isLogin ? "" : "active"}" data-target="/register" role="tab">Regisztráció</button>
          </div>

          <div class="form-error" id="formError"></div>

          <div id="authFormSlot"></div>

          <div class="auth-divider">VAGY</div>

          <p class="auth-footnote">
            ${
              isLogin
                ? 'Még nincs fiókod? <button type="button" id="switchModeBtn">Regisztrálj most</button>'
                : 'Már van fiókod? <button type="button" id="switchModeBtn">Jelentkezz be</button>'
            }
          </p>
        </div>
      </main>

      <footer class="casino-footer">
        <p>⚠️ 18+ | Játssz felelősséggel! A játékok kizárólag virtuális egyenleggel működnek.</p>
      </footer>

    </div>
  `;

  createFloatingElements(element);

  element.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.target;
      if (target) navigate(target);
    });
  });

  element.querySelector("#switchModeBtn").addEventListener("click", () => {
    navigate(isLogin ? "/register" : "/login");
  });

  element.querySelector("#backBtn").addEventListener("click", () => {
    if (onBack) onBack();
    else navigate("/");
  });

  element.querySelector("#navLogo").addEventListener("click", () => navigate("/"));

  return {
    formSlot: element.querySelector("#authFormSlot"),
    errorBox: element.querySelector("#formError"),
  };
}

function createFloatingElements(element) {
  const container = element.querySelector("#floatingBgContainer");
  if (!container) return;

  const items = [
    { text: "🂱", type: "card red" },
    { text: "🂮", type: "card black" },
    { text: "🂢", type: "card black" },
    { text: "🃁", type: "card red" },
    { text: "🃎", type: "card red" },
    { text: "🪙", type: "chip gold" },
    { text: "🪙", type: "chip green" },
    { text: "🪙", type: "chip black" },
  ];

  const totalCount = 40;

  for (let i = 0; i < totalCount; i++) {
    const randomItem = items[Math.floor(Math.random() * items.length)];
    const div = document.createElement("div");

    div.className = `floating-item ${randomItem.type}`;
    div.innerText = randomItem.text;

    const size = Math.random() * (6 - 2.5) + 2.5;
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const delay = Math.random() * -20;
    const duration = Math.random() * (25 - 10) + 10;

    div.style.left = `${left}%`;
    div.style.top = `${top}%`;
    div.style.fontSize = `${size}rem`;
    div.style.animationDelay = `${delay}s`;
    div.style.animationDuration = `${duration}s`;

    if (size < 4) {
      div.style.filter = `blur(${Math.random() * 3 + 1}px)`;
      div.style.opacity = Math.random() * (0.07 - 0.03) + 0.03;
    } else {
      div.style.opacity = Math.random() * (0.16 - 0.09) + 0.09;
    }

    container.appendChild(div);
  }
}

export function showFormError(errorBox, msg) {
  if (!errorBox) return;
  errorBox.textContent = msg;
  errorBox.classList.add("visible");
}

export function clearFormError(errorBox) {
  if (!errorBox) return;
  errorBox.textContent = "";
  errorBox.classList.remove("visible");
}
