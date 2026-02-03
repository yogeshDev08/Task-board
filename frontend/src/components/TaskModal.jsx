import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { createTask, updateTask } from '../store/tasksSlice';
import FormInput from './FormInput';
import SearchableUserSelect from './SearchableUserSelect';
import LoadingSpinner from './LoadingSpinner';

const TaskModal = ({ task, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const isEdit = !!task;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
      assignedTo: ''
    },
    mode: 'onBlur'
  });

  const assignedToValue = watch('assignedTo');

  useEffect(() => {
    if (task) {
      setValue('title', task.title);
      setValue('description', task.description || '');
      setValue('status', task.status);
      setValue('priority', task.priority);
      setValue('dueDate', task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setValue('assignedTo', task.assignedTo?._id || '');
    } else {
      reset();
    }
  }, [task, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await dispatch(updateTask({ taskId: task._id, taskData: data })).unwrap();
      } else {
        await dispatch(createTask(data)).unwrap();
      }
      onClose();
      reset();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{isEdit ? 'Edit Task' : 'Create Task'}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput
            label="Title"
            name="title"
            register={register}
            errors={errors}
            required
            placeholder="Enter task title"
            validation={{
              required: 'Title is required',
              minLength: { value: 3, message: 'Title must be at least 3 characters' },
              maxLength: { value: 200, message: 'Title cannot exceed 200 characters' }
            }}
          />

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              {...register('description', {
                maxLength: { value: 1000, message: 'Description cannot exceed 1000 characters' }
              })}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter task description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priority"
              {...register('priority')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="dueDate"
              {...register('dueDate', {
                required: 'Due date is required',
                validate: {
                  futureDate: (value) => {
                    if (!value) return true; // Will be caught by required validation
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return selectedDate >= today || 'Due date must be today or in the future';
                  }
                }
              })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.dueDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.dueDate && (
              <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>
            )}
          </div>

          {user?.role === 'admin' && (
            <SearchableUserSelect
              value={assignedToValue}
              onChange={(value) => setValue('assignedTo', value)}
              label="Assign To"
            />
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size={20} color="#fff" /> : (isEdit ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
