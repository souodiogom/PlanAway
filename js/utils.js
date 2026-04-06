function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-PT');
}

function getTripIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  const tripIdFromUrl = params.get('id');

  if (tripIdFromUrl) {
    sessionStorage.setItem('selectedTripId', tripIdFromUrl);
    return tripIdFromUrl;
  }

  return sessionStorage.getItem('selectedTripId');
}