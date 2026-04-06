document.addEventListener('DOMContentLoaded', () => {
  renderTrips();
});

function renderTrips() {
  const tripsGrid = document.getElementById('tripsGrid');
  if (!tripsGrid) return;

  const trips = getTrips();

  if (!trips.length) {
    tripsGrid.innerHTML = `
      <div class="empty-state">
        <h3>Ainda não tens viagens criadas</h3>
        <p>Clica em “Criar nova viagem” para começares a planear.</p>
      </div>
    `;
    return;
  }

  tripsGrid.innerHTML = trips.map((trip) => `
    <div class="trip-item">
      <article class="trip-card">
        <h3>${trip.destination}</h3>
        <p><strong>Datas:</strong> ${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</p>
        <p><strong>Orçamento:</strong> €${trip.budget}</p>
        <p><strong>Gasto:</strong> €${trip.spent || 0}</p>
      </article>
      <div class="trip-card-button">
        <a 
          href="trip.html?id=${trip.id}" 
          class="button button--secondary open-trip-link"
          data-trip-id="${trip.id}"
        >
          Ver viagem
        </a>
      </div>
    </div>
  `).join('');

  bindTripLinks();
}

function bindTripLinks() {
  const links = document.querySelectorAll('.open-trip-link');

  links.forEach((link) => {
    link.addEventListener('click', () => {
      const tripId = link.dataset.tripId;
      sessionStorage.setItem('selectedTripId', tripId);
    });
  });
}