// ui.js: the only file that touches the page (DOM). No fetch calls here.

function showMessage(text) {
  document.querySelector('#message').textContent = text;
}

// Build the table rows from an array of socks.
function renderSocks(socks) {
  const list = document.querySelector('#sockList');
  list.innerHTML = '';

  for (const sock of socks) {
    const row = document.createElement('tr');

    // textContent (not innerHTML) so user-typed text can't inject HTML.
    for (const value of [sock.title, sock.condition, sock.tags.join(', ')]) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    }

    // Notes cell: the log (date + text), then a box to add a new note.
    const notesCell = document.createElement('td');
    for (const note of sock.notes) {
      const line = document.createElement('div');
      line.className = 'small';
      line.textContent = `${new Date(note.date).toLocaleDateString()}: ${note.text}`;
      notesCell.appendChild(line);
    }
    const noteForm = document.createElement('div');
    noteForm.className = 'input-group input-group-sm mt-1';
    noteForm.innerHTML =
      '<input class="form-control note-input" placeholder="New note">' +
      '<button class="btn btn-outline-secondary note-btn">Add</button>';
    noteForm.querySelector('.note-btn').dataset.id = sock._id;
    notesCell.appendChild(noteForm);
    row.appendChild(notesCell);

    const actions = document.createElement('td');
    actions.innerHTML =
      '<button class="btn btn-sm btn-outline-primary edit-btn">Edit</button> ' +
      '<button class="btn btn-sm btn-outline-danger delete-btn">Delete</button>';
    // Remember which sock this row belongs to.
    actions.querySelector('.edit-btn').dataset.id = sock._id;
    actions.querySelector('.delete-btn').dataset.id = sock._id;
    row.appendChild(actions);

    list.appendChild(row);
  }
}

// Read the form fields into a plain object.
function readForm() {
  return {
    title: document.querySelector('#title').value,
    condition: document.querySelector('#condition').value,
    tags: document.querySelector('#tags').value,
  };
}

// Put a sock into the form so it can be edited.
function fillForm(sock) {
  document.querySelector('#sockId').value = sock._id;
  document.querySelector('#title').value = sock.title;
  document.querySelector('#condition').value = sock.condition;
  document.querySelector('#tags').value = sock.tags.join(', ');
  document.querySelector('#saveBtn').textContent = 'Save changes';
  document.querySelector('#sockForm').classList.add('editing');
}

function resetForm() {
  document.querySelector('#sockForm').reset();
  document.querySelector('#sockId').value = '';
  document.querySelector('#saveBtn').textContent = 'Add sock';
  document.querySelector('#sockForm').classList.remove('editing');
}