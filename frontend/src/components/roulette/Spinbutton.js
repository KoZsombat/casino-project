export function setupSpinButton(element, options) {
  element.innerHTML = `
    <button id="spin-btn" class="spin-btn" disabled>Spin</button>
  `;

  const spinBtn = element.querySelector("#spin-btn");

  spinBtn.addEventListener("click", () => {
    if (options.onSpin) {
      options.onSpin();
    }
  });

  return {
    setEnabled(enabled) {
      spinBtn.disabled = !enabled;
    },
  };
}
