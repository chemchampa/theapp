import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';

const SelectOrganization = () => {
  const [organizations, setOrganizations] = useState([]);
  const [newOrgName, setNewOrgName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchOrganizations = async () => {
      const response = await api.get('/auth/organizations');
      setOrganizations(response.data);
    };
    fetchOrganizations();
  }, []);

  const handleSelectOrganization = async (organizationId) => {
    const token = new URLSearchParams(location.search).get('token');
    const decoded = JSON.parse(atob(token.split('.')[1]));
    
    await api.post('/auth/set-organization', {
      userId: decoded.userId,
      organizationId,
      tenantId: decoded.tenantId // Use the tenantId from the token
    });

    navigate('/dashboard');
  };

  const handleCreateOrganization = async () => {
    const response = await api.post('/auth/organizations', { name: newOrgName });
    handleSelectOrganization(response.data.id);
  };

  return (
    <div>
      <h2>Select or Create an Organization</h2>
      <ul>
        {organizations.map(org => (
          <li key={org.id}>
            <button onClick={() => handleSelectOrganization(org.id)}>{org.name}</button>
          </li>
        ))}
      </ul>
      <div>
        <input 
          type="text" 
          value={newOrgName} 
          onChange={(e) => setNewOrgName(e.target.value)} 
          placeholder="New Organization Name" 
        />
        <button onClick={handleCreateOrganization}>Create New Organization</button>
      </div>
    </div>
  );
};

export default SelectOrganization;
