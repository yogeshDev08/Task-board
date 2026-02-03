import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/tasks?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch tasks'
      );
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      return response.data.data.task;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch task'
      );
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data.data.task;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create task'
      );
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      return response.data.data.task;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update task'
      );
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      return taskId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete task'
      );
    }
  }
);

const initialState = {
  tasks: [],
  currentTask: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  filters: {
    status: '',
    priority: '',
    search: '',
    dueDate: ''
  },
  loading: false,
  error: null
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      // If filter is changing (not page), reset to page 1
      const isPageChange = action.payload.hasOwnProperty('page') && Object.keys(action.payload).length === 1;
      if (!isPageChange) {
        state.pagination.page = 1;
      }
      state.filters = { ...state.filters, ...action.payload };
      // Update page if explicitly provided
      if (action.payload.page) {
        state.pagination.page = action.payload.page;
      }
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        priority: '',
        search: '',
        dueDate: ''
      };
    },
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    // Optimistic update for real-time socket events
    addTaskOptimistic: (state, action) => {
      const task = action.payload;
      if (!state.tasks.find(t => t._id === task._id)) {
        state.tasks.unshift(task);
        state.pagination.total += 1;
      }
    },
    updateTaskOptimistic: (state, action) => {
      const updatedTask = action.payload;
      const index = state.tasks.findIndex(t => t._id === updatedTask._id);
      if (index !== -1) {
        state.tasks[index] = updatedTask;
      }
      if (state.currentTask?._id === updatedTask._id) {
        state.currentTask = updatedTask;
      }
    },
    removeTaskOptimistic: (state, action) => {
      const taskId = action.payload.id || action.payload;
      state.tasks = state.tasks.filter(t => t._id !== taskId);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
      if (state.currentTask?._id === taskId) {
        state.currentTask = null;
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.data.tasks;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter(t => t._id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        if (state.currentTask?._id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setFilters,
  clearFilters,
  setCurrentTask,
  clearCurrentTask,
  addTaskOptimistic,
  updateTaskOptimistic,
  removeTaskOptimistic,
  clearError
} = tasksSlice.actions;

export default tasksSlice.reducer;
