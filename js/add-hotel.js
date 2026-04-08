document.addEventListener('DOMContentLoaded', () => {
  const tripId = getTripIdFromURL();
  const editIndex = getHotelEditIndexFromURL();
  const trip = getTripById(tripId);

  if (!tripId) {
    window.location.href = 'index.html';
    return;
  }

  const cancelLink = document.getElementById('cancelHotelLink');
  const formTitle = document.getElementById('hotelFormTitle');
  const hotelForm = document.getElementById('hotelForm');
  const successMessage = document.getElementById('hotelSuccessMessage');
  const priceInput = document.getElementById('hotelPrice');
  const deleteButton = document.getElementById('deleteHotelButton');
  const hotelDateInput = document.getElementById('hotelDate');

  if (cancelLink) {
    cancelLink.href = `hotels.html?id=${tripId}`;
  }

  if (formTitle && editIndex !== null && !Number.isNaN(editIndex)) {
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

  if (editIndex !== null && !Number.isNaN(editIndex)) {
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

        const deletedHotel = trips[tripIndex].hotels[editIndex];
        const deletedPrice = Number(deletedHotel.price) || 0;

        trips[tripIndex].hotels.splice(editIndex, 1);
        trips[tripIndex].spent = (Number(trips[tripIndex].spent) || 0) - deletedPrice;

        if (trips[tripIndex].spent < 0) {
          trips[tripIndex].spent = 0;
        }

        saveTrips(trips);
        showHotelMessage('🗑️ Alojamento apagado com sucesso.');

        setTimeout(() => {
          window.location.href = `hotels.html?id=${tripId}`;
        }, 1200);
      });
    }
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

    if (editIndex !== null && !Number.isNaN(editIndex) && trips[tripIndex].hotels[editIndex]) {
      const previousPrice = Number(trips[tripIndex].hotels[editIndex].price) || 0;

      trips[tripIndex].hotels[editIndex] = {
        name,
        date,
        nights,
        price
      };

      trips[tripIndex].spent = (Number(trips[tripIndex].spent) || 0) - previousPrice + price;

      if (trips[tripIndex].spent < 0) {
        trips[tripIndex].spent = 0;
      }

      saveTrips(trips);
      showHotelMessage('✏️ Alojamento atualizado com sucesso.');
    } else {
      trips[tripIndex].hotels.push({
        name,
        date,
        nights,
        price
      });

      trips[tripIndex].spent = (Number(trips[tripIndex].spent) || 0) + price;

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
  return value !== null ? Number(value) : null;
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