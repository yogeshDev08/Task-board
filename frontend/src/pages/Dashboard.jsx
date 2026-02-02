import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTasks } from '../store/tasksSlice';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { tasks, loading } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Calculate statistics
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
    high: tasks.filter(t => t.priority === 'HIGH').length,
    medium: tasks.filter(t => t.priority === 'MEDIUM').length,
    low: tasks.filter(t => t.priority === 'LOW').length
  };

  const StatCard = ({ title, value, color }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 ${color}`}>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.email} {user?.role === 'admin' && '(Admin)'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Tasks" value={stats.total} color="border-l-4 border-blue-500" />
          <StatCard title="TODO" value={stats.todo} color="border-l-4 border-gray-500" />
          <StatCard title="In Progress" value={stats.inProgress} color="border-l-4 border-yellow-500" />
          <StatCard title="Done" value={stats.done} color="border-l-4 border-green-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard title="High Priority" value={stats.high} color="border-l-4 border-red-500" />
          <StatCard title="Medium Priority" value={stats.medium} color="border-l-4 border-yellow-500" />
          <StatCard title="Low Priority" value={stats.low} color="border-l-4 border-green-500" />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/tasks')}
              className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left"
            >
              <h3 className="font-semibold mb-1">View All Tasks</h3>
              <p className="text-sm opacity-90">Browse and manage all your tasks</p>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-left"
            >
              <h3 className="font-semibold mb-1">View Profile</h3>
              <p className="text-sm opacity-90">Manage your account settings</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
