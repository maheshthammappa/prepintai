// ─────────────────────────────────────────────────────────────────────────────
// services/api.js — THE COMMUNICATION BRIDGE (FRONTEND <-> BACKEND)
//
// PURPOSE:
//   This is the ONLY file in the entire React frontend that makes HTTP requests.
//   Instead of scattering `fetch()` or `axios()` calls across 20 different
//   components, all communication flows through these centralized functions.
//
// DATA FLOW & ARCHITECTURE:
//   1. The Component needs data:
//      A React component (e.g., `StandardInterviewComponent.jsx`) needs to generate
//      interview questions. It imports and calls `generateQuestions('Java', ...)`.
//
//   2. The Interceptor adds Security:
//      Before the request leaves the browser, the `apiClient.interceptors` block
//      below intercepts it. It looks in `localStorage` for a JWT Auth Token.
//      If it finds one, it attaches it to the headers (Authorization: Bearer <token>).
//      This guarantees that the backend knows EXACTLY who is making the request.
//
//   3. The Network Request:
//      Axios sends the POST request to the backend API (`http://localhost:8080/api/...`).
//
//   4. The Response:
//      The backend processes the request and sends back JSON. This file extracts
//      `response.data` and returns it directly to the React component.
//      The React component then updates its local state to display the data.
// ─────────────────────────────────────────────────────────────────────────────
import axios from 'axios';

// Base URL comes from the .env file (VITE_API_URL). Falls back to localhost for dev.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create a pre-configured axios instance. All functions below use this instead
// of raw axios so they share the same base URL and default headers.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── INTERCEPTOR ────────────────────────────────────────────────────────────
// This runs automatically BEFORE every single request is sent.
// It reads the JWT token from localStorage and adds it as an Authorization
// header so the Spring Boot backend knows who is making the request.
// If no token exists (user not logged in), the header is simply omitted.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── INTERVIEW API FUNCTIONS ─────────────────────────────────────────────────

/**
 * Request Gemini to generate interview questions.
 */
export const generateQuestions = async (topic, experienceLevel, questionCount) => {
  const response = await apiClient.post('/api/interview/generate', {
    topic,
    experienceLevel,
    questionCount,
  });
  return response.data;
};

/**
 * Submit candidate answers to backend for Gemini evaluation.
 */
export const evaluateInterview = async (topic, experienceLevel, answers) => {
  const response = await apiClient.post('/api/interview/evaluate', {
    topic,
    experienceLevel,
    answers,
  });
  return response.data;
};

/**
 * Fetch the list of past mock interview sessions.
 */
export const getHistory = async () => {
  const response = await apiClient.get('/api/interview/history');
  return response.data;
};

/**
 * Fetch details of a specific past mock interview session.
 */
export const getHistoryDetail = async (id) => {
  const response = await apiClient.get(`/api/interview/history/${id}`);
  return response.data;
};

/**
 * Request Gemini to generate interview questions based on a resume.
 * Uses multipart/form-data because a PDF file is included in the request.
 */
export const generateQuestionsFromResume = async (formData) => {
  const response = await apiClient.post('/api/interview/generate-from-resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Quick Q&A - Ask a doubt without saving to history.
 */
export const askDoubt = async (question) => {
  const response = await apiClient.post('/api/interview/ask-doubt', { question });
  return response.data;
};

// ── AUTH API FUNCTIONS ──────────────────────────────────────────────────────

export const login = async (username, password) => {
  const response = await apiClient.post('/api/auth/login', { username, password });
  return response.data;
};

export const register = async (username, email, password) => {
  const response = await apiClient.post('/api/auth/register', { username, email, password });
  return response.data;
};

// Called on page load to verify the stored JWT is still valid
// and to retrieve the current user's profile data.
export const getMe = async () => {
  const response = await apiClient.get('/api/auth/me');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await apiClient.put('/api/auth/profile', profileData);
  return response.data;
};

// Export the raw client as default so components can use it for one-off requests
export default apiClient;