document.addEventListener('DOMContentLoaded', () => {
  const tripId = getTripIdFromURL();
  const editIndex = getHotelEditIndexFromURL();

  if (!tripId) {
    window.location.href = 'index.html';
    return;
  }

  const trip = getTripById(tripId);

  const cancelLink = document.getElementById('cancelHotelLink');
  const formTitle = document.getElementById('hotelFormTitle');
  const hotelForm = document.getElementById('hotelForm');
  const successMessage = document.getElementById('hotelSuccessMessage');
  const priceInput = document.getElementById('hotelPrice');
  const deleteButton = document.getElementById('deleteHotelButton');
  const hotelDateInput = document.getElementById('hotelDate');

  const isEditMode = editIndex !== null && !Number.isNaN(editIndex);

  if (cancelLink) {
    cancelLink.href = `hotels.html?id=${tripId}`;
  }

  if (formTitle && isEditMode) {
    formTitle.textContent = 'EDITAR ALOJAMENTO';
  }

  if (!hotelForm) return;

  if (trip && hotelDateInput) {
    hotelDateInput.min = trip.startDate;
    hotelDateInput.max = trip.endDate;
  }

  if (priceInput) {
    priceInput.addEventListener('input', () => {
      priceInput.value = priceInput.value.replace(/[^0-9.,]/g, '');
    });
  }

  if (isEditMode) {
    sessionStorage.setItem('editHotelIndex', String(editIndex));
    fillHotelFormForEdit(tripId, editIndex);

    if (deleteButton) {
      deleteButton.style.display = 'inline-block';

      deleteButton.addEventListener('click', () => {
        const confirmDelete = confirm('Tens a certeza que queres apagar este alojamento? 🏨');
        if (!confirmDelete) return;

        const trips = getTrips();
        const tripIndex = trips.findIndex((trip) => String(trip.id) === String(tripId));

        if (tripIndex === -1) {
          showHotelMessage('Ups... não encontrei essa viagem 👀');
          return;
        }

        if (!trips[tripIndex].hotels || !trips[tripIndex].hotels[editIndex]) {
          showHotelMessage('Esse alojamento já não existe 😅');
          return;
        }

        trips[tripIndex].hotels.splice(editIndex, 1);
        updateTripSpent(trips[tripIndex]);
        saveTrips(trips);

        sessionStorage.removeItem('editHotelIndex');

        showHotelMessage('🗑️ Alojamento apagado com sucesso.');

        setTimeout(() => {
          window.location.href = `hotels.html?id=${tripId}`;
        }, 1200);
      });
    }
  } else {
    sessionStorage.removeItem('editHotelIndex');
  }

  hotelForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const hotelNameEl = document.getElementById('hotelName');
    const hotelDateEl = document.getElementById('hotelDate');
    const hotelNightsEl = document.getElementById('hotelNights');
    const hotelPriceEl = document.getElementById('hotelPrice');

    if (!hotelNameEl || !hotelDateEl || !hotelNightsEl || !hotelPriceEl) {
      console.error('Há campos do formulário de hotel que não foram encontrados.');
      return;
    }

    const name = hotelNameEl.value.trim();
    const date = hotelDateEl.value;
    const nights = Number(hotelNightsEl.value);
    const rawPrice = hotelPriceEl.value.trim().replace(',', '.');
    const price = rawPrice === '' ? 0 : Number(rawPrice);

    if (!name || !date || !hotelNightsEl.value.trim()) {
      showHotelMessage('Ei viajante 😅 ainda faltam alguns campos obrigatórios.');
      return;
    }

    if (trip && (date < trip.startDate || date > trip.endDate)) {
      showHotelMessage('A data do alojamento tem de estar dentro das datas da viagem.');
      return;
    }

    if (Number.isNaN(nights) || nights < 1) {
      showHotelMessage('O número de noites tem de ser válido.');
      return;
    }

    if (rawPrice !== '' && Number.isNaN(price)) {
      showHotelMessage('Esse valor do alojamento não parece válido 😬');
      return;
    }

    const trips = getTrips();
    const tripIndex = trips.findIndex((trip) => String(trip.id) === String(tripId));

    if (tripIndex === -1) {
      showHotelMessage('Ups... não encontrei essa viagem 👀');
      return;
    }

    if (!trips[tripIndex].hotels) {
      trips[tripIndex].hotels = [];
    }

    const hotelData = {
      name,
      date,
      nights,
      price
    };

    if (isEditMode && trips[tripIndex].hotels[editIndex]) {
      trips[tripIndex].hotels[editIndex] = hotelData;

      updateTripSpent(trips[tripIndex]);
      saveTrips(trips);

      sessionStorage.removeItem('editHotelIndex');

      showHotelMessage('✏️ Alojamento atualizado com sucesso.');
    } else {
      trips[tripIndex].hotels.push(hotelData);

      updateTripSpent(trips[tripIndex]);
      saveTrips(trips);

      showHotelMessage('🏨 Alojamento guardado com sucesso.');
    }

    setTimeout(() => {
      window.location.href = `hotels.html?id=${tripId}`;
    }, 1400);
  });

  function showHotelMessage(message) {
    if (!successMessage) return;

    successMessage.textContent = message;
    successMessage.classList.add('show');

    setTimeout(() => {
      successMessage.classList.remove('show');
    }, 2200);
  }
});

function getHotelEditIndexFromURL() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get('edit');

  if (value !== null) {
    sessionStorage.setItem('editHotelIndex', value);
    return Number(value);
  }

  const storedValue = sessionStorage.getItem('editHotelIndex');

  return storedValue !== null ? Number(storedValue) : null;
}

function fillHotelFormForEdit(tripId, editIndex) {
  const trips = getTrips();
  const trip = trips.find((item) => String(item.id) === String(tripId));

  if (!trip || !trip.hotels || !trip.hotels[editIndex]) return;

  const hotel = trip.hotels[editIndex];

  const hotelNameEl = document.getElementById('hotelName');
  const hotelDateEl = document.getElementById('hotelDate');
  const hotelNightsEl = document.getElementById('hotelNights');
  const hotelPriceEl = document.getElementById('hotelPrice');

  if (hotelNameEl) hotelNameEl.value = hotel.name || '';
  if (hotelDateEl) hotelDateEl.value = hotel.date || '';
  if (hotelNightsEl) hotelNightsEl.value = hotel.nights ?? '';
  if (hotelPriceEl) hotelPriceEl.value = hotel.price ?? '';
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