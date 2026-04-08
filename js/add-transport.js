document.addEventListener('DOMContentLoaded', () => {
  const tripId = getTripIdFromURL();
  const editIndex = getTransportEditIndexFromURL();
  const trip = getTripById(tripId);

  if (!tripId) {
    window.location.href = 'index.html';
    return;
  }

  const cancelLink = document.getElementById('cancelTransportLink');
  const formTitle = document.getElementById('transportFormTitle');
  const transportForm = document.getElementById('transportForm');
  const successMessage = document.getElementById('transportSuccessMessage');
  const priceInput = document.getElementById('transportPrice');
  const deleteButton = document.getElementById('deleteTransportButton');
  const transportDateInput = document.getElementById('transportDate');

  if (cancelLink) {
    cancelLink.href = `transports.html?id=${tripId}`;
  }

  if (formTitle && editIndex !== null && !Number.isNaN(editIndex)) {
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

  if (editIndex !== null && !Number.isNaN(editIndex)) {
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

        const deletedTransport = trips[tripIndex].transports[editIndex];
        const deletedPrice = Number(deletedTransport.price) || 0;

        trips[tripIndex].transports.splice(editIndex, 1);
        trips[tripIndex].spent = (Number(trips[tripIndex].spent) || 0) - deletedPrice;

        if (trips[tripIndex].spent < 0) {
          trips[tripIndex].spent = 0;
        }

        saveTrips(trips);
        showTransportMessage('🗑️ Transporte apagado com sucesso.');

        setTimeout(() => {
          window.location.href = `transports.html?id=${tripId}`;
        }, 1200);
      });
    }
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
      showTransportMessage('Ei viajante 😅 ainda faltam alguns campos obrigatórios.');
      return;
    }

    if (trip && (date < trip.startDate || date > trip.endDate)) {
      showTransportMessage('A data do transporte tem de estar dentro das datas da viagem.');
      return;
    }

    if (rawPrice !== '' && Number.isNaN(price)) {
      showTransportMessage('Esse valor do transporte não parece válido 😬');
      return;
    }

    const trips = getTrips();
    const tripIndex = trips.findIndex((trip) => String(trip.id) === String(tripId));

    if (tripIndex === -1) {
      showTransportMessage('Ups... não encontrei essa viagem 👀');
      return;
    }

    if (!trips[tripIndex].transports) {
      trips[tripIndex].transports = [];
    }

    if (editIndex !== null && !Number.isNaN(editIndex) && trips[tripIndex].transports[editIndex]) {
      const previousPrice = Number(trips[tripIndex].transports[editIndex].price) || 0;

      trips[tripIndex].transports[editIndex] = {
        type,
        date,
        period,
        price
      };

      trips[tripIndex].spent = (Number(trips[tripIndex].spent) || 0) - previousPrice + price;

      if (trips[tripIndex].spent < 0) {
        trips[tripIndex].spent = 0;
      }

      saveTrips(trips);
      showTransportMessage('✏️ Transporte atualizado com sucesso.');
    } else {
      trips[tripIndex].transports.push({
        type,
        date,
        period,
        price
      });

      trips[tripIndex].spent = (Number(trips[tripIndex].spent) || 0) + price;

      saveTrips(trips);
      showTransportMessage('🚍 Transporte guardado com sucesso.');
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
  return value !== null ? Number(value) : null;
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