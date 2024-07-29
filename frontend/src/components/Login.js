import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { UserContext } from '../contexts/UserContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { fetchUser } = useContext(UserContext);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login form submitted');
    try {
      console.log('Sending login request');
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response from server:', response.data);
      
      if (response.status >= 200 && response.status < 300) {
        console.log('User data received:', response.data.user);
        // Fetch updated user data after successful login
        await fetchUser();
        navigate('/dashboard');
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Response:', error.response);
      console.error('Request:', error.request);
      alert(error.response?.data?.message || 'An error occurred during login');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
      <Link to="/register">Don't have an account? Register here</Link>
      <button onClick={handleGoogleLogin}>Sign in with Google</button>
    </form>
  );
};

export default Login;
