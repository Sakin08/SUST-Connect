import axios from "./axios";

const pollsApi = {
  // Get all polls
  getAll: (params) => axios.get("/polls", { params }),

  // Get single poll
  getById: (id) => axios.get(`/polls/${id}`),

  // Create poll
  create: (data) => axios.post("/polls", data),

  // Submit vote
  vote: (pollId, data) => axios.post(`/polls/${pollId}/vote`, data),

  // Get results
  getResults: (id) => axios.get(`/polls/${id}/results`),

  // Update poll
  update: (id, data) => axios.put(`/polls/${id}`, data),

  // Delete poll
  remove: (id) => axios.delete(`/polls/${id}`),

  // Get voter details (super admin only)
  getVoters: (pollId) => axios.get(`/polls/${pollId}/voters`),
};

export default pollsApi;
