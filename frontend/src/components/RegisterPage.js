import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    organizationName: '',
    tenantId: '' // Assuming you need this
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/register', formData);
      console.log('Registration successful', response.data);
      navigate('/login');
    } catch (error) {
      console.error('Registration failed', error.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" value={formData.username} onChange={handleChange} placeholder="Username" required />
      <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
      <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
      <input name="organizationName" value={formData.organizationName} onChange={handleChange} placeholder="Organization Name" required />
      <input name="tenantId" value={formData.tenantId} onChange={handleChange} placeholder="Tenant ID" required />
      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterPage;
