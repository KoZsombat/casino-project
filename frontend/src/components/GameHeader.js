export function setupGameHeader(element, options) {
  element.innerHTML = `
    <div class="game-header">
      <button id="back-btn" class="back-btn">← Vissza</button>
      <div class="balance-display">
        Egyenleg: <span id="balance">${options.initialBalance}</span> Ft
      </div>
    </div>
  `

  const balanceEl = element.querySelector('#balance')
  const backBtn = element.querySelector('#back-btn')

  backBtn.addEventListener('click', () => {
    if (options.onBack) {
      options.onBack()
    }
  })

  return {
    setBalance(newBalance) {
      balanceEl.textContent = newBalance
    }
  }
}