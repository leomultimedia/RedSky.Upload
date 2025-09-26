export const apiBase = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL.replace(/\/$/, '')}`
  : 'http://localhost:5034/api';

const apiKey = process.env.REACT_APP_API_KEY || "dev-secret-change-me";
const baseHeaders: HeadersInit = { 
  'X-API-KEY': apiKey 
};

export async function apiUpload(file: File) {
  const form = new FormData();
  form.append('file', file);
  //var apiBase1="http://localhost:5034/api";
  const res = await fetch(`${apiBase}/upload`, {
    method: 'POST',
    body: form,
    headers: baseHeaders,
    credentials: 'include'
  });
  console.log(res);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Upload failed: ${res.status}`);
  }
  return res.json();
}

export async function apiGet(path: string) {
  const res = await fetch(`${apiBase}${path}`, {
    headers: baseHeaders,
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function apiPost(path: string, data: any) {
  const res = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: {
      ...baseHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(errorData || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function apiPut(path: string, data: any) {
  const res = await fetch(`${apiBase}${path}`, {
    method: 'PUT',
    headers: {
      ...baseHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(errorData || `Request failed: ${res.status}`);
  }
  return res.ok;
}

export async function apiDelete(path: string) {
  const res = await fetch(`${apiBase}${path}`, {
    method: 'DELETE',
    headers: baseHeaders,
    credentials: 'include',
  });
  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(errorData || `Request failed: ${res.status}`);
  }
  return res.ok;
}

// Add this test function for direct backend calls
export async function testBackendConnection() {
  const res = await fetch(`${apiBase}/upload`, {
    method: 'OPTIONS',
    headers: baseHeaders
  });
  return res.status === 204;
}

// Default export
const api = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
  upload: apiUpload,
  testConnection: testBackendConnection
};

export default api;