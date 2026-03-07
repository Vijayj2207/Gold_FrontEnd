const BASE_URL = import.meta.env.VITE_API_URL + "/api";

export const getCurrentGoldRate = async () => {
  try {
    const response = await fetch(`${BASE_URL}/gold-rate/current`);
    if (!response.ok) throw new Error(`Failed to fetch current gold rate: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('getCurrentGoldRate error:', error);
    throw error;
  }
};

export const getGoldRateHistory = async (days = 30) => {
  try {
    const response = await fetch(`${BASE_URL}/gold-rate/history?days=${days}`);
    if (!response.ok) throw new Error(`Failed to fetch gold rate history: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('getGoldRateHistory error:', error);
    throw error;
  }
};

export const setGoldRate = async (date, rate) => {
  try {
    const response = await fetch(`${BASE_URL}/gold-rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date, rate })
    });
    if (!response.ok) throw new Error(`Failed to set gold rate: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('setGoldRate error:', error);
    throw error;
  }
};

export const forceRefreshGoldRate = async () => {
  try {
    const response = await fetch(`${BASE_URL}/gold-rate/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) throw new Error(`Failed to refresh gold rate: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('forceRefreshGoldRate error:', error);
    throw error;
  }
};