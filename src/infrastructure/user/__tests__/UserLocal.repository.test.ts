import { type Result } from '../../../core/shared/domain/Result';
import type { InvalidArgumentError } from '../../../core/shared/errors';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { User } from '../../../core/user/domain/User.entity';
import { UserLocalRepository } from '../UserLocal.repository';

describe('UserLocalRepository - Integration Tests', () => {
  let repository: UserLocalRepository;

  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
    repository = new UserLocalRepository();
  });

  afterEach(() => {
    // Limpiar después de cada test
    localStorage.clear();
  });

  describe('save', () => {
    it('should save a new user to localStorage', async () => {
      const userResult: Result<User, InvalidArgumentError> = User.create({
        email: 'test@example.com',
        name: 'Test User',
      });
      if (userResult.isFailure()) {
        throw userResult.error;
      }
      const user: User = userResult.value;

      const savedUser: User = await repository.save(user);

      expect(savedUser.id).toBe(user.id);
      expect(savedUser.email).toBe('test@example.com');
      expect(savedUser.name).toBe('Test User');

      // Verificar que se guardó en localStorage
      const stored: string | null = localStorage.getItem('hexagonal-tdd:users');
      expect(stored).not.toBeNull();

      if (stored !== null) {
        const parsed: unknown = JSON.parse(stored);
        expect(Array.isArray(parsed)).toBe(true);
        expect((parsed as unknown[]).length).toBe(1);
      }
    });

    it('should update an existing user in localStorage', async () => {
      const userResult: Result<User, InvalidArgumentError> = User.create({
        email: 'test@example.com',
        name: 'Test User',
      });
      if (userResult.isFailure()) {
        throw userResult.error;
      }
      const user: User = userResult.value;

      await repository.save(user);

      const updatedResult: Result<User, InvalidArgumentError> = user.updateName('Updated Name');
      if (updatedResult.isFailure()) {
        throw updatedResult.error;
      }
      const updatedUser: User = updatedResult.value;
      const savedUser: User = await repository.save(updatedUser);

      expect(savedUser.name).toBe('Updated Name');

      // Verificar que solo hay un usuario
      const stored: string | null = localStorage.getItem('hexagonal-tdd:users');
      if (stored !== null) {
        const parsed: unknown = JSON.parse(stored);
        expect((parsed as unknown[]).length).toBe(1);
      }
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const userResult: Result<User, InvalidArgumentError> = User.create({
        email: 'test@example.com',
        name: 'Test User',
      });
      if (userResult.isFailure()) {
        throw userResult.error;
      }
      const user: User = userResult.value;

      await repository.save(user);

      const foundUser: User | null = await repository.findById(user.id);

      expect(foundUser).not.toBeNull();
      expect(foundUser?.id).toBe(user.id);
      expect(foundUser?.email).toBe('test@example.com');
      expect(foundUser?.name).toBe('Test User');
    });

    it('should return null when user not found', async () => {
      const foundUser: User | null = await repository.findById('non-existent-id');

      expect(foundUser).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const userResult: Result<User, InvalidArgumentError> = User.create({
        email: 'test@example.com',
        name: 'Test User',
      });
      if (userResult.isFailure()) {
        throw userResult.error;
      }
      const user: User = userResult.value;

      await repository.save(user);

      const foundUser: User | null = await repository.findByEmail('test@example.com');

      expect(foundUser).not.toBeNull();
      expect(foundUser?.email).toBe('test@example.com');
    });

    it('should be case-insensitive', async () => {
      const userResult: Result<User, InvalidArgumentError> = User.create({
        email: 'test@example.com',
        name: 'Test User',
      });
      if (userResult.isFailure()) {
        throw userResult.error;
      }
      const user: User = userResult.value;

      await repository.save(user);

      const foundUser: User | null = await repository.findByEmail('TEST@EXAMPLE.COM');

      expect(foundUser).not.toBeNull();
      expect(foundUser?.email).toBe('test@example.com');
    });

    it('should return null when user not found', async () => {
      const foundUser: User | null = await repository.findByEmail('nonexistent@example.com');

      expect(foundUser).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const user1Result: Result<User, InvalidArgumentError> = User.create({
        email: 'user1@example.com',
        name: 'User One',
      });
      if (user1Result.isFailure()) {
        throw user1Result.error;
      }
      const user1: User = user1Result.value;

      const user2Result: Result<User, InvalidArgumentError> = User.create({
        email: 'user2@example.com',
        name: 'User Two',
      });
      if (user2Result.isFailure()) {
        throw user2Result.error;
      }
      const user2: User = user2Result.value;

      await repository.save(user1);
      await repository.save(user2);

      const users: User[] = await repository.findAll();

      expect(users).toHaveLength(2);
      expect(users.some((u: User) => u.email === 'user1@example.com')).toBe(true);
      expect(users.some((u: User) => u.email === 'user2@example.com')).toBe(true);
    });

    it('should filter by name', async () => {
      const user1Result: Result<User, InvalidArgumentError> = User.create({
        email: 'user1@example.com',
        name: 'John Doe',
      });
      if (user1Result.isFailure()) {
        throw user1Result.error;
      }
      const user1: User = user1Result.value;

      const user2Result: Result<User, InvalidArgumentError> = User.create({
        email: 'user2@example.com',
        name: 'Jane Smith',
      });
      if (user2Result.isFailure()) {
        throw user2Result.error;
      }
      const user2: User = user2Result.value;

      await repository.save(user1);
      await repository.save(user2);

      const users: User[] = await repository.findAll({ name: 'john' });

      expect(users).toHaveLength(1);
      expect(users[0]?.name).toBe('John Doe');
    });

    it('should filter by email', async () => {
      const user1Result: Result<User, InvalidArgumentError> = User.create({
        email: 'john@example.com',
        name: 'John Doe',
      });
      if (user1Result.isFailure()) {
        throw user1Result.error;
      }
      const user1: User = user1Result.value;

      const user2Result: Result<User, InvalidArgumentError> = User.create({
        email: 'jane@example.com',
        name: 'Jane Smith',
      });
      if (user2Result.isFailure()) {
        throw user2Result.error;
      }
      const user2: User = user2Result.value;

      await repository.save(user1);
      await repository.save(user2);

      const users: User[] = await repository.findAll({ email: 'jane' });

      expect(users).toHaveLength(1);
      expect(users[0]?.email).toBe('jane@example.com');
    });

    it('should return empty array when no users exist', async () => {
      const users: User[] = await repository.findAll();

      expect(users).toHaveLength(0);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const userResult: Result<User, InvalidArgumentError> = User.create({
        email: 'test@example.com',
        name: 'Test User',
      });
      if (userResult.isFailure()) {
        throw userResult.error;
      }
      const user: User = userResult.value;

      await repository.save(user);

      await repository.delete(user.id);

      const foundUser: User | null = await repository.findById(user.id);
      expect(foundUser).toBeNull();
    });

    it('should not throw error when deleting non-existent user', async () => {
      await expect(repository.delete('non-existent-id')).resolves.toBeUndefined();
    });
  });

  describe('exists', () => {
    it('should return true when user exists', async () => {
      const userResult: Result<User, InvalidArgumentError> = User.create({
        email: 'test@example.com',
        name: 'Test User',
      });
      if (userResult.isFailure()) {
        throw userResult.error;
      }
      const user: User = userResult.value;

      await repository.save(user);

      const exists: boolean = await repository.exists(user.id);

      expect(exists).toBe(true);
    });

    it('should return false when user does not exist', async () => {
      const exists: boolean = await repository.exists('non-existent-id');

      expect(exists).toBe(false);
    });
  });

  describe('existsByEmail', () => {
    it('should return true when user with email exists', async () => {
      const userResult: Result<User, InvalidArgumentError> = User.create({
        email: 'test@example.com',
        name: 'Test User',
      });
      if (userResult.isFailure()) {
        throw userResult.error;
      }
      const user: User = userResult.value;

      await repository.save(user);

      const exists: boolean = await repository.existsByEmail('test@example.com');

      expect(exists).toBe(true);
    });

    it('should be case-insensitive', async () => {
      const userResult: Result<User, InvalidArgumentError> = User.create({
        email: 'test@example.com',
        name: 'Test User',
      });
      if (userResult.isFailure()) {
        throw userResult.error;
      }
      const user: User = userResult.value;

      await repository.save(user);

      const exists: boolean = await repository.existsByEmail('TEST@EXAMPLE.COM');

      expect(exists).toBe(true);
    });

    it('should return false when user does not exist', async () => {
      const exists: boolean = await repository.existsByEmail('nonexistent@example.com');

      expect(exists).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all users from localStorage', async () => {
      const userResult: Result<User, InvalidArgumentError> = User.create({
        email: 'test@example.com',
        name: 'Test User',
      });
      if (userResult.isFailure()) {
        throw userResult.error;
      }
      const user: User = userResult.value;

      await repository.save(user);

      repository.clear();

      const users: User[] = await repository.findAll();
      expect(users).toHaveLength(0);

      const stored: string | null = localStorage.getItem('hexagonal-tdd:users');
      expect(stored).toBeNull();
    });
  });

  describe('localStorage persistence', () => {
    it('should persist data across repository instances', async () => {
      const repository1: UserLocalRepository = new UserLocalRepository();
      const userResult: Result<User, InvalidArgumentError> = User.create({
        email: 'test@example.com',
        name: 'Test User',
      });
      if (userResult.isFailure()) {
        throw userResult.error;
      }
      const user: User = userResult.value;

      await repository1.save(user);

      // Crear nueva instancia del repositorio
      const repository2: UserLocalRepository = new UserLocalRepository();
      const foundUser: User | null = await repository2.findById(user.id);

      expect(foundUser).not.toBeNull();
      expect(foundUser?.id).toBe(user.id);
    });
  });
});
