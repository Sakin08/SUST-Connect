import axios from "./axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const getBookRequests = async (params = {}) => {
  const response = await axios.get(`${API_URL}/book-requests`, { params });
  return response.data;
};

export const getBookRequest = async (id) => {
  const response = await axios.get(`${API_URL}/book-requests/${id}`);
  return response.data;
};

export const createBookRequest = async (formData) => {
  const response = await axios.post(`${API_URL}/book-requests`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateBookRequest = async (id, data) => {
  const response = await axios.put(`${API_URL}/book-requests/${id}`, data);
  return response.data;
};

export const updateBookRequestStatus = async (id, status) => {
  const response = await axios.patch(`${API_URL}/book-requests/${id}/status`, {
    status,
  });
  return response.data;
};

export const deleteBookRequest = async (id) => {
  const response = await axios.delete(`${API_URL}/book-requests/${id}`);
  return response.data;
};

export const addResponse = async (id, data) => {
  const response = await axios.post(
    `${API_URL}/book-requests/${id}/responses`,
    data
  );
  return response.data;
};

export const deleteResponse = async (id, responseId) => {
  const response = await axios.delete(
    `${API_URL}/book-requests/${id}/responses/${responseId}`
  );
  return response.data;
};

export const getUserBookRequests = async (userId) => {
  const response = await axios.get(`${API_URL}/book-requests/user/${userId}`);
  return response.data;
};
