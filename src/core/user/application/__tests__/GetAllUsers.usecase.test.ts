import { describe, it, expect, vi, beforeEach } from 'vitest';

import { User } from '../../domain/User.entity';
import { GetAllUsers } from '../usecases/GetAllUsers.usecase';

import type { UserFilters } from '../../domain/types/user.types';
import type { UserRepository } from '../../domain/types/repository.types';

describe('GetAllUsers UseCase', () => {
  let mockRepository: UserRepository;
  let useCase: GetAllUsers;
  let mockUsers: User[];

  beforeEach((): void => {
    mockUsers = [
      User.restore({
        id: '1',
        email: 'john@example.com',
        name: 'John Doe',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }),
      User.restore({
        id: '2',
        email: 'jane@example.com',
        name: 'Jane Smith',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      }),
      User.restore({
        id: '3',
        email: 'bob@example.com',
        name: 'Bob Johnson',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      }),
    ];

    mockRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findAll: vi.fn().mockResolvedValue(mockUsers),
      save: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
      existsByEmail: vi.fn(),
      login: vi.fn(),
    };

    useCase = new GetAllUsers(mockRepository);
  });

  describe('Happy Path', () => {
    it('should return all users when no filters provided', async (): Promise<void> => {
      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]?.email).toBe('john@example.com');
      expect(result[1]?.email).toBe('jane@example.com');
      expect(result[2]?.email).toBe('bob@example.com');
      expect(mockRepository.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should return empty array when no users exist', async (): Promise<void> => {
      // Arrange
      const findAllSpy: typeof mockRepository.findAll = vi.fn().mockResolvedValue([]);
      mockRepository.findAll = findAllSpy;

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return users with all DTO properties', async (): Promise<void> => {
      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('email');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('createdAt');
      expect(result[0]).toHaveProperty('updatedAt');
    });

    it('should convert dates to ISO strings in response', async (): Promise<void> => {
      // Act
      const result = await useCase.execute();

      // Assert
      expect(typeof result[0]?.createdAt).toBe('string');
      expect(typeof result[0]?.updatedAt).toBe('string');
      expect(result[0]?.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('With Filters', () => {
    it('should pass filters to repository', async (): Promise<void> => {
      // Arrange
      const filters: UserFilters = {
        name: 'John',
      };

      const filteredUsers: User[] = [mockUsers[0] as User];
      const findAllSpy: typeof mockRepository.findAll = vi.fn().mockResolvedValue(filteredUsers);
      mockRepository.findAll = findAllSpy;

      // Act
      const result = await useCase.execute(filters);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('John Doe');
      expect(findAllSpy).toHaveBeenCalledWith(filters);
    });

    it('should handle email filter', async (): Promise<void> => {
      // Arrange
      const filters: UserFilters = {
        email: 'jane@example.com',
      };

      const filteredUsers: User[] = [mockUsers[1] as User];
      const findAllSpy: typeof mockRepository.findAll = vi.fn().mockResolvedValue(filteredUsers);
      mockRepository.findAll = findAllSpy;

      // Act
      const result = await useCase.execute(filters);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]?.email).toBe('jane@example.com');
    });

    it('should handle multiple filters', async (): Promise<void> => {
      // Arrange
      const filters: UserFilters = {
        name: 'John',
        email: 'john@example.com',
      };

      const filteredUsers: User[] = [mockUsers[0] as User];
      const findAllSpy: typeof mockRepository.findAll = vi.fn().mockResolvedValue(filteredUsers);
      mockRepository.findAll = findAllSpy;

      // Act
      const result = await useCase.execute(filters);

      // Assert
      expect(result).toHaveLength(1);
      expect(findAllSpy).toHaveBeenCalledWith(filters);
    });

    it('should return empty array when filters match no users', async (): Promise<void> => {
      // Arrange
      const filters: UserFilters = {
        name: 'NonExistent',
      };

      const findAllSpy: typeof mockRepository.findAll = vi.fn().mockResolvedValue([]);
      mockRepository.findAll = findAllSpy;

      // Act
      const result = await useCase.execute(filters);

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('Error Cases', () => {
    it('should propagate repository errors', async (): Promise<void> => {
      // Arrange
      const findAllSpy: typeof mockRepository.findAll = vi
        .fn()
        .mockRejectedValue(new Error('Database connection failed'));
      mockRepository.findAll = findAllSpy;

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow('Database connection failed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle large number of users', async (): Promise<void> => {
      // Arrange
      const largeUserList: User[] = Array.from({ length: 1000 }, (_, i: number) =>
        User.restore({
          id: `${i}`,
          email: `user${i}@example.com`,
          name: `User ${i}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      );

      const findAllSpy: typeof mockRepository.findAll = vi.fn().mockResolvedValue(largeUserList);
      mockRepository.findAll = findAllSpy;

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toHaveLength(1000);
    });

    it('should handle users with special characters in names', async (): Promise<void> => {
      // Arrange
      const specialUsers: User[] = [
        User.restore({
          id: '1',
          email: 'test@example.com',
          name: 'José María Öñez-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];

      const findAllSpy: typeof mockRepository.findAll = vi.fn().mockResolvedValue(specialUsers);
      mockRepository.findAll = findAllSpy;

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0]?.name).toBe('José María Öñez-123');
    });
  });
});
