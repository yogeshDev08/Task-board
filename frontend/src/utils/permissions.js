/**
 * Check if user can edit a task
 * @param {Object} task - Task object
 * @param {Object} user - Current user object
 * @returns {boolean} - True if user can edit
 */
export const canEditTask = (task, user) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return task.createdBy?._id === user.id || task.assignedTo?._id === user.id;
};

/**
 * Check if user can delete a task
 * @param {Object} task - Task object
 * @param {Object} user - Current user object
 * @returns {boolean} - True if user can delete
 */
export const canDeleteTask = (task, user) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return task.createdBy?._id === user.id;
};

/**
 * Check if user should be able to view a task in real-time
 * @param {Object} task - Task object
 * @param {Object} user - Current user object
 * @returns {boolean} - True if user should view the task
 */
export const shouldViewTask = (task, user) => {
  if (!user) return false;
  
  // Admin can see all tasks
  if (user.role === 'admin') return true;
  
  // User can see tasks they created or are assigned to
  const createdByCurrentUser = task.createdBy?._id === user.id || task.createdBy === user.id;
  const assignedToCurrentUser = task.assignedTo?._id === user.id || task.assignedTo === user.id;
  
  return createdByCurrentUser || assignedToCurrentUser;
};

/**
 * Check if user is admin
 * @param {Object} user - Current user object
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = (user) => {
  return user?.role === 'admin';
};

/**
 * Check if user owns a resource
 * @param {string} userId - Resource owner ID
 * @param {Object} user - Current user object
 * @returns {boolean} - True if user owns the resource
 */
export const isOwner = (userId, user) => {
  if (!user) return false;
  return userId.toString() === user.id.toString();
};
