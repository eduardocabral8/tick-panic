import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function login(username: string, password: string): Promise<{ token: string }> {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
}

export async function register(username: string, password: string, role: 'admin' | 'player'): Promise<{ id: string }> {
  const response = await api.post('/auth/register', { username, password, role });
  return response.data;
}

export async function createGame(hostName: string): Promise<{ id: string; status: string; players: unknown[] }> {
  const response = await api.post('/games', { hostName });
  return response.data;
}

export async function joinGame(gameId: string, playerName: string): Promise<{ id: string; status: string; players: unknown[] }> {
  const response = await api.post(`/games/${gameId}/join`, { playerName });
  return response.data;
}

export async function startGame(gameId: string, hostPlayerId: string): Promise<{ id: string; status: string }> {
  const response = await api.post(`/games/${gameId}/start`, { hostPlayerId });
  return response.data;
}

export async function endGame(gameId: string): Promise<unknown> {
  const response = await api.post(`/games/${gameId}/end`);
  return response.data;
}

export async function getGame(gameId: string): Promise<unknown> {
  const response = await api.get(`/games/${gameId}`);
  return response.data;
}

export async function startTurn(gameId: string): Promise<{ id: string; status: string; timeLimit: number }> {
  const response = await api.post(`/turns/${gameId}/start`);
  return response.data;
}

export async function submitAnswer(turnId: string, text: string, playerId: string): Promise<{ id: string; text: string; turnId: string }> {
  const response = await api.post(`/turns/${turnId}/answers`, { text, playerId });
  return response.data;
}

export async function finishTurn(turnId: string): Promise<unknown> {
  const response = await api.post(`/turns/${turnId}/finish`);
  return response.data;
}

export async function nextTurn(gameId: string): Promise<unknown> {
  const response = await api.post(`/turns/${gameId}/next`);
  return response.data;
}

export async function getCategories(): Promise<unknown[]> {
  const response = await api.get('/categories');
  return response.data;
}

export async function addCategory(name: string, examples?: string[]): Promise<unknown> {
  const response = await api.post('/categories', { name, examples });
  return response.data;
}

export async function validateAnswer(turnId: string, answerId: string, isValid: boolean, playerId: string): Promise<{ id: string; isValid: boolean }> {
  const response = await api.post(`/turns/${turnId}/answers/${answerId}/validate`, { isValid, playerId });
  return response.data;
}

export async function restartGame(gameId: string): Promise<{ id: string; status: string; players: unknown[] }> {
  const response = await api.post(`/games/${gameId}/restart`);
  return response.data;
}

export default api;
