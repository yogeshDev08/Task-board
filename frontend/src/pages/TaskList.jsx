import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, setFilters, deleteTask } from '../store/tasksSlice';
import { debounce } from '../utils/debounce';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const TaskList = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tasks, pagination, filters, loading } = useSelector((state) => state.tasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.priority, filters.search, filters.dueDate, pagination.page]);

  const loadTasks = () => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters
    };
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (!params[key]) delete params[key];
    });
    dispatch(fetchTasks(params));
  };

  const handleSearch = debounce((value) => {
    dispatch(setFilters({ search: value }));
  }, 500);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await dispatch(deleteTask(taskId)).unwrap();
        toast.success('Task deleted successfully');
      } catch (error) {
        toast.error(error || 'Failed to delete task');
      }
    }
  };

  const handleCreate = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    loadTasks(); // Refresh list after modal closes
  };

  const canEdit = (task) => {
    if (isAdmin) return true;
    return task.createdBy?._id === user?.id || task.assignedTo?._id === user?.id;
  };

  const canDelete = (task) => {
    if (isAdmin) return true;
    return task.createdBy?._id === user?.id;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          {(isAdmin || true) && (
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Create Task
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={filters.dueDate || ''}
                onChange={(e) => handleFilterChange('dueDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <LoadingSpinner />
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No tasks found. Create your first task!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={() => handleEdit(task)}
                onDelete={() => handleDelete(task._id)}
                canEdit={canEdit(task)}
                canDelete={canDelete(task)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => {
                dispatch(setFilters({ page: Math.max(1, pagination.page - 1) }));
              }}
              disabled={pagination.page === 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 flex items-center">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => {
                dispatch(setFilters({ page: Math.min(pagination.pages, pagination.page + 1) }));
              }}
              disabled={pagination.page >= pagination.pages}
              className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}

        <TaskModal
          task={editingTask}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
};

export default TaskList;
