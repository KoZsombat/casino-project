export function setupPlayerHand(element) {
  element.innerHTML = `<div id="player-hands"></div>`;
  const container = element.querySelector("#player-hands");

  // Track the previously-rendered card sequence per hand index so we can
  // mark only newly added/changed cards with the deal animation.
  let prevHands = [];

  function createCardElement(card, { rotated = false, fresh = false } = {}) {
    const cardEl = document.createElement("div");
    cardEl.className = "card";

    const suit = card.slice(-1);
    if (suit === "♥" || suit === "♦") {
      cardEl.classList.add("card-red");
    } else {
      cardEl.classList.add("card-black");
    }
    cardEl.textContent = card;

    if (rotated) cardEl.classList.add("card-doubled");
    if (fresh) cardEl.classList.add("card-new");

    if (rotated) {
      const slot = document.createElement("div");
      slot.className = "card-slot rotated";
      slot.appendChild(cardEl);
      return slot;
    }
    return cardEl;
  }

  function appendCards(targetEl, cards, prevCards, options) {
    const doubledIndex = options?.doubledIndex;
    cards.forEach((card, idx) => {
      const fresh = prevCards[idx] !== card;
      const rotated = doubledIndex !== undefined && idx === doubledIndex;
      targetEl.appendChild(createCardElement(card, { rotated, fresh }));
    });
  }

  function renderSingle(cards, score, opts = {}) {
    container.className = "";
    container.innerHTML = `
      <div class="hand player-hand">
        <div class="hand-header">
          <span class="hand-label">Játékos</span>
          <span class="hand-meta">Pont: <strong>${score ?? "-"}</strong></span>
        </div>
        <div class="cards"></div>
      </div>
    `;
    const cardsEl = container.querySelector(".cards");
    const prev = prevHands[0]?.cards ?? [];
    appendCards(cardsEl, cards, prev, { doubledIndex: opts.doubledIndex });
    prevHands = [{ cards: [...cards] }];
  }

  function renderMulti(hands, activeIndex) {
    container.className = "multi";
    container.innerHTML = "";
    hands.forEach((hand, index) => {
      const wrap = document.createElement("div");
      wrap.className = "hand player-hand";
      if (index === activeIndex && !hand.finished) {
        wrap.classList.add("split-active");
      }
      if (hand.finished) {
        wrap.classList.add("split-done");
      }

      const badges = [];
      if (hand.doubled) badges.push(`<span class="hand-badge">Double</span>`);
      if (hand.bust) badges.push(`<span class="hand-badge">Bust</span>`);
      if (hand.blackjack) badges.push(`<span class="hand-badge">21</span>`);

      wrap.innerHTML = `
        <div class="hand-header">
          <span class="hand-label">Kéz ${index + 1}</span>
          <span class="hand-meta">Tét: <strong>${hand.bet} Ft</strong></span>
          <span class="hand-meta">Pont: <strong>${hand.score ?? "-"}</strong></span>
          ${badges.join(" ")}
        </div>
        <div class="cards"></div>
      `;
      const cardsEl = wrap.querySelector(".cards");
      const prev = prevHands[index]?.cards ?? [];
      const doubledIndex =
        hand.doubled && hand.cards.length > 0 ? hand.cards.length - 1 : undefined;
      appendCards(cardsEl, hand.cards, prev, { doubledIndex });
      container.appendChild(wrap);
    });
    prevHands = hands.map((h) => ({ cards: [...h.cards] }));
  }

  return {
    setCards(cards, score, opts = {}) {
      renderSingle(cards, score, opts);
    },
    setHands(hands, activeIndex) {
      renderMulti(hands, activeIndex);
    },
    reset() {
      container.className = "";
      container.innerHTML = "";
      prevHands = [];
    },
  };
}
