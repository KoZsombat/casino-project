export function setupActionButtons(element, options) {
  element.innerHTML = `
    <div class="action-buttons">
      <button id="hit-btn">Hit</button>
      <button id="stand-btn">Stand</button>
    </div>
  `;

  const hitBtn = element.querySelector("#hit-btn");
  const standBtn = element.querySelector("#stand-btn");

  hitBtn.addEventListener("click", () => {
    if (options.onHit) options.onHit();
  });

  standBtn.addEventListener("click", () => {
    if (options.onStand) options.onStand();
  });

  element.style.display = "none";

  return {
    show() {
      element.style.display = "block";
      hitBtn.disabled = false;
      standBtn.disabled = false;
    },
    hide() {
      element.style.display = "none";
    },
    setDisabled(value) {
      hitBtn.disabled = value;
      standBtn.disabled = value;
    },
  };
}
