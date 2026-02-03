import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTasks } from '../store/tasksSlice';
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
            <span className="text-sm text-gray-600">Total: {users?.length} users</span>
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
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          u.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {u.role === 'admin' ? '⚙️ Admin' : '👤 User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
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
    </div>
  );
};

export default AdminDashboard;
