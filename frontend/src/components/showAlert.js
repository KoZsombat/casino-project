const STYLE_ID = "casino-alert-styles";

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .casino-alert-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: alert-fade-in 0.15s ease;
    }
    @keyframes alert-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .casino-alert-modal {
      background: #1a1a2e;
      border: 1px solid #d4af37;
      border-radius: 12px;
      padding: 2rem 2.5rem;
      max-width: 360px;
      width: 90%;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
      animation: alert-slide-up 0.18s ease;
    }
    @keyframes alert-slide-up {
      from { transform: translateY(16px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    .casino-alert-icon {
      font-size: 2rem;
      margin-bottom: 0.75rem;
    }
    .casino-alert-message {
      color: #e0e0e0;
      font-size: 1rem;
      line-height: 1.5;
      margin: 0 0 1.5rem;
    }
    .casino-alert-btn {
      background: #d4af37;
      color: #1a1a2e;
      border: none;
      border-radius: 8px;
      padding: 0.55rem 2rem;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s;
    }
    .casino-alert-btn:hover {
      background: #f0cc50;
    }
  `;
  document.head.appendChild(style);
}

export default function showAlert(message) {
  injectStyles();

  const overlay = document.createElement("div");
  overlay.className = "casino-alert-overlay";

  overlay.innerHTML = `
    <div class="casino-alert-modal" role="alertdialog" aria-modal="true">
      <div class="casino-alert-icon">⚠️</div>
      <p class="casino-alert-message">${message}</p>
      <button class="casino-alert-btn">OK</button>
    </div>
  `;

  document.body.appendChild(overlay);

  const btn = overlay.querySelector(".casino-alert-btn");
  btn.focus();

  function dismiss() {
    overlay.remove();
    document.removeEventListener("keydown", onKey);
  }

  function onKey(e) {
    if (e.key === "Escape" || e.key === "Enter") dismiss();
  }

  btn.addEventListener("click", dismiss);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) dismiss(); });
  document.addEventListener("keydown", onKey);
}
