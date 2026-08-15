const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

beforeEach(() => {
  taskService._reset();
});

test('GET /tasks should return all tasks', async () => {
  taskService.create({
    title: 'Task 1',
  });

  taskService.create({
    title: 'Task 2',
  });

  const response = await request(app)
    .get('/tasks');

  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveLength(2);
});

test('GET /tasks should return an empty array when there are no tasks', async () => {
  const response = await request(app)
    .get('/tasks');

  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual([]);
});

test('POST /tasks should create a task', async () => {
  const response = await request(app)
    .post('/tasks')
    .send({
      title: 'Learn Supertest',
    });

  expect(response.statusCode).toBe(201);
  expect(response.body.title).toBe('Learn Supertest');
  expect(response.body.id).toBeDefined();
});

test('POST /tasks should reject a missing title', async () => {
  const response = await request(app)
    .post('/tasks')
    .send({});

  expect(response.statusCode).toBe(400);
});

test('POST /tasks should reject an empty title', async () => {
  const response = await request(app)
    .post('/tasks')
    .send({
      title: '',
    });

  expect(response.statusCode).toBe(400);
});

test('GET /tasks?status=todo should return only todo tasks', async () => {
  taskService.create({
    title: 'Todo task',
    status: 'todo',
  });

  taskService.create({
    title: 'Done task',
    status: 'done',
  });

  taskService.create({
    title: 'Another todo task',
    status: 'todo',
  });

  const response = await request(app)
    .get('/tasks?status=todo');

  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveLength(2);

  expect(
    response.body.every((task) => task.status === 'todo')
  ).toBe(true);
});

test('GET /tasks?page=1&limit=2 should return the first two tasks', async () => {
  taskService.create({ title: 'Task 1' });
  taskService.create({ title: 'Task 2' });
  taskService.create({ title: 'Task 3' });

  const response = await request(app)
    .get('/tasks?page=1&limit=2');

  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveLength(2);

  expect(response.body[0].title).toBe('Task 1');
  expect(response.body[1].title).toBe('Task 2');
});

test('GET /tasks?page=2&limit=2 should return the second page', async () => {
  taskService.create({ title: 'Task 1' });
  taskService.create({ title: 'Task 2' });
  taskService.create({ title: 'Task 3' });
  taskService.create({ title: 'Task 4' });

  const response = await request(app)
    .get('/tasks?page=2&limit=2');

  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveLength(2);

  expect(response.body[0].title).toBe('Task 3');
  expect(response.body[1].title).toBe('Task 4');
});

test('GET /tasks/stats should return task statistics', async () => {
  taskService.create({
    title: 'Todo task',
    status: 'todo',
  });

  taskService.create({
    title: 'In progress task',
    status: 'in_progress',
  });

  taskService.create({
    title: 'Done task',
    status: 'done',
  });

  const response = await request(app)
    .get('/tasks/stats');

  expect(response.statusCode).toBe(200);

  expect(response.body.todo).toBe(1);
  expect(response.body.in_progress).toBe(1);
  expect(response.body.done).toBe(1);
  expect(response.body.overdue).toBe(0);
});

test('PUT /tasks/:id should update a task', async () => {
  const created = taskService.create({
    title: 'Old title',
  });

  const response = await request(app)
    .put(`/tasks/${created.id}`)
    .send({
      title: 'Updated title',
    });

  expect(response.statusCode).toBe(200);
  expect(response.body.title).toBe('Updated title');
  expect(response.body.id).toBe(created.id);
});

test('PUT /tasks/:id should return 404 for a nonexistent task', async () => {
  const response = await request(app)
    .put('/tasks/does-not-exist')
    .send({
      title: 'Updated title',
    });

  expect(response.statusCode).toBe(404);
});

test('DELETE /tasks/:id should delete a task', async () => {
  const created = taskService.create({
    title: 'Delete me',
  });

  const response = await request(app)
    .delete(`/tasks/${created.id}`);

  expect(response.statusCode).toBe(204);
});

test('DELETE /tasks/:id should return 404 for a nonexistent task', async () => {
  const response = await request(app)
    .delete('/tasks/does-not-exist');

  expect(response.statusCode).toBe(404);
});

test('PATCH /tasks/:id/complete should complete a task', async () => {
  const created = taskService.create({
    title: 'Complete me',
    status: 'todo',
  });

  const response = await request(app)
    .patch(`/tasks/${created.id}/complete`);

  expect(response.statusCode).toBe(200);
  expect(response.body.status).toBe('done');
  expect(response.body.completedAt).not.toBeNull();
});

test('PATCH /tasks/:id/complete should return 404 for a nonexistent task', async () => {
  const response = await request(app)
    .patch('/tasks/does-not-exist/complete');

  expect(response.statusCode).toBe(404);
});

test('PATCH /tasks/:id/assign should assign a task', async () => {
  const created = taskService.create({
    title: 'Task to assign',
  });

  const response = await request(app)
    .patch(`/tasks/${created.id}/assign`)
    .send({
      assignee: 'John',
    });

  expect(response.statusCode).toBe(200);
  expect(response.body.id).toBe(created.id);
  expect(response.body.assignee).toBe('John');
});

test('PATCH /tasks/:id/assign should reject a missing assignee', async () => {
  const created = taskService.create({
    title: 'Task to assign',
  });

  const response = await request(app)
    .patch(`/tasks/${created.id}/assign`)
    .send({});

  expect(response.statusCode).toBe(400);
  expect(response.body.error).toBe(
    'assignee is required and must be a non-empty string'
  );
});

test('PATCH /tasks/:id/assign should reject an empty assignee', async () => {
  const created = taskService.create({
    title: 'Task to assign',
  });

  const response = await request(app)
    .patch(`/tasks/${created.id}/assign`)
    .send({
      assignee: '',
    });

  expect(response.statusCode).toBe(400);
});

test('PATCH /tasks/:id/assign should reject a non-string assignee', async () => {
  const created = taskService.create({
    title: 'Task to assign',
  });

  const response = await request(app)
    .patch(`/tasks/${created.id}/assign`)
    .send({
      assignee: 123,
    });

  expect(response.statusCode).toBe(400);
});

test('PATCH /tasks/:id/assign should return 404 for a nonexistent task', async () => {
  const response = await request(app)
    .patch('/tasks/does-not-exist/assign')
    .send({
      assignee: 'John',
    });

  expect(response.statusCode).toBe(404);
  expect(response.body.error).toBe('Task not found');
});

test('PATCH /tasks/:id/assign should trim the assignee name', async () => {
  const created = taskService.create({
    title: 'Task to assign',
  });

  const response = await request(app)
    .patch(`/tasks/${created.id}/assign`)
    .send({
      assignee: '  John  ',
    });

  expect(response.statusCode).toBe(200);
  expect(response.body.assignee).toBe('John');
});


