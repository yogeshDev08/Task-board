import React, { useCallback } from 'react';
import { formatDate, getStatusColor, getPriorityColor } from '../utils/formatting';

const TaskCard = ({ task, onEdit, onDelete, canEdit, canDelete }) => {
  const handleEditClick = useCallback(() => {
    onEdit(task);
  }, [onEdit, task]);

  const handleDeleteClick = useCallback(() => {
    onDelete(task._id);
  }, [onDelete, task._id]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
        <div className="flex gap-2">
          {canEdit && (
            <button
              onClick={handleEditClick}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDeleteClick}
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
          <p>Due: {formatDate(task.dueDate)}</p>
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
