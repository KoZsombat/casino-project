export function setupDealerHand(element) {
  element.innerHTML = `
    <div class="hand dealer-hand">
      <div class="hand-header">
        <span class="hand-label">Dealer</span>
        <span class="hand-meta">Pont: <strong id="dealer-score">-</strong></span>
      </div>
      <div id="dealer-cards" class="cards"></div>
    </div>
  `;

  const dealerScoreEl = element.querySelector("#dealer-score");
  const dealerCardsEl = element.querySelector("#dealer-cards");

  let prevCards = [];

  function createCardElement(card) {
    const cardEl = document.createElement("div");
    cardEl.className = "card";

    if (card === "?") {
      cardEl.classList.add("card-hidden");
      cardEl.textContent = "?";
    } else {
      const suit = card.slice(-1);
      if (suit === "♥" || suit === "♦") {
        cardEl.classList.add("card-red");
      } else {
        cardEl.classList.add("card-black");
      }
      cardEl.textContent = card;
    }
    return cardEl;
  }

  function render(cards, score) {
    dealerScoreEl.textContent = score !== null && score !== undefined ? score : "-";

    dealerCardsEl.innerHTML = "";
    cards.forEach((card, idx) => {
      const cardEl = createCardElement(card);
      if (prevCards[idx] !== card) {
        cardEl.classList.add("card-new");
      }
      dealerCardsEl.appendChild(cardEl);
    });
    prevCards = [...cards];
  }

  return {
    setCards(cards, score) {
      render(cards, score);
    },
    reset() {
      dealerCardsEl.innerHTML = "";
      dealerScoreEl.textContent = "-";
      prevCards = [];
    },
  };
}
