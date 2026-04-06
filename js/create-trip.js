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

    if (!destination || !startDate || !endDate || !budget) {
      alert('Preenche todos os campos obrigatórios.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert('A data de fim não pode ser anterior à data de início.');
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