document.addEventListener('DOMContentLoaded', () => {
  const trips = getTrips();
  const activities = trips.reduce((acc, trip) => acc + (trip.activities?.length || 0), 0);
  const expenses = trips.reduce((acc, trip) => acc + (trip.expenses?.length || 0), 0);

  const tripsCount = document.getElementById('profileTripsCount');
  const activitiesCount = document.getElementById('profileActivitiesCount');
  const expensesCount = document.getElementById('profileExpensesCount');

  if (tripsCount) tripsCount.textContent = trips.length;
  if (activitiesCount) activitiesCount.textContent = activities;
  if (expensesCount) expensesCount.textContent = expenses;
});