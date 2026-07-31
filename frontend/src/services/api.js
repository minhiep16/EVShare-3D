import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const getDashboardData = async (userId) => {
  const url = userId ? `${API_BASE_URL}/dashboard?userId=${userId}` : `${API_BASE_URL}/dashboard`;
  const response = await axios.get(url);
  return response.data;
};

export const createBooking = async (bookingRequest) => {
  const response = await axios.post(`${API_BASE_URL}/bookings`, bookingRequest);
  return response.data;
};

export const castVote = async (voteId) => {
  const response = await axios.post(`${API_BASE_URL}/votes/${voteId}/cast`);
  return response.data;
};

export const login = async (username, password) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
  return response.data;
};

export const register = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
  return response.data;
};
