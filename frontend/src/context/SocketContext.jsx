import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext'; // Assuming AuthContext exists

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth(); // or however user is accessed
  
  useEffect(() => {
    let newSocket;
    if (user && user._id) {
      newSocket = io(process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:5000', {
        reconnection: true
      });
      
      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        newSocket.emit('register', user._id);
      });

      setSocket(newSocket);
    }

    return () => {
      if (newSocket) newSocket.close();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
