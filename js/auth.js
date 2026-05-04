const usersKey = 'planawayUsers';
const loggedUserKey = 'planawayLoggedUser';

function getUsers() {
  return JSON.parse(localStorage.getItem(usersKey)) || [];
}

function saveUsers(users) {
  localStorage.setItem(usersKey, JSON.stringify(users));
}

function registerUser(email, password) {
  const users = getUsers();

  const userExists = users.some(user => user.email === email);

  if (userExists) {
    alert('Esta conta já existe.');
    return false;
  }

  users.push({ email, password });
  saveUsers(users);

  localStorage.setItem(loggedUserKey, email);
  window.location.href = 'index.html';
}

function loginUser(email, password) {
  const users = getUsers();

  const user = users.find(user => user.email === email && user.password === password);

  if (!user) {
    alert('Email ou password incorretos.');
    return false;
  }

  localStorage.setItem(loggedUserKey, email);
  window.location.href = 'index.html';
}

function logoutUser() {
  localStorage.removeItem(loggedUserKey);
  window.location.href = 'login.html';
}