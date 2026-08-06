import { logout } from './session.js';

export async function apiRequest(url, options = {}) {
  const teamId = localStorage.getItem("team_id");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'X-Team-ID': teamId
    }
  });

  if (response.status === 401) {
    // Session expired
    logout();
    window.location.href = '/login';
    return;
  }

  return response;
}