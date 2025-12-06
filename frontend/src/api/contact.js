import axios from "./axios";

export const submitContactForm = async (formData) => {
  const response = await axios.post("/contact", formData);
  return response.data;
};

export const getAllContacts = async (status) => {
  const params = status ? { status } : {};
  const response = await axios.get("/contact", { params });
  return response.data;
};

export const updateContactStatus = async (id, status) => {
  const response = await axios.patch(`/contact/${id}/status`, { status });
  return response.data;
};

export const deleteContact = async (id) => {
  const response = await axios.delete(`/contact/${id}`);
  return response.data;
};
