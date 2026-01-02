import { User } from '../User.entity';
import { InvalidArgumentError } from '../../../shared/errors';

describe('User Entity', () => {
  describe('create', () => {
    it('should create a user instance with valid data', () => {
      const user: User = User.create({
        email: 'test@example.com',
        name: 'Test User',
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should normalize email to lowercase', () => {
      const user: User = User.create({
        email: 'TEST@EXAMPLE.COM',
        name: 'Test User',
      });

      expect(user.email).toBe('test@example.com');
    });

    it('should trim email and name', () => {
      const user: User = User.create({
        email: '  test@example.com  ',
        name: '  Test User  ',
      });

      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
    });

    it('should throw error when email is empty', () => {
      expect(() => {
        User.create({
          email: '',
          name: 'Test User',
        });
      }).toThrow(InvalidArgumentError);
    });

    it('should throw error when name is empty', () => {
      expect(() => {
        User.create({
          email: 'test@example.com',
          name: '',
        });
      }).toThrow(InvalidArgumentError);
    });

    it('should throw error when email format is invalid', () => {
      expect(() => {
        User.create({
          email: 'invalid-email',
          name: 'Test User',
        });
      }).toThrow(InvalidArgumentError);
    });

    it('should throw error when name is too long', () => {
      const longName: string = 'a'.repeat(101);
      
      expect(() => {
        User.create({
          email: 'test@example.com',
          name: longName,
        });
      }).toThrow(InvalidArgumentError);
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
      const user: User = User.create({
        email: 'test@example.com',
        name: 'Old Name',
      });

      const updatedUser: User = user.updateName('New Name');

      expect(updatedUser.name).toBe('New Name');
      expect(updatedUser.id).toBe(user.id);
      expect(updatedUser.email).toBe(user.email);
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(user.updatedAt.getTime());
    });

    it('should throw error when new name is empty', () => {
      const user: User = User.create({
        email: 'test@example.com',
        name: 'Test User',
      });

      expect(() => {
        user.updateName('');
      }).toThrow(InvalidArgumentError);
    });

    it('should throw error when new name is too long', () => {
      const user: User = User.create({
        email: 'test@example.com',
        name: 'Test User',
      });

      const longName: string = 'a'.repeat(101);

      expect(() => {
        user.updateName(longName);
      }).toThrow(InvalidArgumentError);
    });
  });

  describe('updateEmail', () => {
    it('should update user email and updatedAt', () => {
      const user: User = User.create({
        email: 'old@example.com',
        name: 'Test User',
      });

      const updatedUser: User = user.updateEmail('new@example.com');

      expect(updatedUser.email).toBe('new@example.com');
      expect(updatedUser.id).toBe(user.id);
      expect(updatedUser.name).toBe(user.name);
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(user.updatedAt.getTime());
    });

    it('should throw error when new email is invalid', () => {
      const user: User = User.create({
        email: 'test@example.com',
        name: 'Test User',
      });

      expect(() => {
        user.updateEmail('invalid-email');
      }).toThrow(InvalidArgumentError);
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

