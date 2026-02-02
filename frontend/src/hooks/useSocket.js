import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import {
  addTaskOptimistic,
  updateTaskOptimistic,
  removeTaskOptimistic
} from '../store/tasksSlice';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Listen for task events
    socket.on('task:created', (task) => {
      console.log('Task created:', task);
      dispatch(addTaskOptimistic(task));
    });

    socket.on('task:updated', (task) => {
      console.log('Task updated:', task);
      dispatch(updateTaskOptimistic(task));
    });

    socket.on('task:deleted', (data) => {
      console.log('Task deleted:', data);
      dispatch(removeTaskOptimistic(data));
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);
};
