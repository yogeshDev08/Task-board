import React from 'react';
import { format } from 'date-fns';

const TaskCard = ({ task, onEdit, onDelete, canEdit, canDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'DONE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
        <div className="flex gap-2">
          {canEdit && (
            <button
              onClick={() => onEdit(task)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(task._id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
          {task.status.replace('_', ' ')}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>
      
      <div className="text-xs text-gray-500 space-y-1">
        {task.dueDate && (
          <p>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</p>
        )}
        {task.assignedTo && (
          <p>Assigned to: {task.assignedTo.email}</p>
        )}
        <p>Created by: {task.createdBy?.email || 'Unknown'}</p>
      </div>
    </div>
  );
};

export default React.memo(TaskCard);
