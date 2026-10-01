const BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Request failed');
  }
  return data;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function registerUser(name, email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse(res);
}

// ─── Materials ───────────────────────────────────────────────────────────────
export async function getMaterials() {
  const res = await fetch(`${BASE_URL}/material`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function getMaterial(id) {
  const res = await fetch(`${BASE_URL}/material/${id}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createMaterial(data) {
  const res = await fetch(`${BASE_URL}/material/upload`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateMaterial(id, data) {
  const res = await fetch(`${BASE_URL}/material/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteMaterial(id) {
  const res = await fetch(`${BASE_URL}/material/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ─── AI – Summary ────────────────────────────────────────────────────────────
export async function getSummary(materialId) {
  const res = await fetch(`${BASE_URL}/ai/summary/${materialId}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function generateSummary(materialId) {
  const res = await fetch(`${BASE_URL}/ai/summary/${materialId}`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ─── AI – Flashcards ─────────────────────────────────────────────────────────
export async function getFlashcardsForMaterial(materialId) {
  const res = await fetch(`${BASE_URL}/ai/flashcards/${materialId}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function generateFlashcards(materialId) {
  const res = await fetch(`${BASE_URL}/ai/flashcards/${materialId}`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getAllFlashcards() {
  const res = await fetch(`${BASE_URL}/ai/flashcards`, { headers: authHeaders() });
  return handleResponse(res);
}

// ─── AI – Quiz ───────────────────────────────────────────────────────────────
export async function getQuizForMaterial(materialId) {
  const res = await fetch(`${BASE_URL}/ai/quiz/${materialId}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function generateQuiz(materialId) {
  const res = await fetch(`${BASE_URL}/ai/quiz/${materialId}`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getAllQuizzes() {
  const res = await fetch(`${BASE_URL}/ai/quizzes`, { headers: authHeaders() });
  return handleResponse(res);
}

// ─── AI – Study Plans ─────────────────────────────────────────────────────────
export async function getStudyPlans() {
  const res = await fetch(`${BASE_URL}/ai/study-plans`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function generateStudyPlan(data) {
  const res = await fetch(`${BASE_URL}/ai/study-plan`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
export async function getDashboardStats() {
  const res = await fetch(`${BASE_URL}/dashboard/stats`, { headers: authHeaders() });
  return handleResponse(res);
}
