import { describe, it, expect, vi, beforeEach } from 'vitest';

import { User } from '../../domain/User.entity';
import { UserNotFoundError } from '../../domain/User.errors';
import { GetUserById } from '../usecases/GetUserById.usecase';

import type { UserRepository } from '../../domain/types/repository.types';

describe('GetUserById UseCase', () => {
  let mockRepository: UserRepository;
  let useCase: GetUserById;
  let mockUser: User;

  beforeEach((): void => {
    mockUser = User.restore({
      id: '123',
      email: 'john@example.com',
      name: 'John Doe',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });

    mockRepository = {
      findById: vi.fn().mockResolvedValue(mockUser),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
      existsByEmail: vi.fn(),
      login: vi.fn(),
    };

    useCase = new GetUserById(mockRepository);
  });

  describe('Happy Path', () => {
    it('should return user by id successfully', async (): Promise<void> => {
      // Act
      const result = await useCase.execute('123');

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('123');
      expect(result.email).toBe('john@example.com');
      expect(result.name).toBe('John Doe');
      expect(mockRepository.findById).toHaveBeenCalledWith('123');
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should return user with all DTO properties', async (): Promise<void> => {
      // Act
      const result = await useCase.execute('123');

      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should convert dates to ISO strings in response', async (): Promise<void> => {
      // Act
      const result = await useCase.execute('123');

      // Assert
      expect(typeof result.createdAt).toBe('string');
      expect(typeof result.updatedAt).toBe('string');
      expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(result.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should handle UUID format IDs', async (): Promise<void> => {
      // Arrange
      const uuidUser: User = User.restore({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'uuid@example.com',
        name: 'UUID User',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const findByIdSpy: typeof mockRepository.findById = vi.fn().mockResolvedValue(uuidUser);
      mockRepository.findById = findByIdSpy;

      // Act
      const result = await useCase.execute('550e8400-e29b-41d4-a716-446655440000');

      // Assert
      expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    });
  });

  describe('Error Cases', () => {
    it('should throw UserNotFoundError when user does not exist', async (): Promise<void> => {
      // Arrange
      const findByIdSpy: typeof mockRepository.findById = vi.fn().mockResolvedValue(null);
      mockRepository.findById = findByIdSpy;

      // Act & Assert
      await expect(useCase.execute('999')).rejects.toThrow(UserNotFoundError);
      await expect(useCase.execute('999')).rejects.toThrow('User with id 999 not found');
      expect(findByIdSpy).toHaveBeenCalledWith('999');
    });

    it('should propagate repository errors', async (): Promise<void> => {
      // Arrange
      const findByIdSpy: typeof mockRepository.findById = vi
        .fn()
        .mockRejectedValue(new Error('Database connection failed'));
      mockRepository.findById = findByIdSpy;

      // Act & Assert
      await expect(useCase.execute('123')).rejects.toThrow('Database connection failed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle users with special characters in data', async (): Promise<void> => {
      // Arrange
      const specialUser: User = User.restore({
        id: '123',
        email: 'josé@example.com',
        name: 'José María Öñez-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const findByIdSpy: typeof mockRepository.findById = vi.fn().mockResolvedValue(specialUser);
      mockRepository.findById = findByIdSpy;

      // Act
      const result = await useCase.execute('123');

      // Assert
      expect(result.name).toBe('José María Öñez-123');
      expect(result.email).toBe('josé@example.com');
    });

    it('should handle IDs with special characters', async (): Promise<void> => {
      // Arrange
      const specialId: string = 'user-123-abc-XYZ';
      const specialIdUser: User = User.restore({
        id: specialId,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const findByIdSpy: typeof mockRepository.findById = vi.fn().mockResolvedValue(specialIdUser);
      mockRepository.findById = findByIdSpy;

      // Act
      const result = await useCase.execute(specialId);

      // Assert
      expect(result.id).toBe(specialId);
      expect(findByIdSpy).toHaveBeenCalledWith(specialId);
    });
  });
});
