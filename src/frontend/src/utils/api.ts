// In dev: Vite proxies /api → localhost:3001 (see vite.config.js server.proxy)
// In production: Express serves both the static files AND /api on the same port
const BASE_URL = "/api";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("knot_jwt_token") || localStorage.getItem("knot_auth_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || response.statusText);
  }
  return response.json();
}

export const api = {
  // users.js
  getAllUsers: (all?: boolean) => fetchWithAuth(`/users${all ? '?all=true' : ''}`),
  getWorkerStats: (id: number) => fetchWithAuth(`/users/stats/${id}`),
  searchUsers: (query: string) => fetchWithAuth(`/users/search?q=${encodeURIComponent(query)}`),
  getUsersBySkill: (skill: string) => fetchWithAuth(`/users/skill/${encodeURIComponent(skill)}`),
  getUsersByDistance: (maxKm: number) => fetchWithAuth(`/users/distance/${maxKm}`),
  findUserByName: (name: string) => fetchWithAuth(`/users/find-by-name/${encodeURIComponent(name)}`),
  findWorkerByName: (name: string) => fetchWithAuth(`/users/find-by-name/${encodeURIComponent(name)}`),
  loginWorker: (data: any) => fetchWithAuth(`/users/login`, { method: "POST", body: JSON.stringify(data) }),
  registerWorker: (data: any) => fetchWithAuth(`/users/register`, { method: "POST", body: JSON.stringify(data) }),
  
  // citizens.js
  getAllCitizens: () => fetchWithAuth(`/citizens`),
  getCitizenStats: (id: number) => fetchWithAuth(`/citizens/stats/${id}`),
  registerCitizen: (name: string, address: string, username: string, passwordHash: string) => 
    fetchWithAuth(`/citizens/register`, { method: "POST", body: JSON.stringify({ name, address, username, passwordHash }) }),
  loginCitizen: (username: string, passwordHash: string) => 
    fetchWithAuth(`/citizens/login`, { method: "POST", body: JSON.stringify({ username, passwordHash }) }),
  findCitizenByName: (name: string) => 
    fetchWithAuth(`/citizens/find-by-name/${encodeURIComponent(name)}`),
  
  // learning.js
  getLearningRequests: () => fetchWithAuth(`/learning-requests`),
  getLearningRequestsForWorker: (workerId: number) => fetchWithAuth(`/learning-requests/worker/${workerId}`),
  createLearningRequest: (data: any) => fetchWithAuth(`/learning-requests`, { method: "POST", body: JSON.stringify(data) }),
  
  // certification.js
  getPendingPracticalVideos: () => fetchWithAuth(`/certification/practical-pending`),
  approvePracticalVideo: (id: number) => fetchWithAuth(`/certification/approve/${id}`, { method: "POST" }),
  rejectPracticalVideo: (id: number) => fetchWithAuth(`/certification/reject/${id}`, { method: "POST" }),
  getCertification: (workerId: number) => fetchWithAuth(`/certification/${workerId}`),
  // Both names supported — WorkerDashboardPage uses getPracticalVideoStatus
  getPracticalVideoStatus: async (workerId: number): Promise<string> => {
    const res = await fetchWithAuth(`/certification/practical-status/${workerId}`);
    return res.status ?? 'none';
  },
  getPracticalStatus: async (workerId: number): Promise<string> => {
    const res = await fetchWithAuth(`/certification/practical-status/${workerId}`);
    return res.status ?? 'none';
  },
  submitPracticalVideo: (workerId: number, workerName: string, skill: string, videoDataURI: string) => 
    fetchWithAuth(`/certification/submit-practical`, { method: "POST", body: JSON.stringify({ workerId, workerName, skill, videoDataURI }) }),
  
  // videos.js
  saveWorkerVideo: (workerId: number, base64Data: string) => fetchWithAuth(`/videos/upload`, { method: "POST", body: JSON.stringify({ workerId, dataURI: base64Data }) }),
  getWorkerVideo: (workerId: number) => fetchWithAuth(`/videos/${workerId}`),
  getVideoStreamUrl: (workerId: number) => `${BASE_URL}/videos/stream/${workerId}`,
  
  // admin.js
  getAdminStats: () => fetchWithAuth(`/admin/stats`),
  clearAllData: () => fetchWithAuth(`/admin/clear`, { method: "POST" }),
  deleteUser: (id: number) => fetchWithAuth(`/users/${id}`, { method: "DELETE" }),
  deleteCitizen: (id: number) => fetchWithAuth(`/citizens/${id}`, { method: "DELETE" }),
  loginAdmin: (username: string, passwordHash: string) => fetchWithAuth(`/admin/login`, { method: "POST", body: JSON.stringify({ username, passwordHash }) }),

  // notifications.js
  getNotifications: (userId: string | number) => fetchWithAuth(`/notifications/${userId}`),
  getNotificationStreamUrl: (userId: string | number) => `${BASE_URL}/notifications/stream/${userId}`,
  markNotificationsRead: (userId: string | number) => fetchWithAuth(`/notifications/${userId}/read`, { method: "POST" }),
  clearNotifications: (userId: string | number) => fetchWithAuth(`/notifications/${userId}/clear`, { method: "POST" }),
};
