import "./Home.css";

export function setupHome(element) {
  element.innerHTML = `
    <div class="landing-page">

      <div class="floating-bg" id="floatingBgContainer"></div>

      <header class="casino-navbar">
        <div class="nav-logo">🎰 CASINO</div>
        <div class="nav-actions">
          <div class="balance-badge">
            <span class="balance-label">Balance:</span>
            <span class="balance-amount" id="userBalance">$0</span>
          </div>
          <button class="btn btn-login" id="authBtn">Login</button>
        </div>
      </header>

      <section class="casino-hero">
        <div class="hero-container">
          <h1 class="hero-title">Try your luck today!</h1>
          <p class="hero-subtitle">Join the most exciting online platform and play risk-free with virtual balance.</p>
          <button class="btn btn-hero-action" id="heroActionBtn">+ Add $500</button>
        </div>
      </section>

      <section class="casino-explore">
        <h2 class="section-title">Available Games</h2>
        <div class="games-grid">

          <div class="game-card" data-route="/slot">
            <div class="card-image-wrapper">
              <img src="https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=640&auto=format&fit=crop" alt="Slot Machine" class="card-image">
            </div>
            <div class="card-content">
              <div class="card-meta">Minimum bet: $10</div>
              <h3>Slot Machine</h3>
              <p>Spin the reels and win the jackpot!</p>
            </div>
            <button class="btn btn-play-game">Play Now</button>
          </div>

          <div class="game-card" data-route="/blackjack">
            <div class="card-image-wrapper">
              <img src="https://images.unsplash.com/photo-1618304925090-b68a8c744cbe?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Blackjack" class="card-image">
            </div>
            <div class="card-content">
              <div class="card-meta">Minimum bet: $10</div>
              <h3>Blackjack</h3>
              <p>Get close to 21, make strategic decisions, and beat the dealer!</p>
            </div>
            <button class="btn btn-play-game">Play Now</button>
          </div>

          <div class="game-card" data-route="/roulette">
            <div class="card-image-wrapper">
              <img src="https://images.unsplash.com/photo-1714865212807-3ae87635a38d?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Roulette" class="card-image">
            </div>
            <div class="card-content">
              <div class="card-meta">Minimum bet: $10</div>
              <h3>Roulette</h3>
              <p>Place your bets on your favorite numbers or colors and watch the ball!</p>
            </div>
            <button class="btn btn-play-game">Play Now</button>
          </div>

        </div>
      </section>

      <footer class="casino-footer">
        <p>⚠️ 18+ | Play responsibly! Games use virtual balance only.</p>
      </footer>

    </div>
  `;

  createFloatingElements(element);
  initHomeEvents(element);
  loadBalance(element);
}

async function loadBalance(element) {
  const balanceEl = element.querySelector("#userBalance");
  const authBtn = element.querySelector("#authBtn");

  try {
    const res = await fetch("/api/user/balance", { credentials: "include" });

    if (res.ok) {
      const data = await res.json();
      if (balanceEl && data.balance != null) {
        balanceEl.innerText = `$${Math.round(data.balance).toLocaleString("en-US")}`;
      }
      if (authBtn) {
        authBtn.textContent = "Logout";
        authBtn.onclick = async () => {
          authBtn.disabled = true;
          try {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
          } catch {
            // ignore network errors during logout
          }
          if (balanceEl) balanceEl.innerText = "$0";
          authBtn.textContent = "Login";
          authBtn.disabled = false;
          authBtn.onclick = () => { window.location.hash = "#/login"; };
        };
      }
    } else {
      if (authBtn) {
        authBtn.textContent = "Login";
        authBtn.onclick = () => { window.location.hash = "#/login"; };
      }
    }
  } catch {
    if (authBtn) {
      authBtn.textContent = "Login";
      authBtn.onclick = () => { window.location.hash = "#/login"; };
    }
  }
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

  const totalCount = 50;

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

function initHomeEvents(element) {
  element.querySelectorAll(".game-card").forEach((card) => {
    const route = card.dataset.route;
    card.addEventListener("click", () => {
      window.location.hash = "#" + route;
    });
  });

  const addBalanceBtn = element.querySelector("#heroActionBtn");
  if (addBalanceBtn) {
    addBalanceBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      addBalanceBtn.disabled = true;
      try {
        const res = await fetch("/api/transactions/deposit", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: 500 }),
        });
        if (!res.ok) return;
        const data = await res.json();
        const balanceEl = element.querySelector("#userBalance");
        if (balanceEl && data.newBalance != null) {
          balanceEl.innerText = `$${Math.round(data.newBalance).toLocaleString("en-US")}`;
        }
      } catch (err) {
        console.error(err);
      } finally {
        addBalanceBtn.disabled = false;
      }
    });
  }
}
