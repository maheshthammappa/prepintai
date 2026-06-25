import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
 */
export const generateQuestionsFromResume = async (formData) => {
  const response = await apiClient.post('/api/interview/generate-from-resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const login = async (username, password) => {
  const response = await apiClient.post('/api/auth/login', { username, password });
  return response.data;
};

export const register = async (username, email, password) => {
  const response = await apiClient.post('/api/auth/register', { username, email, password });
  return response.data;
};

export const getMe = async () => {
  const response = await apiClient.get('/api/auth/me');
  return response.data;
};

export default apiClient;