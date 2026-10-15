// api.js: the only file that talks to the server. Each function = one REST call.

async function apiGetSocks(search) {
  const url = search ? `/api/socks?search=${encodeURIComponent(search)}` : '/api/socks';
  const response = await fetch(url);
  return response.json();
}

async function apiCreateSock(sock) {
  const response = await fetch('/api/socks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sock),
  });
  return response.json();
}

async function apiUpdateSock(id, sock) {
  const response = await fetch(`/api/socks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sock),
  });
  return response.json();
}

async function apiAddNote(id, text) {
  const response = await fetch(`/api/socks/${id}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return response.json();
}

async function apiDeleteSock(id) {
  const response = await fetch(`/api/socks/${id}`, { method: 'DELETE' });
  return response.json();
}