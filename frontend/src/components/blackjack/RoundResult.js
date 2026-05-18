export function setupRoundResult(element, options) {
  element.innerHTML = `
    <div class="round-result">
      <h2 id="result-text"></h2>
      <div id="result-details"></div>
      <p id="payout-text"></p>
      <button id="new-round-btn">Új kör</button>
    </div>
  `;

  const resultTextEl = element.querySelector("#result-text");
  const resultDetailsEl = element.querySelector("#result-details");
  const payoutTextEl = element.querySelector("#payout-text");
  const newRoundBtn = element.querySelector("#new-round-btn");

  newRoundBtn.addEventListener("click", () => {
    if (options.onNewRound) options.onNewRound();
  });

  element.style.display = "none";

  function labelFor(result) {
    switch (result) {
      case "player_wins":
        return { text: "Nyertél!", color: "#4ade80" };
      case "dealer_wins":
        return { text: "A dealer nyert", color: "#ef4444" };
      case "tie":
        return { text: "Döntetlen", color: "#facc15" };
      default:
        return { text: "", color: "#fff" };
    }
  }

  return {
    show(data) {
      resultDetailsEl.innerHTML = "";

      if (Array.isArray(data.hands) && data.hands.length > 1) {
        const wins = data.hands.filter((h) => h.result === "player_wins").length;
        const losses = data.hands.filter(
          (h) => h.result === "dealer_wins",
        ).length;

        let summary;
        let color;
        if (wins > losses) {
          summary = "Összességében nyertél!";
          color = "#4ade80";
        } else if (losses > wins) {
          summary = "Összességében veszítettél";
          color = "#ef4444";
        } else {
          summary = "Vegyes eredmény";
          color = "#facc15";
        }

        resultTextEl.textContent = summary;
        resultTextEl.style.color = color;

        data.hands.forEach((hand, index) => {
          const info = labelFor(hand.result);
          const row = document.createElement("div");
          row.className = "hand-result";
          row.innerHTML = `<strong>Kéz ${index + 1}:</strong>
            <span style="color:${info.color}">${info.text}</span>
            — Tét: ${hand.bet} Ft, Kifizetés: ${hand.payout} Ft`;
          resultDetailsEl.appendChild(row);
        });
      } else {
        const info = labelFor(data.result);
        resultTextEl.textContent = info.text;
        resultTextEl.style.color = info.color;
      }

      const totalPayout =
        data.totalPayout !== undefined ? data.totalPayout : data.payout || 0;
      payoutTextEl.textContent =
        totalPayout > 0 ? `Összes kifizetés: ${totalPayout} Ft` : "";

      element.style.display = "block";
    },
    hide() {
      element.style.display = "none";
    },
  };
}
