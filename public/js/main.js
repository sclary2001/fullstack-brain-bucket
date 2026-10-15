// main.js: wires events to api.js (server) and ui.js (page).

// Keep the loaded socks so Edit can find one without another request.
let currentSocks = [];

async function loadSocks() {
  const search = document.querySelector('#searchBox').value.trim();
  currentSocks = await apiGetSocks(search);
  renderSocks(currentSocks);
}

// Add or save: the hidden id decides which.
document.querySelector('#sockForm').addEventListener('submit', async (event) => {
  event.preventDefault(); // stop the page from reloading

  const id = document.querySelector('#sockId').value;
  const sock = readForm();
  const result = id ? await apiUpdateSock(id, sock) : await apiCreateSock(sock);

  showMessage(result.error || '');
  if (!result.error) {
    resetForm();
    loadSocks();
  }
});

// One listener on the table handles every Edit/Delete/Add-note button (event delegation).
document.querySelector('#sockList').addEventListener('click', async (event) => {
  const id = event.target.dataset.id;
  if (!id) return;

  if (event.target.classList.contains('note-btn')) {
    const input = event.target.parentElement.querySelector('.note-input');
    const result = await apiAddNote(id, input.value);
    showMessage(result.error || '');
    if (!result.error) loadSocks();
  }

  if (event.target.classList.contains('edit-btn')) {
    fillForm(currentSocks.find((sock) => sock._id === id));
  }

  if (event.target.classList.contains('delete-btn')) {
    await apiDeleteSock(id);
    loadSocks();
  }
});

document.querySelector('#searchBtn').addEventListener('click', loadSocks);

document.querySelector('#clearFilterBtn').addEventListener('click', () => {
  document.querySelector('#searchBox').value = '';
  loadSocks();
});

loadSocks();