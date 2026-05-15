export function setupSpinButton(element, options) {
  // options = { onSpin: function }
  // - onSpin: callback, amit kattintásra hívunk

  element.innerHTML = `
    <button id="spin-btn" class="spin-btn" disabled>Pörgetés</button>
  `

  const spinBtn = element.querySelector('#spin-btn')

  spinBtn.addEventListener('click', () => {
    if (options.onSpin) {
      options.onSpin()
    }
  })

  return {
    setEnabled(enabled) {
      spinBtn.disabled = !enabled
    }
  }
}