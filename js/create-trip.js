document.addEventListener('DOMContentLoaded', () => {
  const tripForm = document.getElementById('tripForm');
  if (!tripForm) return;

  const params = new URLSearchParams(window.location.search);
  const tripId = params.get('id');
  const isEditMode = params.get('edit') === 'true';

  if (isEditMode && tripId) {
    const trip = getTripById(tripId);

    if (trip) {
      document.getElementById('destination').value = trip.destination || '';
      document.getElementById('startDate').value = trip.startDate || '';
      document.getElementById('endDate').value = trip.endDate || '';
      document.getElementById('budget').value = trip.budget || '';
      document.getElementById('notes').value = trip.notes || '';
    }
  }

  tripForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const destination = document.getElementById('destination').value.trim();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const budget = Number(document.getElementById('budget').value);
    const notes = document.getElementById('notes').value.trim();

    if (isEditMode && tripId) {
      updateTrip(tripId, (trip) => ({
        ...trip,
        destination,
        startDate,
        endDate,
        budget,
        notes
      }));

      window.location.href = `trip.html?id=${tripId}`;
      return;
    }

    const trips = getTrips();
    trips.push({
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
    });

    saveTrips(trips);
    window.location.href = 'index.html';
  });
});