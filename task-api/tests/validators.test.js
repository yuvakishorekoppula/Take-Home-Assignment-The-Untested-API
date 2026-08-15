const {
  validateCreateTask,
  validateUpdateTask,
  validateAssignTask,
} = require('../src/utils/validators');

describe('Task Validators', () => {
  describe('validateCreateTask', () => {
    test('should reject missing title', () => {
      expect(validateCreateTask({})).toBe(
        'title is required and must be a non-empty string'
      );
    });

    test('should reject non-string title', () => {
      expect(
        validateCreateTask({
          title: 123,
        })
      ).toBe('title is required and must be a non-empty string');
    });

    test('should reject empty title', () => {
      expect(
        validateCreateTask({
          title: '   ',
        })
      ).toBe('title is required and must be a non-empty string');
    });

    test('should reject invalid status', () => {
      expect(
        validateCreateTask({
          title: 'Test',
          status: 'invalid',
        })
      ).toBe('status must be one of: todo, in_progress, done');
    });

    test('should reject invalid priority', () => {
      expect(
        validateCreateTask({
          title: 'Test',
          priority: 'invalid',
        })
      ).toBe('priority must be one of: low, medium, high');
    });

    test('should reject invalid dueDate', () => {
      expect(
        validateCreateTask({
          title: 'Test',
          dueDate: 'not-a-date',
        })
      ).toBe('dueDate must be a valid ISO date string');
    });

    test('should accept valid task', () => {
      expect(
        validateCreateTask({
          title: 'Valid task',
          status: 'todo',
          priority: 'high',
          dueDate: '2026-12-31',
        })
      ).toBeNull();
    });
  });

  describe('validateUpdateTask', () => {
    test('should reject empty title', () => {
      expect(
        validateUpdateTask({
          title: '   ',
        })
      ).toBe('title must be a non-empty string');
    });

    test('should reject invalid status', () => {
      expect(
        validateUpdateTask({
          status: 'invalid',
        })
      ).toBe('status must be one of: todo, in_progress, done');
    });

    test('should reject invalid priority', () => {
      expect(
        validateUpdateTask({
          priority: 'invalid',
        })
      ).toBe('priority must be one of: low, medium, high');
    });

    test('should reject invalid dueDate', () => {
      expect(
        validateUpdateTask({
          dueDate: 'not-a-date',
        })
      ).toBe('dueDate must be a valid ISO date string');
    });

    test('should accept valid update', () => {
      expect(
        validateUpdateTask({
          title: 'Updated task',
          status: 'done',
          priority: 'high',
        })
      ).toBeNull();
    });
  });

  describe('validateAssignTask', () => {
    test('should reject missing body', () => {
      expect(validateAssignTask()).toBe(
        'assignee is required and must be a non-empty string'
      );
    });

    test('should reject missing assignee', () => {
      expect(validateAssignTask({})).toBe(
        'assignee is required and must be a non-empty string'
      );
    });

    test('should reject non-string assignee', () => {
      expect(
        validateAssignTask({
          assignee: 123,
        })
      ).toBe('assignee is required and must be a non-empty string');
    });

    test('should reject empty assignee', () => {
      expect(
        validateAssignTask({
          assignee: '   ',
        })
      ).toBe('assignee is required and must be a non-empty string');
    });

    test('should accept valid assignee', () => {
      expect(
        validateAssignTask({
          assignee: 'John',
        })
      ).toBeNull();
    });
  });
});