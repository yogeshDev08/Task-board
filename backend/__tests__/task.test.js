const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');

describe('Task API', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/task-manager-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Task.deleteMany({});

    // Create test user and get token
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    });
    userId = user._id;
    authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test-secret');
  });

  describe('POST /api/tasks', () => {
    it('should create a task', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          description: 'Test Description',
          status: 'TODO',
          priority: 'HIGH'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.task).toHaveProperty('title', 'Test Task');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      await Task.create([
        {
          title: 'Task 1',
          status: 'TODO',
          priority: 'HIGH',
          createdBy: userId
        },
        {
          title: 'Task 2',
          status: 'DONE',
          priority: 'LOW',
          createdBy: userId
        }
      ]);
    });

    it('should get all tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(2);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks?status=TODO')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.tasks.every(t => t.status === 'TODO')).toBe(true);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create({
        title: 'Test Task',
        createdBy: userId
      });
      taskId = task._id;
    });

    it('should update a task', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'IN_PROGRESS'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.task.status).toBe('IN_PROGRESS');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create({
        title: 'Test Task',
        createdBy: userId
      });
      taskId = task._id;
    });

    it('should delete a task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const deletedTask = await Task.findById(taskId);
      expect(deletedTask).toBeNull();
    });
  });
});
