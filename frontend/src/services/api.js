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

export const depositJointFund = async (vehicleId, data) => {
  const response = await axios.post(`${API_BASE_URL}/vehicles/${vehicleId}/deposit`, data);
  return response.data;
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const simulateOcr = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_BASE_URL}/auth/ocr-cccd`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const castVote = async (voteId, agree = true) => {
  const response = await axios.post(`${API_BASE_URL}/votes/${voteId}/cast?agree=${agree}`);
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

export const getPendingApprovalUsers = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/users/pending-approval`);
  return response.data;
};

export const approveUser = async (userId) => {
  const response = await axios.post(`${API_BASE_URL}/admin/users/${userId}/approve`);
  return response.data;
};

export const rejectUser = async (userId) => {
  const response = await axios.post(`${API_BASE_URL}/admin/users/${userId}/reject`);
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

// --------- SERVICES API ---------
export const getPendingServices = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/services/pending`);
  return response.data;
};

export const getCompletedServices = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/services/completed`);
  return response.data;
};

export const createServiceRecord = async (recordData) => {
  const response = await axios.post(`${API_BASE_URL}/admin/services`, recordData);
  return response.data;
};

export const startServiceRecord = async (id) => {
  const response = await axios.put(`${API_BASE_URL}/admin/services/${id}/start`);
  return response.data;
};

export const completeServiceRecord = async (id, actualCost) => {
  const response = await axios.put(`${API_BASE_URL}/admin/services/${id}/complete`, { actualCost });
  return response.data;
};

export const getServiceTemplates = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/services/templates`);
  return response.data;
};

export const createServiceTemplate = async (templateData) => {
  const response = await axios.post(`${API_BASE_URL}/admin/services/templates`, templateData);
  return response.data;
};

export const proposeServiceVote = async (vehicleId, data) => {
  const response = await axios.post(`${API_BASE_URL}/vehicles/${vehicleId}/votes/propose-service`, data);
  return response.data;
};

export const proposeLeaderVote = async (vehicleId, leaderId) => {
  const response = await axios.post(`${API_BASE_URL}/vehicles/${vehicleId}/votes/propose-leader`, { leaderId: leaderId.toString() });
  return response.data;
};

export const allocateShares = async (vehicleId, sharesData) => {
  const response = await axios.put(`${API_BASE_URL}/vehicles/${vehicleId}/allocate-shares`, sharesData);
  return response.data;
};

export const requestJoinVehicle = async (vehicleId) => {
  const response = await axios.post(`${API_BASE_URL}/vehicles/${vehicleId}/request-join`);
  return response.data;
};

export const approveJoinRequest = async (vehicleId, userId) => {
  const response = await axios.post(`${API_BASE_URL}/vehicles/${vehicleId}/approve-join/${userId}`);
  return response.data;
};

export const rejectJoinRequest = async (vehicleId, userId) => {
  const response = await axios.post(`${API_BASE_URL}/vehicles/${vehicleId}/reject-join/${userId}`);
  return response.data;
};

export const depositWallet = async (amount) => {
  const response = await axios.post(`${API_BASE_URL}/users/deposit-wallet`, { amount });
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

export const solveDispute = async (id, resolution, penaltyAmount, accusedUserId) => {
  const response = await axios.patch(`${API_BASE_URL}/admin/disputes/${id}/solve`, { 
    resolution,
    penaltyAmount,
    accusedUserId
  });
  return response.data;
};

export const checkoutVehicle = async (vehicleId, data) => {
  const response = await axios.post(`${API_BASE_URL}/admin/vehicles/${vehicleId}/checkout`, data);
  return response.data;
};

export const checkinVehicle = async (vehicleId, data) => {
  const response = await axios.post(`${API_BASE_URL}/admin/vehicles/${vehicleId}/checkin`, data);
  return response.data;
};

export const createDispute = async (data) => {
  const token = localStorage.getItem('evshare_jwt_token');
  const response = await axios.post(`${API_BASE_URL}/disputes`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getAdminCheckinLogs = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/checkin-logs`);
  return response.data;
};

export const getUserCheckinLogs = async () => {
  const response = await axios.get(`${API_BASE_URL}/checkin-logs`);
  return response.data;
};

export const getMyTransactions = async () => {
  const token = localStorage.getItem('evshare_jwt_token');
  const response = await axios.get(`${API_BASE_URL}/transactions/my-history`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getRevenueAnalytics = async () => {
  const token = localStorage.getItem('evshare_jwt_token');
  const response = await axios.get(`${API_BASE_URL}/admin/finance/analytics/revenue`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getVehicleAnalytics = async () => {
  const token = localStorage.getItem('evshare_jwt_token');
  const response = await axios.get(`${API_BASE_URL}/admin/finance/analytics/vehicles`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await axios.patch(`${API_BASE_URL}/users/profile`, data);
  return response.data;
};
