import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { UserContext } from '../contexts/UserContext';

const Dashboard = () => {
  const { user, fetchUser } = useContext(UserContext);
  const navigate = useNavigate();
  console.log('Dashboard rendering, user data:', user);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      fetchUser(); // This will update the user state to null if logout is successful
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {user && (
        <div>
          <p>This is a protected route</p>
          <p>User: {user.email}</p>
          <p>Email: {user.email}</p>
          <p>Tenant ID: {user.tenantId || user.tenant_id}</p>
          <p>Organization ID: {user.organizationId || user.organization_id}</p>
          <p>User Role: {user.role || 'No role assigned'}</p>
        </div>
      )}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};


// const Dashboard = () => {
//   const [data, setData] = useState(null);
//   const navigate = useNavigate();
//   const { user, setUser } = useContext(UserContext);
//   console.log('Dashboard rendering, user data:', user);

//   useEffect(() => {
//     const fetchProtectedData = async () => {
//       try {
//         const response = await api.get('/api/protected');
//         setData(response.data);
//         if (response.data.user) {
//           setUser(response.data.user);
//         }
//       } catch (error) {
//         console.error('Error fetching protected data:', error);
//       }
//     };

//     fetchProtectedData();
//   }, [setUser]);

//   const handleLogout = async () => {
//     try {
//       await api.post('/auth/logout');
//       setUser(null);
//       navigate('/login');
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   };

//   return (
//     <div>
//       <h1>Dashboard</h1>
//       {(data && data.user) || user ? (
//         <div>
//           <p>This is a protected route</p>
//           <p>User: {(data && data.user && data.user.email) || (user && user.email)}</p>
//           <p>Email: {(data && data.user && data.user.email) || (user && user.email)}</p>
//           <p>Tenant ID: {(data && data.user && (data.user.tenantId || data.user.tenant_id)) || (user && (user.tenantId || user.tenant_id))}</p>
//           <p>Organization ID: {(data && data.user && (data.user.organizationId || data.user.organization_id)) || (user && (user.organizationId || user.organization_id))}</p>
//           <p>User Role: {(data && data.user && data.user.role) || (user && user.role)}</p>

//           <p>Current Role: {user?.role || 'No role assigned'}</p>

//         </div>
//       ) : null}
//       <button onClick={handleLogout}>Logout</button>
//     </div>
//   );
// };

export default Dashboard;
