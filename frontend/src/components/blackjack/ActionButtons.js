export function setupActionButtons(element, options) {
  element.innerHTML = `
    <div class="action-buttons">
      <button id="hit-btn">Hit</button>
      <button id="stand-btn">Stand</button>
      <button id="double-btn">Double</button>
      <button id="split-btn">Split</button>
    </div>
  `;

  const hitBtn = element.querySelector("#hit-btn");
  const standBtn = element.querySelector("#stand-btn");
  const doubleBtn = element.querySelector("#double-btn");
  const splitBtn = element.querySelector("#split-btn");

  hitBtn.addEventListener("click", () => {
    if (options.onHit) options.onHit();
  });

  standBtn.addEventListener("click", () => {
    if (options.onStand) options.onStand();
  });

  doubleBtn.addEventListener("click", () => {
    if (options.onDouble) options.onDouble();
  });

  splitBtn.addEventListener("click", () => {
    if (options.onSplit) options.onSplit();
  });

  element.style.display = "none";

  return {
    show(state) {
      element.style.display = "block";
      const canHit = state?.canHit !== false;
      const canStand = state?.canStand !== false;
      const canDouble = state?.canDouble === true;
      const canSplit = state?.canSplit === true;

      hitBtn.disabled = !canHit;
      standBtn.disabled = !canStand;
      doubleBtn.disabled = !canDouble;
      splitBtn.disabled = !canSplit;

      doubleBtn.style.display = canDouble || state?.showDouble ? "" : "none";
      splitBtn.style.display = canSplit || state?.showSplit ? "" : "none";
    },
    hide() {
      element.style.display = "none";
    },
    setDisabled(value) {
      hitBtn.disabled = value;
      standBtn.disabled = value;
      doubleBtn.disabled = value;
      splitBtn.disabled = value;
    },
    update(state) {
      hitBtn.disabled = state.canHit === false;
      standBtn.disabled = state.canStand === false;
      doubleBtn.disabled = state.canDouble !== true;
      splitBtn.disabled = state.canSplit !== true;

      doubleBtn.style.display =
        state.canDouble || state.showDouble ? "" : "none";
      splitBtn.style.display = state.canSplit || state.showSplit ? "" : "none";
    },
  };
}
