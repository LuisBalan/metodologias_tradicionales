const loginScreen = document.getElementById('login-screen');
const menuScreen = document.getElementById('menu-screen');
const actionScreen = document.getElementById('action-screen');
const subheader = document.getElementById('subheader');
const loginForm = document.getElementById('login-form');
const loginName = document.getElementById('login-name');
const logoutButton = document.getElementById('logout-button');
const backButton = document.getElementById('back-button');
const actionTitle = document.getElementById('action-title');
const actionDescription = document.getElementById('action-description');
const userFormPanel = document.getElementById('user-form-panel');
const titleFormPanel = document.getElementById('title-form-panel');
const copyFormPanel = document.getElementById('copy-form-panel');
const loanFormPanel = document.getElementById('loan-form-panel');
const userListPanel = document.getElementById('user-list-panel');
const bookListPanel = document.getElementById('book-list-panel');
const loanListPanel = document.getElementById('loan-list-panel');
const userList = document.getElementById('user-list');
const bookList = document.getElementById('book-list');
const loanList = document.getElementById('loan-list');
const loanUser = document.getElementById('loan-user');
const loanBook = document.getElementById('loan-book');

const userForm = document.getElementById('user-form');
const titleForm = document.getElementById('title-form');
const copyForm = document.getElementById('copy-form');
const loanForm = document.getElementById('loan-form');

const optionButtons = Array.from(document.querySelectorAll('.option-card'));

let currentUser = null;
let currentAction = null;

function showScreen(screen) {
  [loginScreen, menuScreen, actionScreen].forEach(section => {
    section.classList.toggle('active', section === screen);
  });
}

function showFormPanel(panel) {
  [userFormPanel, titleFormPanel, copyFormPanel, loanFormPanel].forEach(form => {
    form.classList.toggle('hidden', form !== panel);
  });
}

function showListPanel(panel) {
  [userListPanel, bookListPanel, loanListPanel].forEach(list => {
    list.classList.toggle('hidden', list !== panel);
  });
}

function setAction(action) {
  currentAction = action;
  if (action === 'user') {
    actionTitle.textContent = 'Agregar usuario';
    actionDescription.textContent = 'Registra nuevos usuarios y administra la lista de usuarios registrados.';
    showFormPanel(userFormPanel);
    showListPanel(userListPanel);
  } else if (action === 'title') {
    actionTitle.textContent = 'Agregar título';
    actionDescription.textContent = 'Registra nuevos títulos de libros en la biblioteca.';
    showFormPanel(titleFormPanel);
    showListPanel(bookListPanel);
  } else if (action === 'copy') {
    actionTitle.textContent = 'Agregar ejemplar';
    actionDescription.textContent = 'Registra un ejemplar adicional de un libro existente o uno nuevo.';
    showFormPanel(copyFormPanel);
    showListPanel(bookListPanel);
  } else if (action === 'loan') {
    actionTitle.textContent = 'Realizar préstamo';
    actionDescription.textContent = 'Registra un nuevo préstamo con fecha de salida y fecha propuesta de regreso.';
    showFormPanel(loanFormPanel);
    showListPanel(loanListPanel);
  }
  refreshAll().catch(error => console.error('Error cargando datos:', error.message));
  showScreen(actionScreen);
}

function getSavedUser() {
  return localStorage.getItem('library_user');
}

function saveUser(name) {
  localStorage.setItem('library_user', name);
}

function clearSavedUser() {
  localStorage.removeItem('library_user');
}

function activateMenu() {
  const user = getSavedUser();
  if (!user) {
    showScreen(loginScreen);
    subheader.textContent = 'Inicia sesión para acceder al panel de administración.';
    return;
  }
  currentUser = user;
  subheader.textContent = `Hola, ${user}. Selecciona una acción para continuar.`;
  showScreen(menuScreen);
}

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Error en la solicitud');
  }
  return res.json();
}

async function loadUsers() {
  const users = await fetchJson('/api/users');
  userList.innerHTML = '';
  loanUser.innerHTML = '<option value="">Selecciona usuario</option>';

  users.forEach(user => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${user.name}</span>
      <button type="button" data-id="${user.id}">Borrar</button>
    `;
    li.querySelector('button').addEventListener('click', () => deleteUser(user.id));
    userList.appendChild(li);

    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = user.name;
    loanUser.appendChild(option);
  });
}

async function loadBooks() {
  const books = await fetchJson('/api/books');
  bookList.innerHTML = '';
  loanBook.innerHTML = '<option value="">Selecciona libro</option>';

  books.forEach(book => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${book.title} — ${book.author}</span>
      <button type="button" data-id="${book.id}">Borrar</button>
    `;
    li.querySelector('button').addEventListener('click', () => deleteBook(book.id));
    bookList.appendChild(li);

    const option = document.createElement('option');
    option.value = book.id;
    option.textContent = `${book.title} — ${book.author}`;
    loanBook.appendChild(option);
  });
}

async function loadLoans() {
  const loans = await fetchJson('/api/loans');
  loanList.innerHTML = '';

  loans.forEach(loan => {
    const li = document.createElement('li');
    const returned = loan.return_date ? 'Entregado' : 'Pendiente';
    li.innerHTML = `
      <div class="loan-info">
        <strong>${loan.user_name} → ${loan.book_title}</strong>
        <small>Salida: ${loan.salida_date} | Vence: ${loan.due_date}</small>
        <small>Estado: ${returned}${loan.return_date ? ` | Entrega: ${loan.return_date}` : ''}</small>
      </div>
      <button type="button" data-id="${loan.id}" ${loan.return_date ? 'disabled' : ''}>
        ${loan.return_date ? 'Reentregado' : 'Entregar'}
      </button>
    `;
    const button = li.querySelector('button');
    if (!loan.return_date) {
      button.addEventListener('click', () => returnLoan(loan.id));
    }
    loanList.appendChild(li);
  });
}

async function deleteUser(id) {
  await fetchJson(`/api/users/${id}`, { method: 'DELETE' });
  await refreshAll();
}

async function deleteBook(id) {
  await fetchJson(`/api/books/${id}`, { method: 'DELETE' });
  await refreshAll();
}

async function returnLoan(id) {
  const today = new Date().toISOString().slice(0, 10);
  await fetchJson(`/api/loans/${id}/return`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ return_date: today })
  });
  await refreshAll();
}

async function refreshAll() {
  await Promise.all([loadUsers(), loadBooks(), loadLoans()]);
}

loginForm.addEventListener('submit', event => {
  event.preventDefault();
  const name = loginName.value.trim();
  if (!name) return;
  saveUser(name);
  loginName.value = '';
  activateMenu();
});

logoutButton.addEventListener('click', () => {
  clearSavedUser();
  currentAction = null;
  showScreen(loginScreen);
  subheader.textContent = 'Inicia sesión para acceder al panel de administración.';
});

backButton.addEventListener('click', () => {
  activateMenu();
});

optionButtons.forEach(button => {
  button.addEventListener('click', () => {
    setAction(button.dataset.action);
  });
});

userForm.addEventListener('submit', async event => {
  event.preventDefault();
  const name = document.getElementById('user-name').value.trim();
  if (!name) return;
  await fetchJson('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  document.getElementById('user-name').value = '';
  await refreshAll();
});

titleForm.addEventListener('submit', async event => {
  event.preventDefault();
  const title = document.getElementById('book-title').value.trim();
  const author = document.getElementById('book-author').value.trim();
  if (!title || !author) return;
  await fetchJson('/api/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, author })
  });
  document.getElementById('book-title').value = '';
  document.getElementById('book-author').value = '';
  await refreshAll();
});

copyForm.addEventListener('submit', async event => {
  event.preventDefault();
  const title = document.getElementById('copy-title').value.trim();
  const author = document.getElementById('copy-author').value.trim();
  if (!title || !author) return;
  await fetchJson('/api/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, author })
  });
  document.getElementById('copy-title').value = '';
  document.getElementById('copy-author').value = '';
  await refreshAll();
});

loanForm.addEventListener('submit', async event => {
  event.preventDefault();
  const user_id = loanUser.value;
  const book_id = loanBook.value;
  const salida_date = document.getElementById('loan-salida').value;
  const due_date = document.getElementById('loan-due').value;
  if (!user_id || !book_id || !salida_date || !due_date) return;

  await fetchJson('/api/loans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, book_id, salida_date, due_date })
  });

  document.getElementById('loan-salida').value = '';
  document.getElementById('loan-due').value = '';
  await refreshAll();
});

activateMenu();
