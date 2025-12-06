import api from "./axios";

const electionRequestsApi = {
  create: (data) => api.post("/election-requests", data),
  getAll: (params) => api.get("/election-requests", { params }),
  getMy: () => api.get("/election-requests/my"),
  getMyRequests: () => api.get("/election-requests/my"),
  getById: (id) => api.get(`/election-requests/${id}`),
  updateStatus: (id, data) => api.put(`/election-requests/${id}/status`, data),
  approve: (id) => api.post(`/election-requests/${id}/approve`),
  reject: (id, data) => api.post(`/election-requests/${id}/reject`, data),
  delete: (id) => api.delete(`/election-requests/${id}`),
};

export default electionRequestsApi;
