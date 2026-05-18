export function setupDeck(element, options = {}) {
  element.innerHTML = `
    <div class="deck-shoe">
      <div class="deck-shoe-stack">
        <div class="deck-shoe-card"></div>
        <div class="deck-shoe-card"></div>
        <div class="deck-shoe-card"></div>
        <div class="deck-shoe-card"></div>
        <div class="deck-shoe-card"></div>
      </div>
      <div class="deck-shoe-counter">
        <span class="deck-shoe-count">${options.initialCount ?? 0}</span> /
        <span class="deck-shoe-total">${options.totalCount ?? 104}</span>
      </div>
    </div>
  `;

  const countEl = element.querySelector(".deck-shoe-count");
  const stack = element.querySelector(".deck-shoe-stack");
  const cardEls = Array.from(element.querySelectorAll(".deck-shoe-card"));
  const total = options.totalCount ?? 104;

  function update(remaining) {
    countEl.textContent = remaining;
    const ratio = Math.max(0, Math.min(1, remaining / total));
    // Show more visible cards on the stack when the shoe is full.
    cardEls.forEach((cardEl, idx) => {
      const threshold = idx / cardEls.length;
      cardEl.style.display = ratio > threshold ? "" : "none";
    });
    stack.classList.toggle("deck-shoe-empty", remaining === 0);
  }

  update(options.initialCount ?? total);

  return { update };
}
