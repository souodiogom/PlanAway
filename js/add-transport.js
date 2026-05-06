document.addEventListener('DOMContentLoaded', () => {
  const tripId = getTripIdFromURL();
  const editIndex = getTransportEditIndexFromURL();

  if (!tripId) {
    window.location.href = 'index.html';
    return;
  }

  const trip = getTripById(tripId);

  const cancelLink = document.getElementById('cancelTransportLink');
  const formTitle = document.getElementById('transportFormTitle');
  const transportForm = document.getElementById('transportForm');
  const successMessage = document.getElementById('transportSuccessMessage');
  const priceInput = document.getElementById('transportPrice');
  const deleteButton = document.getElementById('deleteTransportButton');
  const transportDateInput = document.getElementById('transportDate');

  const isEditMode = editIndex !== null && !Number.isNaN(editIndex);

  if (cancelLink) {
    cancelLink.href = `transports.html?id=${tripId}`;
  }

  if (formTitle && isEditMode) {
    formTitle.textContent = 'EDITAR TRANSPORTE';
  }

  if (!transportForm) return;

  if (trip && transportDateInput) {
    transportDateInput.min = trip.startDate;
    transportDateInput.max = trip.endDate;
  }

  if (priceInput) {
    priceInput.addEventListener('input', () => {
      priceInput.value = priceInput.value.replace(/[^0-9.,]/g, '');
    });
  }

  if (isEditMode) {
    sessionStorage.setItem('editTransportIndex', String(editIndex));
    fillTransportFormForEdit(tripId, editIndex);

    if (deleteButton) {
      deleteButton.style.display = 'inline-block';

      deleteButton.addEventListener('click', () => {
        const confirmDelete = confirm('Tens a certeza que queres apagar este transporte? 🚍');
        if (!confirmDelete) return;

        const trips = getTrips();
        const tripIndex = trips.findIndex((trip) => String(trip.id) === String(tripId));

        if (tripIndex === -1) {
          showTransportMessage('Ups... não encontrei essa viagem 👀');
          return;
        }

        if (!trips[tripIndex].transports || !trips[tripIndex].transports[editIndex]) {
          showTransportMessage('Esse transporte já não existe 😅');
          return;
        }

        trips[tripIndex].transports.splice(editIndex, 1);
        updateTripSpent(trips[tripIndex]);
        saveTrips(trips);

        sessionStorage.removeItem('editTransportIndex');

        showTransportMessage('🗑️ Transporte apagado.');

        setTimeout(() => {
          window.location.href = `transports.html?id=${tripId}`;
        }, 1200);
      });
    }
  } else {
    sessionStorage.removeItem('editTransportIndex');
  }

  transportForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const transportTypeEl = document.getElementById('transportType');
    const transportDateEl = document.getElementById('transportDate');
    const transportPeriodEl = document.getElementById('transportPeriod');
    const transportPriceEl = document.getElementById('transportPrice');

    if (!transportTypeEl || !transportDateEl || !transportPeriodEl || !transportPriceEl) {
      console.error('Há campos do formulário de transporte que não foram encontrados.');
      return;
    }

    const type = transportTypeEl.value;
    const date = transportDateEl.value;
    const period = transportPeriodEl.value;
    const rawPrice = transportPriceEl.value.trim().replace(',', '.');
    const price = rawPrice === '' ? 0 : Number(rawPrice);

    if (!type || !date || !period) {
      showTransportMessage('Ainda faltam alguns campos obrigatórios.');
      return;
    }

    if (trip && (date < trip.startDate || date > trip.endDate)) {
      showTransportMessage('A data do transporte tem de estar dentro das datas da viagem.');
      return;
    }

    if (rawPrice !== '' && Number.isNaN(price)) {
      showTransportMessage('Esse valor do transporte não é válido.');
      return;
    }

    const trips = getTrips();
    const tripIndex = trips.findIndex((trip) => String(trip.id) === String(tripId));

    if (tripIndex === -1) {
      showTransportMessage('Ups... Viagem não encontrada.');
      return;
    }

    if (!trips[tripIndex].transports) {
      trips[tripIndex].transports = [];
    }

    const transportData = {
      type,
      date,
      period,
      price
    };

    if (isEditMode && trips[tripIndex].transports[editIndex]) {
      trips[tripIndex].transports[editIndex] = transportData;

      updateTripSpent(trips[tripIndex]);
      saveTrips(trips);

      sessionStorage.removeItem('editTransportIndex');

      showTransportMessage('✏️ Transporte atualizado.');
    } else {
      trips[tripIndex].transports.push(transportData);

      updateTripSpent(trips[tripIndex]);
      saveTrips(trips);

      showTransportMessage('🚍 Transporte guardado.');
    }

    setTimeout(() => {
      window.location.href = `transports.html?id=${tripId}`;
    }, 1400);
  });

  function showTransportMessage(message) {
    if (!successMessage) return;

    successMessage.textContent = message;
    successMessage.classList.add('show');

    setTimeout(() => {
      successMessage.classList.remove('show');
    }, 2200);
  }
});

function getTransportEditIndexFromURL() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get('edit');

  if (value !== null) {
    sessionStorage.setItem('editTransportIndex', value);
    return Number(value);
  }

  const storedValue = sessionStorage.getItem('editTransportIndex');

  return storedValue !== null ? Number(storedValue) : null;
}

function fillTransportFormForEdit(tripId, editIndex) {
  const trips = getTrips();
  const trip = trips.find((item) => String(item.id) === String(tripId));

  if (!trip || !trip.transports || !trip.transports[editIndex]) return;

  const transport = trip.transports[editIndex];

  const transportTypeEl = document.getElementById('transportType');
  const transportDateEl = document.getElementById('transportDate');
  const transportPeriodEl = document.getElementById('transportPeriod');
  const transportPriceEl = document.getElementById('transportPrice');

  if (transportTypeEl) transportTypeEl.value = transport.type || '';
  if (transportDateEl) transportDateEl.value = transport.date || '';
  if (transportPeriodEl) transportPeriodEl.value = transport.period || '';
  if (transportPriceEl) transportPriceEl.value = transport.price ?? '';
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