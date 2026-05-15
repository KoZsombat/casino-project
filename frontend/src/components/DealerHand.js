export function setupDealerHand(element) {
  element.innerHTML = `
    <div class="hand dealer-hand">
      <h2>Dealer <span id="dealer-score">-</span></h2>
      <div id="dealer-cards" class="cards"></div>
    </div>
  `;

  const dealerScoreEl = element.querySelector("#dealer-score");
  const dealerCardsEl = element.querySelector("#dealer-cards");

  function createCardElement(card) {
    const cardEl = document.createElement("div");
    cardEl.className = "card";

    if (card === "?") {
      cardEl.classList.add("card-hidden");
      cardEl.textContent = "?";
    } else {
      const suit = card.slice(-1);
      const value = card.slice(0, -1);

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
    dealerScoreEl.textContent = score !== null ? score : "-";

    dealerCardsEl.innerHTML = "";
    cards.forEach((card) => {
      const cardEl = createCardElement(card);
      dealerCardsEl.appendChild(cardEl);
    });
  }

  return {
    setCards(cards, score) {
      render(cards, score);
    },
    reset() {
      dealerCardsEl.innerHTML = "";
      dealerScoreEl.textContent = "-";
    },
  };
}
