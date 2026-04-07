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
  renderActivities(tripId);
  renderBudget(tripId);
  renderItinerary(tripId);
  bindActionButtons(tripId);
});

function setupLinks(tripId) {
  const links = document.querySelectorAll('a[href]');

  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    if (href === 'trip.html' || href === 'trip') {
      link.href = `trip.html?id=${tripId}`;
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
  const tableBody = document.getElementById('itineraryTableBody');

  if (!trip || !tableBody) return;

  if (!trip.activities || !trip.activities.length) {
    tableBody.innerHTML = `
      <tr>
        <td>Sem atividades ainda</td>
        <td>-</td>
        <td>-</td>
      </tr>
    `;
    return;
  }

  const rows = [];
  const activities = [...trip.activities];

  while (activities.length) {
    const rowActivities = activities.splice(0, 3);

    rows.push(`
      <tr>
        <td>${rowActivities[0] ? `${rowActivities[0].name} (€${Number(rowActivities[0].cost) || 0})` : '-'}</td>
        <td>${rowActivities[1] ? `${rowActivities[1].name} (€${Number(rowActivities[1].cost) || 0})` : '-'}</td>
        <td>${rowActivities[2] ? `${rowActivities[2].name} (€${Number(rowActivities[2].cost) || 0})` : '-'}</td>
      </tr>
    `);
  }

  tableBody.innerHTML = rows.join('');
}

function bindActionButtons(tripId) {
  const addActivityButton = document.getElementById('addActivityButton');

  if (addActivityButton) {
    addActivityButton.addEventListener('click', () => {
      window.location.href = `add-activity.html?id=${tripId}`;
    });
  }
}