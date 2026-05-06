document.addEventListener('DOMContentLoaded', () => {
  const tripId = getTripIdFromURL();
  const editIndex = getEditIndexFromURL();

  if (!tripId) {
    window.location.href = 'index.html';
    return;
  }

  const cancelLink = document.getElementById('cancelActivityLink');
  const formTitle = document.getElementById('formTitle');
  const activityForm = document.getElementById('activityForm');
  const successMessage = document.getElementById('successMessage');
  const costInput = document.getElementById('activityCost');
  const deleteButton = document.getElementById('deleteActivityButton');

  const isEditMode = editIndex !== null && !Number.isNaN(editIndex);

  if (cancelLink) {
    cancelLink.href = `activities.html?id=${tripId}`;
  }

  if (formTitle && isEditMode) {
    formTitle.textContent = 'EDITAR ATIVIDADE';
  }

  if (!activityForm) return;

  if (costInput) {
    costInput.addEventListener('input', () => {
      costInput.value = costInput.value.replace(/[^0-9.,]/g, '');
    });
  }

  if (isEditMode) {
    sessionStorage.setItem('editActivityIndex', String(editIndex));
    fillFormForEdit(tripId, editIndex);

    if (deleteButton) {
      deleteButton.style.display = 'inline-block';

      deleteButton.addEventListener('click', () => {
        const confirmDelete = confirm('Tens a certeza que queres apagar esta atividade? 🗑️');
        if (!confirmDelete) return;

        const trips = getTrips();
        const tripIndex = trips.findIndex((trip) => String(trip.id) === String(tripId));

        if (tripIndex === -1) {
          showFunnyMessage('Ups... não encontrei essa viagem 👀');
          return;
        }

        if (!trips[tripIndex].activities || !trips[tripIndex].activities[editIndex]) {
          showFunnyMessage('Essa atividade já não existe 😅');
          return;
        }

        trips[tripIndex].activities.splice(editIndex, 1);
        updateTripSpent(trips[tripIndex]);
        saveTrips(trips);

        sessionStorage.removeItem('editActivityIndex');

        showFunnyMessage('🗑️ Atividade apagada. Ficou mais leve essa viagem.');

        setTimeout(() => {
          window.location.href = `activities.html?id=${tripId}`;
        }, 1200);
      });
    }
  } else {
    sessionStorage.removeItem('editActivityIndex');
  }

  activityForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const activityNameEl = document.getElementById('activityName');
    const activityTypeEl = document.getElementById('activityType');
    const activityDateEl = document.getElementById('activityDate');
    const activityPeriodEl = document.getElementById('activityPeriod');
    const activityCostEl = document.getElementById('activityCost');

    if (!activityNameEl || !activityTypeEl || !activityDateEl || !activityPeriodEl || !activityCostEl) {
      console.error('Há campos do formulário que não foram encontrados.');
      return;
    }

    const name = activityNameEl.value.trim();
    const type = activityTypeEl.value;
    const date = activityDateEl.value;
    const period = activityPeriodEl.value;
    const rawCost = activityCostEl.value.trim().replace(',', '.');
    const cost = rawCost === '' ? 0 : Number(rawCost);

    if (!name || !type || !period) {
      showFunnyMessage('Ei viajante 😅 ainda faltam alguns campos obrigatórios.');
      return;
    }

    if (rawCost !== '' && Number.isNaN(cost)) {
      showFunnyMessage('Esse custo está meio turista perdido 😬 mete um número válido.');
      return;
    }

    const trips = getTrips();
    const tripIndex = trips.findIndex((trip) => String(trip.id) === String(tripId));

    if (tripIndex === -1) {
      showFunnyMessage('Ups... não encontrei essa viagem 👀');
      return;
    }

    if (!trips[tripIndex].activities) {
      trips[tripIndex].activities = [];
    }

    const activityData = {
      name,
      type,
      date,
      period,
      cost
    };

    if (isEditMode && trips[tripIndex].activities[editIndex]) {
      trips[tripIndex].activities[editIndex] = activityData;

      updateTripSpent(trips[tripIndex]);
      saveTrips(trips);

      sessionStorage.removeItem('editActivityIndex');

      showFunnyMessage('✏️ Atividade atualizada! Ficou mesmo no ponto.');
    } else {
      trips[tripIndex].activities.push(activityData);

      updateTripSpent(trips[tripIndex]);
      saveTrips(trips);

      showFunnyMessage('✈️ Atividade guardada! Mais uma aventura no mapa.');
    }

    setTimeout(() => {
      window.location.href = `activities.html?id=${tripId}`;
    }, 1400);
  });

  function showFunnyMessage(message) {
    if (!successMessage) return;

    successMessage.textContent = message;
    successMessage.classList.add('show');

    setTimeout(() => {
      successMessage.classList.remove('show');
    }, 2200);
  }
});

function getEditIndexFromURL() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get('edit');

  if (value !== null) {
    sessionStorage.setItem('editActivityIndex', value);
    return Number(value);
  }

  const storedValue = sessionStorage.getItem('editActivityIndex');

  return storedValue !== null ? Number(storedValue) : null;
}

function fillFormForEdit(tripId, editIndex) {
  const trips = getTrips();
  const trip = trips.find((item) => String(item.id) === String(tripId));

  if (!trip || !trip.activities || !trip.activities[editIndex]) return;

  const activity = trip.activities[editIndex];

  const activityNameEl = document.getElementById('activityName');
  const activityTypeEl = document.getElementById('activityType');
  const activityDateEl = document.getElementById('activityDate');
  const activityPeriodEl = document.getElementById('activityPeriod');
  const activityCostEl = document.getElementById('activityCost');

  if (activityNameEl) activityNameEl.value = activity.name || '';
  if (activityTypeEl) activityTypeEl.value = activity.type || '';
  if (activityDateEl) activityDateEl.value = activity.date || '';
  if (activityPeriodEl) activityPeriodEl.value = activity.period || '';
  if (activityCostEl) activityCostEl.value = activity.cost ?? '';
}

function updateTripSpent(trip) {
  const hotelTotal = (trip.hotels || [])
    .reduce((sum, hotel) => sum + (Number(hotel.price) || 0), 0);

  const transportTotal = (trip.transports || [])
    .reduce((sum, transport) => sum + (Number(transport.price) || 0), 0);

  const activitiesTotal = (trip.activities || [])
    .reduce((sum, activity) => sum + (Number(activity.cost) || 0), 0);

  const expensesTotal = (trip.expenses || [])
    .reduce((sum, expense) => sum + (Number(expense.cost) || 0), 0);

  trip.spent = hotelTotal + transportTotal + activitiesTotal + expensesTotal;
}