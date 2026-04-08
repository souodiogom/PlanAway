document.addEventListener('DOMContentLoaded', () => {
  const tripId = getTripIdFromURL();
  console.log('Trip ID resolvido:', tripId);

  if (!tripId) {
    alert('Nenhuma viagem selecionada.');
    window.location.href = 'index.html';
    return;
  }

  setupLinks(tripId);
  renderTripSummary(tripId);
  renderHotels(tripId);
  renderHotelsPage(tripId);
  renderTransports(tripId);
  renderTransportsPage(tripId);
  renderActivities(tripId);
  renderBudget(tripId);
  renderItinerary(tripId);
  bindActionButtons(tripId);
  bindTripMainActions(tripId);
});

function setupLinks(tripId) {
  const links = document.querySelectorAll('a[href]');

  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    if (href === 'trip.html' || href === 'trip') {
      link.href = `trip.html?id=${tripId}`;
    }

    if (href === 'hotels.html' || href === 'hotels') {
      link.href = `hotels.html?id=${tripId}`;
    }

    if (href === 'add-hotel.html' || href === 'add-hotel') {
      link.href = `add-hotel.html?id=${tripId}`;
    }

    if (href === 'transports.html' || href === 'transports') {
      link.href = `transports.html?id=${tripId}`;
    }

    if (href === 'add-transport.html' || href === 'add-transport') {
      link.href = `add-transport.html?id=${tripId}`;
    }

    if (href === 'activities.html' || href === 'activities') {
      link.href = `activities.html?id=${tripId}`;
    }

    if (href === 'add-activity.html' || href === 'add-activity') {
      link.href = `add-activity.html?id=${tripId}`;
    }

    if (href === 'budget.html' || href === 'budget') {
      link.href = `budget.html?id=${tripId}`;
    }

    if (href === 'itinerary.html' || href === 'itinerary') {
      link.href = `itinerary.html?id=${tripId}`;
    }

    if (href === 'expenses.html' || href === 'expenses') {
      link.href = `expenses.html?id=${tripId}`;
    }

    if (href === 'index.html' || href === 'index') {
      link.href = 'index.html';
    }
  });
}

function renderTripSummary(tripId) {
  const trip = getTripById(tripId);
  const summaryTargets = ['tripSummary', 'itineraryTripBox'];

  if (!trip) return;

  const budget = Number(trip.budget) || 0;
  const spent = Number(trip.spent) || 0;
  const remaining = budget - spent;

  summaryTargets.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.innerHTML = `
      <strong>${trip.destination || 'Destino sem nome'}</strong><br>
      ${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}<br>
      Budget: €${budget}<br>
      Gasto: €${spent}<br>
      Restante: €${remaining}
    `;
  });
}

function renderHotels(tripId) {
  const trip = getTripById(tripId);
  const hotelList = document.getElementById('hotelList');

  if (!trip || !hotelList) return;

  if (!trip.hotels || !trip.hotels.length) {
    hotelList.innerHTML = `<li>Sem alojamento registado</li>`;
    return;
  }

  hotelList.innerHTML = trip.hotels
    .slice()
    .sort((a, b) => new Date(a.date || '9999-12-31') - new Date(b.date || '9999-12-31'))
    .map((hotel) => `
      <li>
        <strong>${hotel.name || 'Alojamento sem nome'}</strong>
        ${hotel.date ? ` — ${formatDate(hotel.date)}` : ''}
        ${hotel.nights ? ` — ${hotel.nights} noite${Number(hotel.nights) > 1 ? 's' : ''}` : ''}
      </li>
    `)
    .join('');
}

function renderHotelsPage(tripId) {
  const trip = getTripById(tripId);
  const list = document.getElementById('hotelsList');

  if (!trip || !list) return;

  if (!trip.hotels || !trip.hotels.length) {
    list.innerHTML = `<div class="trip-empty-state">Ainda não existem alojamentos nesta viagem.</div>`;
    return;
  }

  const groupedHotels = {};

  trip.hotels.forEach((hotel, index) => {
    const dateKey = hotel.date || 'sem-data';

    if (!groupedHotels[dateKey]) {
      groupedHotels[dateKey] = [];
    }

    groupedHotels[dateKey].push({
      ...hotel,
      index
    });
  });

  const sortedDates = Object.keys(groupedHotels).sort((a, b) => {
    if (a === 'sem-data') return 1;
    if (b === 'sem-data') return -1;
    return new Date(a) - new Date(b);
  });

  list.innerHTML = sortedDates.map((dateKey, dayIndex) => {
    const hotels = groupedHotels[dateKey];
    const dayLabel = dateKey === 'sem-data'
      ? 'Sem data definida'
      : `DIA ${dayIndex + 1} · ${formatDate(dateKey)}`;

    return `
      <section class="activity-day-group">
        <div class="activity-day-group__header">
          <h3 class="activity-day-group__title">${dayLabel}</h3>
          <span class="activity-day-group__count">${hotels.length} alojamento${hotels.length > 1 ? 's' : ''}</span>
        </div>

        <div class="activity-day-group__list">
          ${hotels.map((hotel) => `
            <article class="activity-list-item">
              <div class="activity-list-item__main">
                <div class="activity-list-item__top">
                  <span class="activity-list-item__badge">Hotel</span>
                  <h4 class="activity-list-item__title">${hotel.name || 'Alojamento sem nome'}</h4>
                </div>

                <div class="activity-list-item__details">
                  <p><strong>Noites:</strong> ${hotel.nights || 0}</p>
                  <p><strong>Valor:</strong> €${Number(hotel.price) || 0}</p>
                </div>
              </div>

              <div class="activity-list-item__actions">
                <button
                  type="button"
                  class="button button--secondary"
                  onclick="editHotel('${tripId}', ${hotel.index})"
                >
                  Editar
                </button>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }).join('');
}

function editHotel(tripId, index) {
  window.location.href = `add-hotel.html?id=${tripId}&edit=${index}`;
}

function renderTransports(tripId) {
  const trip = getTripById(tripId);
  const transportList = document.getElementById('transportList');

  if (!trip || !transportList) return;

  if (!trip.transports || !trip.transports.length) {
    transportList.innerHTML = `<li>Sem transporte registado</li>`;
    return;
  }

  transportList.innerHTML = trip.transports
    .slice()
    .sort((a, b) => new Date(a.date || '9999-12-31') - new Date(b.date || '9999-12-31'))
    .map((transport) => `
      <li>
        <strong>${transport.type || 'Transporte'}</strong>
        ${transport.date ? ` — ${formatDate(transport.date)}` : ''}
        ${transport.period ? ` — ${transport.period}` : ''}
      </li>
    `)
    .join('');
}

function renderTransportsPage(tripId) {
  const trip = getTripById(tripId);
  const list = document.getElementById('transportsList');

  if (!trip || !list) return;

  if (!trip.transports || !trip.transports.length) {
    list.innerHTML = `<div class="trip-empty-state">Ainda não existem transportes nesta viagem.</div>`;
    return;
  }

  const groupedTransports = {};

  trip.transports.forEach((transport, index) => {
    const dateKey = transport.date || 'sem-data';

    if (!groupedTransports[dateKey]) {
      groupedTransports[dateKey] = [];
    }

    groupedTransports[dateKey].push({
      ...transport,
      index
    });
  });

  const periodOrder = {
    manhã: 1,
    tarde: 2,
    noite: 3
  };

  const sortedDates = Object.keys(groupedTransports).sort((a, b) => {
    if (a === 'sem-data') return 1;
    if (b === 'sem-data') return -1;
    return new Date(a) - new Date(b);
  });

  list.innerHTML = sortedDates.map((dateKey, dayIndex) => {
    const transports = groupedTransports[dateKey]
      .slice()
      .sort((a, b) => {
        const periodA = (a.period || '').trim().toLowerCase();
        const periodB = (b.period || '').trim().toLowerCase();

        const orderA = periodOrder[periodA] || 99;
        const orderB = periodOrder[periodB] || 99;

        if (orderA !== orderB) return orderA - orderB;

        return (a.type || '').localeCompare(b.type || '', 'pt');
      });

    const dayLabel = dateKey === 'sem-data'
      ? 'Sem data definida'
      : `DIA ${dayIndex + 1} · ${formatDate(dateKey)}`;

    return `
      <section class="activity-day-group">
        <div class="activity-day-group__header">
          <h3 class="activity-day-group__title">${dayLabel}</h3>
          <span class="activity-day-group__count">${transports.length} transporte${transports.length > 1 ? 's' : ''}</span>
        </div>

        <div class="activity-day-group__list">
          ${transports.map((transport) => `
            <article class="activity-list-item">
              <div class="activity-list-item__main">
                <div class="activity-list-item__top">
                  <span class="activity-list-item__badge">${transport.type || 'Transporte'}</span>
                  <h4 class="activity-list-item__title">${transport.type || 'Transporte sem tipo'}</h4>
                </div>

                <div class="activity-list-item__details">
                  <p><strong>Período:</strong> ${transport.period || '-'}</p>
                  <p><strong>Valor:</strong> €${Number(transport.price) || 0}</p>
                </div>
              </div>

              <div class="activity-list-item__actions">
                <button
                  type="button"
                  class="button button--secondary"
                  onclick="editTransport('${tripId}', ${transport.index})"
                >
                  Editar
                </button>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }).join('');
}

function editTransport(tripId, index) {
  window.location.href = `add-transport.html?id=${tripId}&edit=${index}`;
}

function renderActivities(tripId) {
  const trip = getTripById(tripId);
  const list = document.getElementById('activitiesList');

  if (!trip || !list) return;

  if (!trip.activities || !trip.activities.length) {
    list.innerHTML = `<div class="trip-empty-state">Ainda não existem atividades nesta viagem.</div>`;
    return;
  }

  const groupedActivities = {};

  trip.activities.forEach((activity, index) => {
    const dateKey = activity.date || 'sem-data';

    if (!groupedActivities[dateKey]) {
      groupedActivities[dateKey] = [];
    }

    groupedActivities[dateKey].push({
      ...activity,
      index
    });
  });

  const periodOrder = {
    manhã: 1,
    tarde: 2,
    noite: 3
  };

  const sortedDates = Object.keys(groupedActivities).sort((a, b) => {
    if (a === 'sem-data') return 1;
    if (b === 'sem-data') return -1;
    return new Date(a) - new Date(b);
  });

  list.innerHTML = sortedDates.map((dateKey, dayIndex) => {
    const activities = groupedActivities[dateKey]
      .slice()
      .sort((a, b) => {
        const periodA = (a.period || '').trim().toLowerCase();
        const periodB = (b.period || '').trim().toLowerCase();

        const orderA = periodOrder[periodA] || 99;
        const orderB = periodOrder[periodB] || 99;

        if (orderA !== orderB) return orderA - orderB;

        return (a.name || '').localeCompare(b.name || '', 'pt');
      });

    const dayLabel = dateKey === 'sem-data'
      ? 'Sem data definida'
      : `DIA ${dayIndex + 1} · ${formatDate(dateKey)}`;

    return `
      <section class="activity-day-group">
        <div class="activity-day-group__header">
          <h3 class="activity-day-group__title">${dayLabel}</h3>
          <span class="activity-day-group__count">${activities.length} atividade${activities.length > 1 ? 's' : ''}</span>
        </div>

        <div class="activity-day-group__list">
          ${activities.map((activity) => `
            <article class="activity-list-item">
              <div class="activity-list-item__main">
                <div class="activity-list-item__top">
                  <span class="activity-list-item__badge">${activity.type || 'Atividade'}</span>
                  <h4 class="activity-list-item__title">${activity.name || 'Sem nome'}</h4>
                </div>

                <div class="activity-list-item__details">
                  <p><strong>Período:</strong> ${activity.period || '-'}</p>
                  <p><strong>Custo:</strong> €${Number(activity.cost) || 0}</p>
                </div>
              </div>

              <div class="activity-list-item__actions">
                <button
                  type="button"
                  class="button button--secondary"
                  onclick="editActivity('${tripId}', ${activity.index})"
                >
                  Editar
                </button>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }).join('');
}

function editActivity(tripId, index) {
  window.location.href = `add-activity.html?id=${tripId}&edit=${index}`;
}

function renderBudget(tripId) {
  const trip = getTripById(tripId);
  const budgetList = document.getElementById('budgetList');
  const budgetSummary = document.getElementById('budgetSummary');

  if (!trip || !budgetList || !budgetSummary) return;

  const budget = Number(trip.budget) || 0;
  const spent = Number(trip.spent) || 0;
  const remaining = budget - spent;
  const activitiesCount = trip.activities?.length || 0;

  budgetList.innerHTML = `
    <div class="trip-budget-row">
      <span>Budget inicial</span>
      <strong>€${budget}</strong>
    </div>
    <div class="trip-budget-row">
      <span>Total gasto</span>
      <strong>€${spent}</strong>
    </div>
    <div class="trip-budget-row">
      <span>N.º atividades</span>
      <strong>${activitiesCount}</strong>
    </div>
  `;

  budgetSummary.innerHTML = `
    <p>Total restante</p>
    <strong style="font-size: 28px;">€${remaining}</strong>
  `;
}

function renderItinerary(tripId) {
  const trip = getTripById(tripId);
  const grid = document.getElementById('itineraryGrid');
  const transportBox = document.getElementById('itineraryTransportBox');
  const hotelBox = document.getElementById('itineraryHotelBox');

  if (!trip || !grid) return;

  if (transportBox) {
    transportBox.style.display = 'none';
  }

  if (hotelBox) {
    hotelBox.style.display = 'none';
  }

  const days = getTripDateRange(trip.startDate, trip.endDate);
  const periods = ['alojamento', 'manhã', 'tarde', 'noite'];

  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `140px repeat(${days.length}, 200px)`;

  grid.appendChild(createItineraryGridCell('', 'it-cell'));

  days.forEach((date, index) => {
    grid.appendChild(
      createItineraryGridCell(
        `DIA ${index + 1}<span>${formatDate(date)}</span>`,
        'it-cell it-cell--day'
      )
    );
  });

  periods.forEach((period) => {
    grid.appendChild(
      createItineraryGridCell(
        period === 'alojamento' ? 'ALOJAMENTO' : period.toUpperCase(),
        'it-cell it-cell--period'
      )
    );

    days.forEach((date) => {
      const cell = document.createElement('div');
      cell.className = 'it-cell it-cell--content';

      let entries = [];

      if (period === 'alojamento') {
        const hotelsForDay = (trip.hotels || []).filter((hotel) =>
          isHotelActiveOnDate(hotel, date)
        );

        entries = hotelsForDay.map((hotel) => `
          <div class="it-entry it-entry--hotel">
            🏨 ${hotel.name || 'Alojamento sem nome'}
          </div>
        `);
      } else {
        const dayActivities = (trip.activities || [])
          .filter((activity) => {
            return (
              activity.date === date &&
              (activity.period || '').trim().toLowerCase() === period
            );
          })
          .map((activity) => `
            <div class="it-entry">
              ${activity.name || 'Sem nome'} (€${Number(activity.cost) || 0})
            </div>
          `);

        const dayTransports = (trip.transports || [])
          .filter((transport) => {
            return (
              transport.date === date &&
              (transport.period || '').trim().toLowerCase() === period
            );
          })
          .map((transport) => `
            <div class="it-entry it-entry--transport">
              🚕 ${transport.type || 'Transporte'}
            </div>
          `);

        entries = [...dayTransports, ...dayActivities];
      }

      if (!entries.length) {
        cell.innerHTML = `<span class="it-empty">-</span>`;
      } else {
        cell.innerHTML = entries.join('');
      }

      grid.appendChild(cell);
    });
  });
}

function isHotelActiveOnDate(hotel, date) {
  if (!hotel || !hotel.date) return false;

  const start = new Date(hotel.date);
  start.setHours(0, 0, 0, 0);

  const nights = Math.max(Number(hotel.nights) || 1, 1);

  const end = new Date(start);
  end.setDate(end.getDate() + nights - 1);
  end.setHours(0, 0, 0, 0);

  const current = new Date(date);
  current.setHours(0, 0, 0, 0);

  return current >= start && current <= end;
}

function getTripDateRange(startDate, endDate) {
  if (!startDate || !endDate) return [];

  const result = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  current.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    result.push(formatDateISO(current));
    current.setDate(current.getDate() + 1);
  }

  return result;
}

function formatDateISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function createItineraryGridCell(content, className) {
  const div = document.createElement('div');
  div.className = className;
  div.innerHTML = content;
  return div;
}

function bindActionButtons(tripId) {
  const addActivityButton = document.getElementById('addActivityButton');

  if (addActivityButton) {
    addActivityButton.addEventListener('click', () => {
      window.location.href = `add-activity.html?id=${tripId}`;
    });
  }
}

function bindTripMainActions(tripId) {
  const editTripButton = document.getElementById('editTripButton');
  const deleteTripButton = document.getElementById('deleteTripButton');

  if (editTripButton) {
    editTripButton.addEventListener('click', () => {
      window.location.href = `create-trip.html?id=${tripId}&edit=true`;
    });
  }

  if (deleteTripButton) {
    deleteTripButton.addEventListener('click', () => {
      const confirmed = confirm('Tens a certeza que queres eliminar esta viagem?');
      if (!confirmed) return;

      deleteTrip(tripId);
      alert('Viagem eliminada com sucesso.');
      window.location.href = 'index.html';
    });
  }
}