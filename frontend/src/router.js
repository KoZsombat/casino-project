import { setupHome } from './pages/Home.js';
import { setupBlackjack } from './pages/Blackjack.js';
import { setupRoulette } from './pages/Roulette.js';
import { setupSlotMachine } from './pages/Slotmachine.js';

const routes = {
  '/': setupHome,
  '/blackjack': setupBlackjack,
  '/roulette': setupRoulette,
  '/slot': setupSlotMachine,
};

export function createRouter(element) {
  function navigate(path) {
    window.location.hash = '#' + path;
  }

  function getPath() {
    const hash = window.location.hash;
    if (!hash || hash === '#' || hash === '#/') return '/';
    return hash.slice(1);
  }

  function render() {
    const path = getPath();
    const setup = routes[path];
    if (setup) {
      setup(element, { navigate, onBack: () => navigate('/') });
    } else {
      navigate('/');
    }
  }

  window.addEventListener('hashchange', render);
  render();
}
