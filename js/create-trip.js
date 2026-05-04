document.addEventListener('DOMContentLoaded', () => {
  const tripForm = document.getElementById('tripForm');
  if (!tripForm) return;

  const params = new URLSearchParams(window.location.search);
let tripId = params.get('id');

if (!tripId) {
  tripId = sessionStorage.getItem('editTripId');
}

const isEditMode = Boolean(tripId);

  const destinationInput = document.getElementById('destination');
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const budgetInput = document.getElementById('budget');
  const notesInput = document.getElementById('notes');

  if (isEditMode) {
    const trip = getTripById(tripId);

    if (trip) {
      destinationInput.value = trip.destination || '';
      startDateInput.value = trip.startDate || '';
      endDateInput.value = trip.endDate || '';
      budgetInput.value = trip.budget || '';
      notesInput.value = trip.notes || '';

      const title = document.querySelector('.page-title');
      if (title) title.textContent = 'EDITAR VIAGEM';

      const submitButton = tripForm.querySelector('button[type="submit"]');
      if (submitButton) submitButton.textContent = 'Guardar alterações';
    }
  }

  tripForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const destination = destinationInput.value.trim();
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const budget = Number(budgetInput.value);
    const notes = notesInput.value.trim();

    if (!destination || !startDate || !endDate || Number.isNaN(budget)) {
      alert('Preenche todos os campos obrigatórios.');
      return;
    }

    if (isEditMode) {
      updateTrip(tripId, (trip) => ({
        ...trip,
        destination,
        startDate,
        endDate,
        budget,
        notes
      }));

      sessionStorage.removeItem('editTripId');
      window.location.href = `trip.html?id=${tripId}`;
      return;
    }

    const trips = getTrips();

    const newTrip = {
      id: Date.now(),
      destination,
      startDate,
      endDate,
      budget,
      spent: 0,
      notes,
      hotels: [],
      transports: [],
      activities: [],
      expenses: []
    };

    trips.push(newTrip);
    saveTrips(trips);

    window.location.href = `trip.html?id=${newTrip.id}`;
  });
});