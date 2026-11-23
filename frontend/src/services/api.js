const API_URL = `http://${window.location.hostname}:4000/api`;

export function authHeaders(extra = {}) {
  const token = localStorage.getItem('token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra
  };
}

export async function fetchClients() {
  const res = await fetch(`${API_URL}/clients`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error cargando clientes');
  return res.json();
}

export async function createClient(payload) {
  const res = await fetch(`${API_URL}/clients`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error creando cliente');
  return data;
}

export async function fetchClientFiles(clientId) {
  const res = await fetch(`${API_URL}/files/${clientId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error cargando archivos');
  return res.json();
}

export async function deleteClientFile(fileId) {
  const res = await fetch(`${API_URL}/files/${fileId}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Error eliminando archivo');
  return res.json();
}

export async function uploadBalanceFile(formData) {
  const res = await fetch(`${API_URL}/import`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error procesando archivo');
  return data;
}

export async function fetchClientYears(clientId) {
  const res = await fetch(`${API_URL}/reports/years/${clientId}`, { headers: authHeaders() });
  if (!res.ok) return { years: [2025, 2024] };
  return res.json();
}

export async function generateFinancialSummary(clientId, year) {
  const res = await fetch(`${API_URL}/reports/generate`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ clientId, year })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error calculando estados financieros');
  return data;
}

export async function downloadReportFile(endpoint, payload, defaultFilename) {
  const res = await fetch(`${API_URL}/reports/${endpoint}`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error descargando documento');
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = defaultFilename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
