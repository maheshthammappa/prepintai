import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export default apiClient;