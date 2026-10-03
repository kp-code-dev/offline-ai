const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const generateTextStream = async (prompt) => {
  const response = await fetch(`${API_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate response');
  }

  return response.body;
};
