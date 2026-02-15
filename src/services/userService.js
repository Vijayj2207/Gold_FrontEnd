const BASE_URL = "http://localhost:5000/api/users";

// Helper function to get token
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* ===========================
   REGISTER
=========================== */
export const registerUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });

  return await response.json();
};

/* ===========================
   LOGIN
=========================== */
export const loginUser = async (loginData) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(loginData)
  });

  const data = await response.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
};

/* ===========================
   GET ALL USERS (Protected)
=========================== */
export const getUsers = async () => {
  const response = await fetch(`${BASE_URL}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  });

  return await response.json();
};

/* ===========================
   GET USER BY ID
=========================== */
export const getUserById = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    headers: {
      ...getAuthHeader()
    }
  });

  return await response.json();
};

/* ===========================
   UPDATE USER
=========================== */
export const updateUser = async (id, userData) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    },
    body: JSON.stringify(userData)
  });

  return await response.json();
};

/* ===========================
   DELETE USER
=========================== */
export const deleteUser = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeader()
    }
  });

  return await response.json();
};
