const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/deposits";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllDeposits = async () => {
  const res = await fetch(`${BASE_URL}`, {
    headers: { ...getAuthHeader() }
  });
  return await res.json();
};

export const createDeposit = async (data) => {
  const res = await fetch(`${BASE_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(data)
  });
  return await res.json();
};

export const getDepositById = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    headers: { ...getAuthHeader() }
  });
  return await res.json();
};

export const getDepositsByCustomer = async (customerId) => {
  const res = await fetch(`${BASE_URL}/customer/${customerId}`, {
    headers: { ...getAuthHeader() }
  });
  return await res.json();
};

export const deleteDeposit = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeader() }
  });
  return await res.json();
};

export const getDepositStats = async () => {
  const res = await fetch(`${BASE_URL}/stats`, {
    headers: { ...getAuthHeader() }
  });
  return await res.json();
};