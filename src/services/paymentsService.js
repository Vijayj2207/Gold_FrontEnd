import axios from "axios";

const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/payments";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllPayments = async () => {
  const res = await axios.get(API_URL, { headers: getAuthHeader() });
  return res.data;
};

export const createPayment = async (data) => {
  const res = await axios.post(API_URL, data, { headers: getAuthHeader() });
  return res.data;
};

export const getPaymentsByCustomer = async (customerId) => {
  const res = await axios.get(`${API_URL}/customer/${customerId}`, {
    headers: getAuthHeader(),
  });
  return res.data;
};

export const getPaymentsByDeposit = async (depositId) => {
  const res = await axios.get(`${API_URL}/deposit/${depositId}`, {
    headers: getAuthHeader(),
  });
  return res.data;
};

export const deletePayment = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeader(),
  });
  return res.data;
};

export const getPaymentStats = async () => {
  const res = await axios.get(`${API_URL}/stats`, { headers: getAuthHeader() });
  return res.data;
};
