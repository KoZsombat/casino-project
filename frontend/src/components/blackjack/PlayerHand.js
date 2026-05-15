export function setupPlayerHand(element) {
  element.innerHTML = `
    <div class="hand player-hand">
      <h2>Játékos <span id="player-score">-</span></h2>
      <div id="player-cards" class="cards"></div>
    </div>
  `;

  const playerScoreEl = element.querySelector("#player-score");
  const playerCardsEl = element.querySelector("#player-cards");

  function createCardElement(card) {
    const cardEl = document.createElement("div");
    cardEl.className = "card";

    const suit = card.slice(-1);
    if (suit === "♥" || suit === "♦") {
      cardEl.classList.add("card-red");
    } else {
      cardEl.classList.add("card-black");
    }

    cardEl.textContent = card;
    return cardEl;
  }

  function render(cards, score) {
    playerScoreEl.textContent = score !== null ? score : "-";

    playerCardsEl.innerHTML = "";
    cards.forEach((card) => {
      const cardEl = createCardElement(card);
      playerCardsEl.appendChild(cardEl);
    });
  }

  return {
    setCards(cards, score) {
      render(cards, score);
    },
    reset() {
      playerCardsEl.innerHTML = "";
      playerScoreEl.textContent = "-";
    },
  };
}
