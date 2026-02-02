import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskCard from '../components/TaskCard';

const mockTask = {
  _id: '1',
  title: 'Test Task',
  description: 'Test Description',
  status: 'TODO',
  priority: 'HIGH',
  dueDate: '2024-12-31',
  assignedTo: { email: 'user@example.com' },
  createdBy: { email: 'creator@example.com' }
};

describe('TaskCard', () => {
  it('renders task title', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={() => {}}
        onDelete={() => {}}
        canEdit={true}
        canDelete={true}
      />
    );
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders task description', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={() => {}}
        onDelete={() => {}}
        canEdit={true}
        canDelete={true}
      />
    );
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('shows edit and delete buttons when permissions are granted', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={() => {}}
        onDelete={() => {}}
        canEdit={true}
        canDelete={true}
      />
    );
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('hides edit and delete buttons when permissions are not granted', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={() => {}}
        onDelete={() => {}}
        canEdit={false}
        canDelete={false}
      />
    );
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });
});
