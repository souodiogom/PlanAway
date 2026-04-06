document.addEventListener('DOMContentLoaded', () => {
  const tripId = getTripIdFromURL();
  const editIndex = getEditIndexFromURL();

  if (!tripId) {
    window.location.href = 'index';
    return;
  }

  const cancelLink = document.getElementById('cancelActivityLink');
  const formTitle = document.getElementById('formTitle');
  const activityForm = document.getElementById('activityForm');
  const successMessage = document.getElementById('successMessage');
  const costInput = document.getElementById('activityCost');
  const deleteButton = document.getElementById('deleteActivityButton');

  if (cancelLink) {
    cancelLink.href = `activities?id=${tripId}`;
  }

  if (formTitle && editIndex !== null && !Number.isNaN(editIndex)) {
    formTitle.textContent = 'EDITAR ATIVIDADE';
  }

  if (!activityForm) return;

  if (costInput) {
    costInput.addEventListener('input', () => {
      costInput.value = costInput.value.replace(/[^0-9.,]/g, '');
    });
  }

  if (editIndex !== null && !Number.isNaN(editIndex)) {
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

        const deletedActivity = trips[tripIndex].activities[editIndex];
        const deletedCost = Number(deletedActivity.cost) || 0;

        trips[tripIndex].activities.splice(editIndex, 1);
        trips[tripIndex].spent = (Number(trips[tripIndex].spent) || 0) - deletedCost;

        if (trips[tripIndex].spent < 0) {
          trips[tripIndex].spent = 0;
        }

        saveTrips(trips);
        showFunnyMessage('🗑️ Atividade apagada. Ficou mais leve essa viagem.');

        setTimeout(() => {
          window.location.href = `activities?id=${tripId}`;
        }, 1200);
      });
    }
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

    if (editIndex !== null && !Number.isNaN(editIndex) && trips[tripIndex].activities[editIndex]) {
      const previousCost = Number(trips[tripIndex].activities[editIndex].cost) || 0;

      trips[tripIndex].activities[editIndex] = {
        name,
        type,
        date,
        period,
        cost
      };

      trips[tripIndex].spent = (Number(trips[tripIndex].spent) || 0) - previousCost + cost;

      if (trips[tripIndex].spent < 0) {
        trips[tripIndex].spent = 0;
      }

      saveTrips(trips);
      showFunnyMessage('✏️ Atividade atualizada! Ficou mesmo no ponto.');
    } else {
      trips[tripIndex].activities.push({
        name,
        type,
        date,
        period,
        cost
      });

      trips[tripIndex].spent = (Number(trips[tripIndex].spent) || 0) + cost;

      saveTrips(trips);
      showFunnyMessage('✈️ Atividade guardada! Mais uma aventura no mapa.');
    }

    setTimeout(() => {
      window.location.href = `activities?id=${tripId}`;
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
  return value !== null ? Number(value) : null;
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