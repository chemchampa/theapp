import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/check');
      console.log('Auth check response:', response.data); // Add this line
      if (response.data.isAuthenticated) {
        console.log('Setting user:', response.data.user); // Add this line
        setUser(response.data.user);
      } else {
        console.log('User not authenticated, setting to null'); // Add this line
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed', error);
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    console.log('User state updated:', user); // Add this line
  }, [user]);

  const value = {
    user,
    setUser,
    loading,
    fetchUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

  
// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // For testing
//   useEffect(() => {
//     console.log('User state updated:', user);
//   }, [user]);

//   useEffect(() => {
    
//     const checkAuth = async () => {
//       try {
//         const response = await api.get('/auth/check');
//         if (response.data.isAuthenticated) {
//           setUser(response.data.user);
//         }
//       } catch (error) {
//         console.error('Auth check failed', error);
//       }
//       setLoading(false);
//     };
//     checkAuth();
//   }, []);

//   return (
//     <UserContext.Provider value={{ user, setUser, loading }}>
//       {children}
//     </UserContext.Provider>
//   );
// };
