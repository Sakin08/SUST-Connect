import axios from "./axios";

const electionsApi = {
  // Get all elections
  getAll: (params) => axios.get("/elections", { params }),

  // Get my eligible elections
  getMyElections: () => axios.get("/elections/my/eligible"),

  // Get election by ID
  getById: (id) => axios.get(`/elections/${id}`),

  // Get election results
  getResults: (electionId) => axios.get(`/elections/${electionId}/results`),

  // Cast vote
  castVote: (data) => axios.post("/elections/vote", data),

  // Admin: Create election
  create: (data) => axios.post("/elections", data),

  // Admin: Update election
  update: (id, data) => axios.put(`/elections/${id}`, data),

  // Admin: Delete election
  delete: (id) => axios.delete(`/elections/${id}`),

  // Admin: Add position
  addPosition: (electionId, data) =>
    axios.post(`/elections/${electionId}/positions`, data),

  // Admin: Add candidate
  addCandidate: (data) => axios.post("/elections/candidates", data),

  // Admin: Publish results
  publishResults: (electionId) =>
    axios.post(`/elections/${electionId}/publish-results`),
};

export default electionsApi;
