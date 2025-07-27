const API_URL = import.meta.env.VITE_API_URL;

export const getStudents = async () => {
  const response = await fetch(`${API_URL}/students`, {
    credentials: 'include',
  });
  return await response.json();
};

export const addStudent = async (student) => {
  const response = await fetch(`${API_URL}/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(student),
    credentials: 'include',
  });
  return await response.json();
};
