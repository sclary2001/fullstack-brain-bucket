const itemList = document.querySelector('#item-list');
const itemForm = document.querySelector('#item-form');
const message = document.querySelector('#form-message');
const submitButton = document.querySelector('#submit-button');
const cancelEdit = document.querySelector('#cancel-edit');
let editingId = null;
let searchTimer;

async function loadItems() {
  const params = new URLSearchParams();
  const query = document.querySelector('#search-filter').value.trim();
  const category = document.querySelector('#category-filter').value;
  if (query) params.set('q', query);
  if (category) params.set('category', category);
  itemList.innerHTML = '<p class="empty">Loading inventory…</p>';
  try {
    // User action → fetch() → Express → MongoDB → JSON → DOM.
    const response = await fetch(`/api/items?${params.toString()}`);
    if (!response.ok) throw new Error('Could not load the inventory.');
    const items = await response.json();
    document.querySelector('#item-count').textContent = items.length;
    updateCategoryOptions(items);
    if (!items.length) {
      itemList.innerHTML = '<p class="empty">No supplies match this view. Add one above.</p>';
      return;
    }
    itemList.replaceChildren(...items.map(renderItem));
  } catch (error) {
    itemList.textContent = `${error.message} Check the server connection and try again.`;
    itemList.className = 'empty';
  }
}

function renderItem(item) {
  const row = document.createElement('article');
  row.className = 'item-row';
  row.setAttribute('role', 'row');
  const supply = document.createElement('div');
  const name = document.createElement('div'); name.className = 'item-name'; name.textContent = item.name;
  const notes = document.createElement('div'); notes.className = 'item-note'; notes.textContent = item.notes || 'Hotel supply';
  supply.append(name, notes);
  const category = document.createElement('span'); category.className = 'category'; category.textContent = item.category;
  const quantity = document.createElement('span'); quantity.className = 'quantity'; quantity.textContent = item.quantity;
  const location = document.createElement('span'); location.className = 'location'; location.textContent = item.location || '—';
  const actions = document.createElement('div'); actions.className = 'actions';
  const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = 'Edit'; edit.addEventListener('click', () => beginEdit(item._id));
  const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'delete'; remove.textContent = 'Delete'; remove.addEventListener('click', () => deleteItem(item._id));
  actions.append(edit, remove);
  row.append(supply, category, quantity, location, actions);
  return row;
}

function updateCategoryOptions(items) {
  const select = document.querySelector('#category-filter');
  const selected = select.value;
  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  select.replaceChildren(new Option('All categories', ''), ...categories.map((category) => new Option(category, category)));
  if (categories.includes(selected)) select.value = selected;
}

async function beginEdit(id) {
  message.textContent = '';
  try {
    // Read one record by ID before filling the edit form.
    const response = await fetch(`/api/items/${encodeURIComponent(id)}`);
    const item = await response.json();
    if (!response.ok) throw new Error(item.error || 'Could not read this supply.');
    editingId = id;
    for (const field of ['name', 'category', 'quantity', 'location', 'notes']) itemForm.elements[field].value = item[field] ?? '';
    document.querySelector('#form-title').textContent = 'Edit a supply';
    submitButton.innerHTML = 'Update supply <span aria-hidden="true">↗</span>';
    cancelEdit.classList.remove('hidden');
    itemForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (error) { message.textContent = error.message; }
}

function resetForm() {
  editingId = null;
  itemForm.reset();
  itemForm.elements.quantity.value = '1';
  document.querySelector('#form-title').textContent = 'Add a supply';
  submitButton.innerHTML = 'Save supply <span aria-hidden="true">↗</span>';
  cancelEdit.classList.add('hidden');
  message.textContent = '';
}

itemForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = '';
  const values = Object.fromEntries(new FormData(itemForm).entries());
  values.quantity = Number(values.quantity);
  const method = editingId ? 'PATCH' : 'POST';
  const url = editingId ? `/api/items/${encodeURIComponent(editingId)}` : '/api/items';
  submitButton.disabled = true;
  try {
    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
    const result = response.status === 204 ? null : await response.json();
    if (!response.ok) throw new Error(result?.error || 'Could not save this supply.');
    resetForm();
    await loadItems();
  } catch (error) { message.textContent = error.message; }
  finally { submitButton.disabled = false; }
});

async function deleteItem(id) {
  if (!window.confirm('Delete this supply permanently?')) return;
  try {
    const response = await fetch(`/api/items/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Could not delete this supply.');
    }
    if (editingId === id) resetForm();
    await loadItems();
  } catch (error) { window.alert(error.message); }
}

cancelEdit.addEventListener('click', resetForm);
document.querySelector('#search-filter').addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadItems, 250);
});
document.querySelector('#category-filter').addEventListener('change', loadItems);

loadItems();
