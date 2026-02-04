import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTasks } from '../store/tasksSlice';
import { validateEmail, validatePassword, isEmailValid, isPasswordValid } from '../utils/validation';
import { formatDateLocale, getRoleColor, getRoleDisplay, formatStatus } from '../utils/formatting';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { tasks, loading } = useSelector((state) => state.tasks);
  
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    totalTasks: 0,
    completedTasks: 0
  });
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    email: '',
    password: '',
    role: 'user'
  });
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserError, setCreateUserError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const [emailError, setEmailError] = useState('');

  const validateEmailLocal = useCallback((email) => {
    const error = validateEmail(email);
    setEmailError(error);
    return !error;
  }, []);

  const validatePasswordLocal = useCallback((password) => {
    const errors = validatePassword(password);
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    dispatch(fetchTasks({ page: 1, limit: 100 }));
    fetchUsers();
  }, [dispatch, user, navigate]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await api.get('/users');
      const usersList = Array.isArray(response.data.data?.users) ? response.data.data.users : [];
      setUsers(usersList);
      calculateStats(usersList, tasks);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const calculateStats = (usersList, tasksList) => {
    const safeusersList = Array.isArray(usersList) ? usersList : [];
    const safetasksList = Array.isArray(tasksList) ? tasksList : [];
    setSystemStats({
      totalUsers: safeusersList.length,
      adminUsers: safeusersList.filter(u => u.role === 'admin').length,
      totalTasks: safetasksList.length,
      completedTasks: safetasksList.filter(t => t.status === 'DONE').length
    });
  };

  useEffect(() => {
    if (users.length > 0) {
      calculateStats(users, tasks);
    }
  }, [tasks]);

  const handleCreateUser = useCallback(async (e) => {
    e.preventDefault();
    setCreateUserError('');
    setCreateUserLoading(true);

    try {
      // Email validation
      if (!validateEmailLocal(createUserForm.email)) {
        setCreateUserLoading(false);
        return;
      }

      // Password validation
      if (!validatePasswordLocal(createUserForm.password)) {
        setCreateUserLoading(false);
        return;
      }

      const response = await api.post('/users', {
        email: createUserForm.email,
        password: createUserForm.password,
        role: createUserForm.role
      });

      if (response.data.success) {
        setShowCreateUserModal(false);
        setCreateUserForm({ email: '', password: '', role: 'user' });
        setPasswordErrors({});
        setEmailError('');
        setShowPassword(false);
        await fetchUsers();
      }
    } catch (error) {
      setCreateUserError(error.response?.data?.message || 'Failed to create user');
    } finally {
      setCreateUserLoading(false);
    }
  }, [createUserForm]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setCreateUserForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time email validation
    if (name === 'email') {
      if (value) {
        validateEmailLocal(value);
      } else {
        setEmailError('');
      }
    }
    
    // Real-time password validation
    if (name === 'password' && value) {
      validatePasswordLocal(value);
    } else if (name === 'password' && !value) {
      setPasswordErrors({});
    }
  }, [validateEmailLocal, validatePasswordLocal]);

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
    high: tasks.filter(t => t.priority === 'HIGH').length,
    medium: tasks.filter(t => t.priority === 'MEDIUM').length,
    low: tasks.filter(t => t.priority === 'LOW').length
  };

  const StatCard = ({ title, value, color, icon }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && <div className="text-2xl opacity-50">{icon}</div>}
      </div>
    </div>
  );

  if (loading || usersLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {user?.email}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/tasks')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                All Tasks
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Settings
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard 
              title="Total Users" 
              value={systemStats.totalUsers} 
              color="border-blue-500"
              icon="👥"
            />
            <StatCard 
              title="Admin Users" 
              value={systemStats.adminUsers} 
              color="border-purple-500"
              icon="⚙️"
            />
            <StatCard 
              title="Total Tasks" 
              value={systemStats.totalTasks} 
              color="border-green-500"
              icon="📋"
            />
            <StatCard 
              title="Completed Tasks" 
              value={systemStats.completedTasks} 
              color="border-emerald-500"
              icon="✅"
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Task Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <StatCard title="Total Tasks" value={taskStats.total} color="border-blue-500" />
            <StatCard title="TODO" value={taskStats.todo} color="border-gray-500" />
            <StatCard title="In Progress" value={taskStats.inProgress} color="border-yellow-500" />
            <StatCard title="Done" value={taskStats.done} color="border-green-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="High Priority" value={taskStats.high} color="border-red-500" />
            <StatCard title="Medium Priority" value={taskStats.medium} color="border-yellow-500" />
            <StatCard title="Low Priority" value={taskStats.low} color="border-green-500" />
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Total: {users?.length} users</span>
              <button
                onClick={() => setShowCreateUserModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                + Create User
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.isArray(users) && users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{u.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(u.role)}`}>
                          {getRoleDisplay(u.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDateLocale(u.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {Array.isArray(users) && users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Tasks</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Priority</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Assigned To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.isArray(tasks) && tasks.slice(0, 5).map((task) => (
                    <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{task.title}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          task.status === 'TODO' ? 'bg-gray-100 text-gray-800' :
                          task.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                          task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{task.assignedTo?.email || 'Unassigned'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {Array.isArray(tasks) && tasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No tasks found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create New User</h3>
              
              {createUserError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {createUserError}
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={createUserForm.email}
                    onChange={handleInputChange}
                    placeholder="user@example.com"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      emailError 
                        ? 'border-red-400 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
                  />
                  {emailError && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-300 rounded text-red-700 text-xs flex items-center">
                      <span className="mr-2">✗</span>
                      {emailError}
                    </div>
                  )}
                  {!emailError && createUserForm.email && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-300 rounded text-green-700 text-xs flex items-center">
                      <span className="mr-2">✓</span>
                      Email is valid
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={createUserForm.password}
                      onChange={handleInputChange}
                      placeholder="Enter a strong password"
                      className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 ${
                        Object.keys(passwordErrors).length > 0 
                          ? 'border-red-400 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.479z" clipRule="evenodd" />
                          <path d="M15.171 13.576l1.172 1.172a3.999 3.999 0 01-7.08-2.727l1.514 1.515a2.001 2.001 0 002.487 2.806 2 2 0 00.909-1.766z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Password Validation Requirements */}
                  {createUserForm.password && (
                    <div className="mt-3 space-y-2">
                      <div className={`flex items-center text-xs p-2 rounded ${
                        createUserForm.password.length >= 8 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        <span className="mr-2">{createUserForm.password.length >= 8 ? '✓' : '✗'}</span>
                        At least 8 characters
                      </div>
                      
                      <div className={`flex items-center text-xs p-2 rounded ${
                        /[A-Z]/.test(createUserForm.password) 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        <span className="mr-2">{/[A-Z]/.test(createUserForm.password) ? '✓' : '✗'}</span>
                        At least one uppercase letter (A-Z)
                      </div>
                      
                      <div className={`flex items-center text-xs p-2 rounded ${
                        /[a-z]/.test(createUserForm.password) 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        <span className="mr-2">{/[a-z]/.test(createUserForm.password) ? '✓' : '✗'}</span>
                        At least one lowercase letter (a-z)
                      </div>
                      
                      <div className={`flex items-center text-xs p-2 rounded ${
                        /[0-9]/.test(createUserForm.password) 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        <span className="mr-2">{/[0-9]/.test(createUserForm.password) ? '✓' : '✗'}</span>
                        At least one number (0-9)
                      </div>
                      
                      <div className={`flex items-center text-xs p-2 rounded ${
                        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(createUserForm.password) 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        <span className="mr-2">{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(createUserForm.password) ? '✓' : '✗'}</span>
                        At least one special character (!@#$%^&*)
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    value={createUserForm.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={createUserLoading || Object.keys(passwordErrors).length > 0 || emailError}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {createUserLoading ? 'Creating...' : 'Create User'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateUserModal(false);
                      setCreateUserForm({ email: '', password: '', role: 'user' });
                      setCreateUserError('');
                      setPasswordErrors({});
                      setEmailError('');
                      setShowPassword(false);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
