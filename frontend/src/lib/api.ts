export const apiBase = '/api';

export async function apiUpload(file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${apiBase}/upload`, {
    method: 'POST',
    body: form
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

export async function apiGet(path: string) {
  const res = await fetch(`${apiBase}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}
