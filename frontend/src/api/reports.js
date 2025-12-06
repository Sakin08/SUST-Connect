import axios from "./axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const createReport = async (reportData) => {
  const response = await axios.post(`${API_URL}/reports`, reportData, {
    withCredentials: true,
  });
  return response.data;
};

export const getMyReports = async () => {
  const response = await axios.get(`${API_URL}/reports/my-reports`, {
    withCredentials: true,
  });
  return response.data;
};

export const getAllReports = async () => {
  const response = await axios.get(`${API_URL}/reports/all`, {
    withCredentials: true,
  });
  return response.data;
};

export const updateReportStatus = async (reportId, statusData) => {
  const response = await axios.patch(
    `${API_URL}/reports/${reportId}/status`,
    statusData,
    {
      withCredentials: true,
    }
  );
  return response.data;
};
