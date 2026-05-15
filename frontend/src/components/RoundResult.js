export function setupRoundResult(element, options) {
    
  element.innerHTML = `
    <div class="round-result">
      <h2 id="result-text"></h2>
      <p id="payout-text"></p>
      <button id="new-round-btn">Új kör</button>
    </div>
  `

  const resultTextEl = element.querySelector('#result-text')
  const payoutTextEl = element.querySelector('#payout-text')
  const newRoundBtn = element.querySelector('#new-round-btn')

  newRoundBtn.addEventListener('click', () => {
    if (options.onNewRound) options.onNewRound()
  })

  element.style.display = 'none'

  return {
    show(data) {
      switch (data.result) {
        case 'player_wins':
          resultTextEl.textContent = '🎉 Nyertél!'
          resultTextEl.style.color = '#4ade80'
          break
        case 'dealer_wins':
          resultTextEl.textContent = '😢 A dealer nyert'
          resultTextEl.style.color = '#dc2626'
          break
        case 'tie':
          resultTextEl.textContent = '🤝 Döntetlen'
          resultTextEl.style.color = '#facc15'
          break
      }
      payoutTextEl.textContent = data.payout > 0 ? `Kifizetés: ${data.payout} Ft` : ''
      element.style.display = 'block'
    },
    hide() {
      element.style.display = 'none'
    }
  }
}