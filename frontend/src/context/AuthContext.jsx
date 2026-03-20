import React, { createContext, useContext, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (username, password) => {
    try {
      const userData = await authAPI.login(username, password);
      
      // Map backend role to frontend expected format if necessary
      // Backend: ADMIN, EMPLOYEE, MANAGER, HR
      // Frontend: admin, employee, manager, hr
      const role = userData.role.toLowerCase();
      
      const sessionData = {
        ...userData,
        role: role,
        avatar: `https://ui-avatars.com/api/?name=${userData.username}&background=random`
      };

      setUser(sessionData);
      localStorage.setItem('user', JSON.stringify(sessionData));
      return sessionData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
