import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { UserContext } from '../contexts/UserContext';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [spreadsheetMappings, setSpreadsheetMappings] = useState({});
  const { user } = useContext(UserContext);

  console.log('User in AdminPanel:', user); // Add this line for debugging

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const usersResponse = await api.get('/admin/users');
      setUsers(usersResponse.data);
      const orgsResponse = await api.get('/admin/organizations');
      setOrganizations(orgsResponse.data);
      const mappingsResponse = await api.get('/admin/spreadsheet-mappings');
      setSpreadsheetMappings(mappingsResponse.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  // const assignSpreadsheet = async (organizationId, spreadsheetType, spreadsheetId) => {
  //   try {
  //     await api.post('/admin/assign-spreadsheet', { organizationId, spreadsheetType, spreadsheetId });
  //     fetchData();
  //   } catch (error) {
  //     console.error('Error assigning spreadsheet:', error);
  //   }
  // };

  const handleSpreadsheetIdChange = (organizationId, spreadsheetType, value) => {
    setSpreadsheetMappings(prevMappings => ({
      ...prevMappings,
      [organizationId]: {
        ...prevMappings[organizationId],
        [spreadsheetType]: value
      }
    }));
  };

  const saveSpreadsheetMappings = async (organizationId) => {
    try {
      await api.post('/admin/save-spreadsheet-mappings', {
        organizationId,
        mappings: spreadsheetMappings[organizationId]
      });
      alert('Spreadsheet mappings saved successfully');
      fetchData(); // Refresh data after saving
    } catch (error) {
      console.error('Error saving spreadsheet mappings:', error);
      alert('Error saving spreadsheet mappings');
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/user-role/${userId}`, { role: newRole });
      fetchData(); // Refresh data after role update
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  if (!user || user.role !== 'admin') {
    return <div>Access Denied. Admin privileges required.</div>;
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      <h2>Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.username} - {user.email} - Role: {user.role}
            <select onChange={(e) => updateUserRole(user.id, e.target.value)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </li>
        ))}
      </ul>
      <h2>Organizations</h2>
      {organizations.map(org => (
        <div key={org.id}>
          <h3>{org.name}</h3>
          {['SETTINGS', 'ORDERS', 'WHOLESALE_CUSTOMERS', 'RETAIL_INVENTORY', 'COFFEE_PRICES'].map(type => (
            <div key={type}>
              <label>{type}:</label>
              <input 
                type="text"
                value={spreadsheetMappings[org.id]?.[type] || ''}
                onChange={(e) => handleSpreadsheetIdChange(org.id, type, e.target.value)}
                placeholder="Enter Spreadsheet ID"
              />
            </div>
          ))}
          <button onClick={() => saveSpreadsheetMappings(org.id)}>Save Spreadsheet Mappings</button>
        </div>
      ))}
    </div>
  );
};

export default AdminPanel;








// const AdminPanel = () => {
//   const [users, setUsers] = useState([]);
//   const [organizations, setOrganizations] = useState([]);
//   const [spreadsheets, setSpreadsheets] = useState([]);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       const usersResponse = await api.get('/admin/users');
//       setUsers(usersResponse.data);
//       const orgsResponse = await api.get('/admin/organizations');
//       setOrganizations(orgsResponse.data);
//       const spreadsheetsResponse = await api.get('/admin/spreadsheets');
//       setSpreadsheets(spreadsheetsResponse.data);
//     } catch (error) {
//       console.error('Error fetching admin data:', error);
//     }
//   };

//   const assignSpreadsheet = async (userId, spreadsheetId) => {
//     try {
//       await api.post('/admin/assign-spreadsheet', { userId, spreadsheetId });
//       fetchData(); // Refresh data after assignment
//     } catch (error) {
//       console.error('Error assigning spreadsheet:', error);
//     }
//   };

  // const updateUserRole = async (userId, newRole) => {
  //   try {
  //     await api.put(`/admin/user-role/${userId}`, { role: newRole });
  //     fetchData(); // Refresh data after role update
  //   } catch (error) {
  //     console.error('Error updating user role:', error);
  //   }
  // };

//   return (
//     <div>
//       <h1>Admin Panel</h1>
//       <h2>Users</h2>
//       <ul>
//         {users.map(user => (
//           <li key={user.id}>
//             {user.username} - {user.email} - Role: {user.role}
//             <select onChange={(e) => updateUserRole(user.id, e.target.value)}>
//               <option value="user">User</option>
//               <option value="admin">Admin</option>
//             </select>
//           </li>
//         ))}
//       </ul>
//       <h2>Organizations</h2>
//       <ul>
//         {organizations.map(org => (
//           <li key={org.id}>{org.name}</li>
//         ))}
//       </ul>
//       <h2>Assign Spreadsheets</h2>
//       {users.map(user => (
//         <div key={user.id}>
//           <p>{user.username}</p>
//           <select onChange={(e) => assignSpreadsheet(user.id, e.target.value)}>
//             <option value="">Select a spreadsheet</option>
//             {spreadsheets.map(sheet => (
//               <option key={sheet.id} value={sheet.id}>{sheet.name}</option>
//             ))}
//           </select>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default AdminPanel;
