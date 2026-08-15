const taskService = require('../src/services/taskService');

beforeEach(() => {
  taskService._reset();
});

describe('Task Service', () => {
  describe('create', () => {
    test('should create a task', () => {
      const task = taskService.create({
        title: 'Learn Jest',
      });

      expect(task.title).toBe('Learn Jest');
    });

    test('should generate an id when creating a task', () => {
      const task = taskService.create({
        title: 'Learn Jest',
      });

      expect(task.id).toBeDefined();
      expect(typeof task.id).toBe('string');
    });

    test('should apply default values when creating a task', () => {
      const task = taskService.create({
        title: 'Learn Jest',
      });

      expect(task.description).toBe('');
      expect(task.status).toBe('todo');
      expect(task.priority).toBe('medium');
      expect(task.dueDate).toBeNull();
      expect(task.completedAt).toBeNull();
    });

    test('should create a task with custom values', () => {
      const task = taskService.create({
        title: 'Build API',
        description: 'Build task manager API',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2026-08-20T10:00:00.000Z',
      });

      expect(task.title).toBe('Build API');
      expect(task.description).toBe('Build task manager API');
      expect(task.status).toBe('in_progress');
      expect(task.priority).toBe('high');
      expect(task.dueDate).toBe('2026-08-20T10:00:00.000Z');
    });
  });

  describe('getAll', () => {
    test('should return all tasks', () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });

      const tasks = taskService.getAll();

      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe('Task 1');
      expect(tasks[1].title).toBe('Task 2');
    });

    test('should return an empty array when there are no tasks', () => {
      const tasks = taskService.getAll();

      expect(tasks).toEqual([]);
    });
  });

  describe('findById', () => {
    test('should find a task by id', () => {
      const created = taskService.create({
        title: 'Find me',
      });

      const found = taskService.findById(created.id);

      expect(found).toEqual(created);
    });

    test('should return undefined when task does not exist', () => {
      const result = taskService.findById('does-not-exist');

      expect(result).toBeUndefined();
    });
  });

  describe('getByStatus', () => {
    test('should return tasks filtered by status', () => {
      taskService.create({
        title: 'Task 1',
        status: 'todo',
      });

      taskService.create({
        title: 'Task 2',
        status: 'done',
      });

      taskService.create({
        title: 'Task 3',
        status: 'todo',
      });

      const tasks = taskService.getByStatus('todo');

      expect(tasks).toHaveLength(2);
      expect(tasks.every((task) => task.status === 'todo')).toBe(true);
    });

    test('should return an empty array when no tasks match the status', () => {
      taskService.create({
        title: 'Task 1',
        status: 'todo',
      });

      const tasks = taskService.getByStatus('done');

      expect(tasks).toEqual([]);
    });
  });

  describe('getPaginated', () => {
    test('should return the first page of tasks', () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });
      taskService.create({ title: 'Task 3' });

      const tasks = taskService.getPaginated(1, 2);

      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe('Task 1');
      expect(tasks[1].title).toBe('Task 2');
    });

    test('should return the second page of tasks', () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });
      taskService.create({ title: 'Task 3' });
      taskService.create({ title: 'Task 4' });

      const tasks = taskService.getPaginated(2, 2);

      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe('Task 3');
      expect(tasks[1].title).toBe('Task 4');
    });
  });

  describe('update', () => {
    test('should update an existing task', () => {
      const created = taskService.create({
        title: 'Old title',
      });

      const updated = taskService.update(created.id, {
        title: 'New title',
      });

      expect(updated.title).toBe('New title');
      expect(updated.id).toBe(created.id);
    });

    test('should return null when updating a nonexistent task', () => {
      const result = taskService.update('does-not-exist', {
        title: 'New title',
      });

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    test('should remove an existing task', () => {
      const created = taskService.create({
        title: 'Delete me',
      });

      const result = taskService.remove(created.id);

      expect(result).toBe(true);
      expect(taskService.findById(created.id)).toBeUndefined();
    });

    test('should return false when deleting a nonexistent task', () => {
      const result = taskService.remove('does-not-exist');

      expect(result).toBe(false);
    });
  });

  describe('completeTask', () => {
    test('should mark a task as complete', () => {
      const created = taskService.create({
        title: 'Finish assignment',
        status: 'in_progress',
      });

      const completed = taskService.completeTask(created.id);

      expect(completed.status).toBe('done');
      expect(completed.completedAt).not.toBeNull();
    });

    test('should return null when completing a nonexistent task', () => {
      const result = taskService.completeTask('does-not-exist');

      expect(result).toBeNull();
    });
  });

  describe('getStats', () => {
    test('should return correct task statistics', () => {
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

      const stats = taskService.getStats();

      expect(stats.todo).toBe(1);
      expect(stats.in_progress).toBe(1);
      expect(stats.done).toBe(1);
      expect(stats.overdue).toBe(0);
    });

    test('should count unfinished overdue tasks', () => {
      taskService.create({
        title: 'Overdue task',
        status: 'todo',
        dueDate: '2020-01-01T00:00:00.000Z',
      });

      const stats = taskService.getStats();

      expect(stats.overdue).toBe(1);
    });

    test('should not count completed overdue tasks', () => {
      taskService.create({
        title: 'Completed old task',
        status: 'done',
        dueDate: '2020-01-01T00:00:00.000Z',
      });

      const stats = taskService.getStats();

      expect(stats.overdue).toBe(0);
    });
  });
});
