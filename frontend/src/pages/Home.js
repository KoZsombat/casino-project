import './Home.css';

export function setupHome(element) {
  element.innerHTML = `
    <div class="home-page">
      <header class="lobby-header">
        <h1 class="casino-name">Casino</h1>
        <p class="casino-tagline">Válassz játékot</p>
      </header>
      <div class="game-grid">
        <div class="game-card" data-route="/blackjack">
          <div class="game-card-suit">♠</div>
          <h2>Blackjack</h2>
          <p>21-re törekedj, verd meg az osztót!</p>
          <button class="play-btn">Játék indítása</button>
        </div>
        <div class="game-card" data-route="/roulette">
          <div class="game-card-suit">◉</div>
          <h2>Rulett</h2>
          <p>Forgasd meg a kereket és nyerj!</p>
          <button class="play-btn">Játék indítása</button>
        </div>
      </div>
    </div>
  `;

  element.querySelectorAll('.game-card').forEach((card) => {
    const route = card.dataset.route;
    card.addEventListener('click', () => {
      window.location.hash = '#' + route;
    });
  });
}
