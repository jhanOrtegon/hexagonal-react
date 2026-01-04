const fs = require('fs');

const testContent = `import { type Result } from '../../../shared/domain/Result';
import { User } from '../User.entity';
import { InvalidArgumentError } from '../../../shared/errors';

describe('User Entity', () => {
  describe('create', () => {
    it('should create a user instance with valid data', () => {
      const result: Result<User, InvalidArgumentError> = User.create({
        email: 'test@example.com',
        name: 'Test User',
      });

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const user: User = result.value;
        expect(user.id).toBeDefined();
        expect(user.email).toBe('test@example.com');
        expect(user.name).toBe('Test User');
        expect(user.createdAt).toBeInstanceOf(Date);
        expect(user.updatedAt).toBeInstanceOf(Date);
      }
    });

    it('should normalize email to lowercase', () => {
      const result: Result<User, InvalidArgumentError> = User.create({
        email: 'TEST@EXAMPLE.COM',
        name: 'Test User',
      });

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.email).toBe('test@example.com');
      }
    });

    it('should trim email and name', () => {
      const result: Result<User, InvalidArgumentError> = User.create({
        email: '  test@example.com  ',
        name: '  Test User  ',
      });

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.email).toBe('test@example.com');
        expect(result.value.name).toBe('Test User');
      }
    });

    it('should return failure when email is empty', () => {
      const result: Result<User, InvalidArgumentError> = User.create({
        email: '',
        name: 'Test User',
      });

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error).toBeInstanceOf(InvalidArgumentError);
        expect(result.error.field).toBe('email');
      }
    });

    it('should return failure when name is empty', () => {
      const result: Result<User, InvalidArgumentError> = User.create({
        email: 'test@example.com',
        name: '',
      });

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error).toBeInstanceOf(InvalidArgumentError);
        expect(result.error.field).toBe('name');
      }
    });

    it('should return failure when email format is invalid', () => {
      const result: Result<User, InvalidArgumentError> = User.create({
        email: 'invalid-email',
        name: 'Test User',
      });

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error).toBeInstanceOf(InvalidArgumentError);
        expect(result.error.field).toBe('email');
      }
    });

    it('should return failure when name is too long', () => {
      const longName: string = 'a'.repeat(101);

      const result: Result<User, InvalidArgumentError> = User.create({
        email: 'test@example.com',
        name: longName,
      });

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error).toBeInstanceOf(InvalidArgumentError);
        expect(result.error.field).toBe('name');
      }
    });
  });

  describe('restore', () => {
    it('should restore a user from persistence data', () => {
      const createdAt: Date = new Date('2023-01-01');
      const updatedAt: Date = new Date('2023-01-02');

      const user: User = User.restore({
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: 'Test User',
        createdAt,
        updatedAt,
      });

      expect(user.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.createdAt).toBe(createdAt);
      expect(user.updatedAt).toBe(updatedAt);
    });
  });

  describe('updateName', () => {
    it('should update user name and updatedAt', () => {
      const createResult: Result<User, InvalidArgumentError> = User.create({
        email: 'test@example.com',
        name: 'Old Name',
      });

      expect(createResult.isSuccess()).toBe(true);
      if (createResult.isSuccess()) {
        const user: User = createResult.value;
        const updateResult: Result<User, InvalidArgumentError> = user.updateName('New Name');

        expect(updateResult.isSuccess()).toBe(true);
        if (updateResult.isSuccess()) {
          const updatedUser: User = updateResult.value;
          expect(updatedUser.name).toBe('New Name');
          expect(updatedUser.id).toBe(user.id);
          expect(updatedUser.email).toBe(user.email);
          expect(updatedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(user.updatedAt.getTime());
        }
      }
    });

    it('should return failure when new name is empty', () => {
      const createResult: Result<User, InvalidArgumentError> = User.create({
        email: 'test@example.com',
        name: 'Test User',
      });

      expect(createResult.isSuccess()).toBe(true);
      if (createResult.isSuccess()) {
        const user: User = createResult.value;
        const updateResult: Result<User, InvalidArgumentError> = user.updateName('');

        expect(updateResult.isFailure()).toBe(true);
        if (updateResult.isFailure()) {
          expect(updateResult.error).toBeInstanceOf(InvalidArgumentError);
          expect(updateResult.error.field).toBe('name');
        }
      }
    });

    it('should return failure when new name is too long', () => {
      const createResult: Result<User, InvalidArgumentError> = User.create({
        email: 'test@example.com',
        name: 'Test User',
      });

      expect(createResult.isSuccess()).toBe(true);
      if (createResult.isSuccess()) {
        const user: User = createResult.value;
        const longName: string = 'a'.repeat(101);
        const updateResult: Result<User, InvalidArgumentError> = user.updateName(longName);

        expect(updateResult.isFailure()).toBe(true);
        if (updateResult.isFailure()) {
          expect(updateResult.error).toBeInstanceOf(InvalidArgumentError);
          expect(updateResult.error.field).toBe('name');
        }
      }
    });
  });

  describe('updateEmail', () => {
    it('should update user email and updatedAt', () => {
      const createResult: Result<User, InvalidArgumentError> = User.create({
        email: 'old@example.com',
        name: 'Test User',
      });

      expect(createResult.isSuccess()).toBe(true);
      if (createResult.isSuccess()) {
        const user: User = createResult.value;
        const updateResult: Result<User, InvalidArgumentError> = user.updateEmail('new@example.com');

        expect(updateResult.isSuccess()).toBe(true);
        if (updateResult.isSuccess()) {
          const updatedUser: User = updateResult.value;
          expect(updatedUser.email).toBe('new@example.com');
          expect(updatedUser.id).toBe(user.id);
          expect(updatedUser.name).toBe(user.name);
          expect(updatedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(user.updatedAt.getTime());
        }
      }
    });

    it('should return failure when new email is invalid', () => {
      const createResult: Result<User, InvalidArgumentError> = User.create({
        email: 'test@example.com',
        name: 'Test User',
      });

      expect(createResult.isSuccess()).toBe(true);
      if (createResult.isSuccess()) {
        const user: User = createResult.value;
        const updateResult: Result<User, InvalidArgumentError> = user.updateEmail('invalid-email');

        expect(updateResult.isFailure()).toBe(true);
        if (updateResult.isFailure()) {
          expect(updateResult.error).toBeInstanceOf(InvalidArgumentError);
          expect(updateResult.error.field).toBe('email');
        }
      }
    });
  });

  describe('equals', () => {
    it('should return true for users with same id', () => {
      const user1: User = User.restore({
        id: '123',
        email: 'test1@example.com',
        name: 'User 1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const user2: User = User.restore({
        id: '123',
        email: 'test2@example.com',
        name: 'User 2',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(user1.equals(user2)).toBe(true);
    });

    it('should return false for users with different id', () => {
      const user1: User = User.restore({
        id: '123',
        email: 'test@example.com',
        name: 'User 1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const user2: User = User.restore({
        id: '456',
        email: 'test@example.com',
        name: 'User 1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(user1.equals(user2)).toBe(false);
    });
  });
});
`;

fs.writeFileSync('src/core/user/domain/__tests__/User.entity.test.ts', testContent, 'utf8');
console.log('✅ User.entity.test.ts recreated with Result Type pattern');
