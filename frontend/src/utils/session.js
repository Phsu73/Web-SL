export function getCurrentTeam() {
  const teamId = localStorage.getItem("team_id");
  const loginTime = localStorage.getItem("login_time");
  const expiresAt = localStorage.getItem("expires_at");
  const gameStartTime = localStorage.getItem("game_start_time");

  if (!teamId || !loginTime || !expiresAt) return null;

  // Check if session has expired
  if (new Date() > new Date(expiresAt)) {
    logout();
    return null;
  }

  return { teamId, loginTime, expiresAt, gameStartTime };
}

export function logout() {
  localStorage.removeItem("team_id");
  localStorage.removeItem("team_name");
  localStorage.removeItem("login_time");
  localStorage.removeItem("expires_at");
  localStorage.removeItem("user_role");
}

export function getRemainingTime() {
  const gameStartTime = localStorage.getItem("game_start_time");
  const expiresAt = localStorage.getItem("expires_at");

  if (gameStartTime) {
    const start = new Date(gameStartTime);
    const now = new Date();
    const elapsed = now - start;
    const totalMs = 3 * 60 * 60 * 1000;
    return Math.max(0, Math.floor((totalMs - elapsed) / 1000));
  }
  
  if (!expiresAt) return 0;
  
  const now = new Date();
  const expiry = new Date(expiresAt);
  const remaining = expiry - now;
  
  return Math.max(0, Math.floor(remaining / 1000)); // seconds
}