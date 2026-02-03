import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import {
  addTaskOptimistic,
  updateTaskOptimistic,
  removeTaskOptimistic
} from '../store/tasksSlice';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const shouldViewTask = (task) => {
    if (!user) return false;
    
    // Admin can see all tasks
    if (user.role === 'admin') return true;
    
    // User can see tasks they created or are assigned to
    const createdByCurrentUser = task.createdBy?._id === user.id || task.createdBy === user.id;
    const assignedToCurrentUser = task.assignedTo?._id === user.id || task.assignedTo === user.id;
    
    return createdByCurrentUser || assignedToCurrentUser;
  };

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
      if (shouldViewTask(task)) {
        dispatch(addTaskOptimistic(task));
      }
    });

    socket.on('task:updated', (task) => {
      console.log('Task updated:', task);
      if (shouldViewTask(task)) {
        dispatch(updateTaskOptimistic(task));
      }
    });

    socket.on('task:deleted', (data) => {
      console.log('Task deleted:', data);
      dispatch(removeTaskOptimistic(data));
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, user]);
};
