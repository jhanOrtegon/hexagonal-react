import { describe, it, expect, vi, beforeEach } from 'vitest';

import { User } from '../../domain/User.entity';
import { UserEmailAlreadyExistsError } from '../../domain/User.errors';
import { CreateUser } from '../usecases/CreateUser.usecase';

import type { CreateUserDTO } from '../dtos/CreateUser.dto';
import type { UserRepository } from '../../domain/types/repository.types';

describe('CreateUser UseCase', () => {
  let mockRepository: UserRepository;
  let useCase: CreateUser;

  beforeEach((): void => {
    // Crear mock repository con todas las funciones
    mockRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
      existsByEmail: vi.fn().mockResolvedValue(false),
      login: vi.fn(),
    };

    useCase = new CreateUser(mockRepository);
  });

  describe('Happy Path', () => {
    it('should create user successfully with valid data', async (): Promise<void> => {
      // Arrange
      const dto: CreateUserDTO = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const saveSpy: typeof mockRepository.save = vi
        .fn()
        .mockImplementation((user: User) => Promise.resolve(user));
      mockRepository.save = saveSpy;

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('Test User');
      expect(typeof result.createdAt).toBe('string');
      expect(typeof result.updatedAt).toBe('string');

      expect(mockRepository.existsByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockRepository.existsByEmail).toHaveBeenCalledTimes(1);
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });

    it('should normalize email to lowercase', async (): Promise<void> => {
      // Arrange
      const dto: CreateUserDTO = {
        email: 'TEST@EXAMPLE.COM',
        name: 'Test User',
      };

      const saveSpy: typeof mockRepository.save = vi
        .fn()
        .mockImplementation((user: User) => Promise.resolve(user));
      mockRepository.save = saveSpy;

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.email).toBe('test@example.com');
    });

    it('should trim whitespace from email and name', async (): Promise<void> => {
      // Arrange
      const dto: CreateUserDTO = {
        email: '  test@example.com  ',
        name: '  Test User  ',
      };

      const saveSpy: typeof mockRepository.save = vi
        .fn()
        .mockImplementation((user: User) => Promise.resolve(user));
      mockRepository.save = saveSpy;

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('Test User');
    });

    it('should generate unique UUID for each user', async (): Promise<void> => {
      // Arrange
      const dto: CreateUserDTO = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const saveSpy: typeof mockRepository.save = vi
        .fn()
        .mockImplementation((user: User) => Promise.resolve(user));
      mockRepository.save = saveSpy;

      // Act
      const result1 = await useCase.execute(dto);
      const result2 = await useCase.execute(dto);

      // Assert
      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('Error Cases', () => {
    it('should throw UserEmailAlreadyExistsError when email exists', async (): Promise<void> => {
      // Arrange
      const dto: CreateUserDTO = {
        email: 'existing@example.com',
        name: 'Test User',
      };

      const existsByEmailSpy: typeof mockRepository.existsByEmail = vi.fn().mockResolvedValue(true);
      mockRepository.existsByEmail = existsByEmailSpy;

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(UserEmailAlreadyExistsError);
      await expect(useCase.execute(dto)).rejects.toThrow(
        'User with email existing@example.com already exists'
      );

      expect(existsByEmailSpy).toHaveBeenCalledWith('existing@example.com');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async (): Promise<void> => {
      // Arrange
      const dto: CreateUserDTO = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const saveSpy: typeof mockRepository.save = vi
        .fn()
        .mockRejectedValue(new Error('Database connection failed'));
      mockRepository.save = saveSpy;

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow('Database connection failed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in name', async (): Promise<void> => {
      // Arrange
      const dto: CreateUserDTO = {
        email: 'test@example.com',
        name: 'Test User-Öñez 123',
      };

      const saveSpy: typeof mockRepository.save = vi
        .fn()
        .mockImplementation((user: User) => Promise.resolve(user));
      mockRepository.save = saveSpy;

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.name).toBe('Test User-Öñez 123');
    });

    it('should handle international email domains', async (): Promise<void> => {
      // Arrange
      const dto: CreateUserDTO = {
        email: 'test@example.co.uk',
        name: 'Test User',
      };

      const saveSpy: typeof mockRepository.save = vi
        .fn()
        .mockImplementation((user: User) => Promise.resolve(user));
      mockRepository.save = saveSpy;

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.email).toBe('test@example.co.uk');
    });
  });
});
