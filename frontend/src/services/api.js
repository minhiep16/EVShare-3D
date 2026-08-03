import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('evshare_jwt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getDashboardData = async () => {
  const response = await axios.get(`${API_BASE_URL}/dashboard`);
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

// Admin Endpoints
export const getUnassignedUsers = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/users/unassigned`);
  return response.data;
};

export const getAllVehicles = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/vehicles`);
  return response.data;
};

export const getVehicleGroups = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/vehicle-groups`);
  return response.data;
};

export const addMemberToVehicle = async (vehicleId, userId, ownershipPercentage) => {
  const response = await axios.post(`${API_BASE_URL}/admin/vehicles/${vehicleId}/add-member`, {
    userId,
    ownershipPercentage
  });
  return response.data;
};

export const downloadContract = async () => {
  const response = await axios.get(`${API_BASE_URL}/contracts/download`, {
    responseType: 'blob'
  });
  return response.data;
};

export const createVehicle = async (vehicleData) => {
  const response = await axios.post(`${API_BASE_URL}/admin/vehicles`, vehicleData);
  return response.data;
};

export const getFinanceSummary = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/finance/summary`);
  return response.data;
};

export const getPendingServices = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/services/pending`);
  return response.data;
};

export const getCompletedServices = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/services/completed`);
  return response.data;
};

export const getAdminDisputes = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/disputes`);
  return response.data;
};

export const getVehicleTransactions = async (vehicleId) => {
  const response = await axios.get(`${API_BASE_URL}/vehicles/${vehicleId}/transactions`);
  return response.data;
};

export const solveDispute = async (id, resolution) => {
  const response = await axios.patch(`${API_BASE_URL}/admin/disputes/${id}/solve`, { resolution });
  return response.data;
};
