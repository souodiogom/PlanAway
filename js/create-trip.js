document.addEventListener('DOMContentLoaded', () => {
  const tripForm = document.getElementById('tripForm');
  if (!tripForm) return;

  tripForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const destination = document.getElementById('destination').value.trim();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const budget = Number(document.getElementById('budget').value);
    const notes = document.getElementById('notes').value.trim();

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