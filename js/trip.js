document.addEventListener('DOMContentLoaded', () => {
  const tripId = getTripIdFromURL();
  console.log('Trip ID resolvido:', tripId);

  if (!tripId) {
    alert('Nenhuma viagem selecionada.');
    window.location.href = 'index';
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
      link.href = `trip?id=${tripId}`;
    }

    if (href === 'activities.html' || href === 'activities') {
      link.href = `activities?id=${tripId}`;
    }

    if (href === 'add-activity.html' || href === 'add-activity') {
      link.href = `add-activity?id=${tripId}`;
    }

    if (href === 'budget.html' || href === 'budget') {
      link.href = `budget?id=${tripId}`;
    }

    if (href === 'itinerary.html' || href === 'itinerary') {
      link.href = `itinerary?id=${tripId}`;
    }

    if (href === 'index.html' || href === 'index') {
      link.href = 'index';
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
    list.innerHTML = 'Ainda não existem atividades nesta viagem.';
    return;
  }

  list.innerHTML = trip.activities.map((activity, index) => `
    <article class="trip-record">
      <div class="trip-record__badge">${activity.type || 'Atividade'}</div>
      <div class="trip-record__title">${activity.name || 'Sem nome'}</div>
      <div class="trip-record__meta">Período: ${activity.period || '-'}</div>
      <div class="trip-record__meta">Data: ${activity.date ? formatDate(activity.date) : '-'}</div>
      <div class="trip-record__meta">Custo: €${Number(activity.cost) || 0}</div>

      <div class="trip-record__actions">
        <button
          type="button"
          class="button button--secondary"
          onclick="editActivity('${tripId}', ${index})"
        >
          Editar
        </button>
      </div>
    </article>
  `).join('');
}

function editActivity(tripId, index) {
  window.location.href = `add-activity?id=${tripId}&edit=${index}`;
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
    <div class="trip-budget-row"><span>Budget inicial</span><strong>€${budget}</strong></div>
    <div class="trip-budget-row"><span>Total gasto</span><strong>€${spent}</strong></div>
    <div class="trip-budget-row"><span>N.º atividades</span><strong>${activitiesCount}</strong></div>
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
      window.location.href = `add-activity?id=${tripId}`;
    });
  }
}