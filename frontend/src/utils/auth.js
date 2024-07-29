import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true
});

export const isAuthenticated = async () => {
  try {
    const response = await api.get('/auth/check');
    return response.data.isAuthenticated;
  } catch (error) {
    return false;
  }
};



export const logout = async () => {
  try {
    await api.post('/auth/logout');
    // Optionally, you can redirect to the login page or update the app state here
  } catch (error) {
    console.error('Logout failed', error);
  }
};

export default api;



/////////////////////////////////////////////////////////

/*
  This below is a solution that uses local storage to store JWT token.
  It's not as secure as HttpOnly cookies, therefore I'm not using this method anymore.
  We no longer need functions to set, get, or remove tokens from localStorage.
  However, we still need some utility functions for authentication-related tasks on the frontend.
  This is a reducndant part - using it to illustrate the alternative, less secure method - for learning purposes.

*/

// export const setToken = (token) => {
//     localStorage.setItem('token', token);
//   };
  
// export const getToken = () => {
//   return localStorage.getItem('token');
// };

// export const removeToken = () => {
//   localStorage.removeItem('token');
// };

// export const logout = () => {
//   removeToken();
//   // Optionally, redirect to login page
//   window.location.href = '/login';
// };