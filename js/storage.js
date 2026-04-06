function getTrips() {
  return JSON.parse(localStorage.getItem('trips')) || [];
}

function saveTrips(trips) {
  localStorage.setItem('trips', JSON.stringify(trips));
}

function getTripById(id) {
  return getTrips().find((trip) => String(trip.id) === String(id));
}

function updateTrip(id, updater) {
  const trips = getTrips().map((trip) => {
    if (String(trip.id) === String(id)) {
      return updater({ ...trip });
    }
    return trip;
  });

  saveTrips(trips);
  return getTripById(id);
}

function ensureSeedData() {
  const trips = getTrips();
  if (trips.length) return;

  const seeded = [
    {
      id: Date.now(),
      destination: 'Paris',
      startDate: '2026-07-12',
      endDate: '2026-07-15',
      budget: 500,
      spent: 90,
      notes: 'Viagem low-cost',
      hotels: ['Hotel Central'],
      transports: ['Metro / avião'],
      activities: [
        { name: 'Museu do Louvre', cost: 20 },
        { name: 'Passeio no Sena', cost: 25 }
      ],
      expenses: [
        { name: 'Jantar', cost: 20 },
        { name: 'Transportes', cost: 25 }
      ]
    }
  ];

  saveTrips(seeded);
}

document.addEventListener('DOMContentLoaded', ensureSeedData);