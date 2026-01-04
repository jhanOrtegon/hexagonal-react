import { describe, it, expect, vi, beforeEach } from 'vitest';

import { User } from '../../domain/User.entity';
import { UserNotFoundError } from '../../domain/User.errors';
import { UpdateUser } from '../usecases/UpdateUser.usecase';

import type { UpdateUserDTO } from '../dtos/UpdateUser.dto';
import type { UserRepository } from '../../domain/types/repository.types';

describe('UpdateUser UseCase', () => {
  let mockRepository: UserRepository;
  let useCase: UpdateUser;
  let existingUser: User;

  beforeEach((): void => {
    existingUser = User.restore({
      id: '123',
      email: 'old@example.com',
      name: 'Old Name',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });

    mockRepository = {
      findById: vi.fn().mockResolvedValue(existingUser),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn().mockImplementation((user: User) => Promise.resolve(user)),
      delete: vi.fn(),
      exists: vi.fn(),
      existsByEmail: vi.fn(),
    };

    useCase = new UpdateUser(mockRepository);
  });

  describe('Happy Path', () => {
    it('should update user name', async (): Promise<void> => {
      // Arrange
      const dto: UpdateUserDTO = {
        name: 'New Name',
      };

      // Act
      const result = await useCase.execute('123', dto);

      // Assert
      expect(result.name).toBe('New Name');
      expect(result.email).toBe('old@example.com'); // Email no cambió
      expect(result.id).toBe('123');
      expect(mockRepository.findById).toHaveBeenCalledWith('123');
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should update user email', async (): Promise<void> => {
      // Arrange
      const dto: UpdateUserDTO = {
        email: 'new@example.com',
      };

      // Act
      const result = await useCase.execute('123', dto);

      // Assert
      expect(result.email).toBe('new@example.com');
      expect(result.name).toBe('Old Name'); // Name no cambió
    });

    it('should update both name and email', async (): Promise<void> => {
      // Arrange
      const dto: UpdateUserDTO = {
        name: 'New Name',
        email: 'new@example.com',
      };

      // Act
      const result = await useCase.execute('123', dto);

      // Assert
      expect(result.name).toBe('New Name');
      expect(result.email).toBe('new@example.com');
    });

    it('should update updatedAt timestamp', async (): Promise<void> => {
      // Arrange
      const dto: UpdateUserDTO = {
        name: 'New Name',
      };

      const originalUpdatedAt = existingUser.updatedAt.toISOString();

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve: (value: unknown) => void) => setTimeout(resolve, 10));

      // Act
      const result = await useCase.execute('123', dto);

      // Assert
      expect(new Date(result.updatedAt).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      );
    });

    it('should preserve createdAt timestamp', async (): Promise<void> => {
      // Arrange
      const dto: UpdateUserDTO = {
        name: 'New Name',
      };

      // Act
      const result = await useCase.execute('123', dto);

      // Assert
      expect(result.createdAt).toBe(existingUser.createdAt.toISOString());
    });

    it('should trim whitespace from inputs', async (): Promise<void> => {
      // Arrange
      const dto: UpdateUserDTO = {
        name: '  New Name  ',
        email: '  new@example.com  ',
      };

      // Act
      const result = await useCase.execute('123', dto);

      // Assert
      expect(result.name).toBe('New Name');
      expect(result.email).toBe('new@example.com');
    });

    it('should normalize email to lowercase', async (): Promise<void> => {
      // Arrange
      const dto: UpdateUserDTO = {
        email: 'NEW@EXAMPLE.COM',
      };

      // Act
      const result = await useCase.execute('123', dto);

      // Assert
      expect(result.email).toBe('new@example.com');
    });
  });

  describe('Error Cases', () => {
    it('should throw UserNotFoundError when user does not exist', async (): Promise<void> => {
      // Arrange
      const findByIdSpy: typeof mockRepository.findById = vi.fn().mockResolvedValue(null);
      mockRepository.findById = findByIdSpy;

      const dto: UpdateUserDTO = {
        name: 'New Name',
      };

      // Act & Assert
      await expect(useCase.execute('999', dto)).rejects.toThrow(UserNotFoundError);
      await expect(useCase.execute('999', dto)).rejects.toThrow('User with id 999 not found');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async (): Promise<void> => {
      // Arrange
      const dto: UpdateUserDTO = {
        name: 'New Name',
      };

      const saveSpy: typeof mockRepository.save = vi
        .fn()
        .mockRejectedValue(new Error('Database error'));
      mockRepository.save = saveSpy;

      // Act & Assert
      await expect(useCase.execute('123', dto)).rejects.toThrow('Database error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty DTO (no changes)', async (): Promise<void> => {
      // Arrange
      const dto: UpdateUserDTO = {};

      // Act
      const result = await useCase.execute('123', dto);

      // Assert
      expect(result.name).toBe('Old Name');
      expect(result.email).toBe('old@example.com');
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should handle special characters in name', async (): Promise<void> => {
      // Arrange
      const dto: UpdateUserDTO = {
        name: 'José María Öñez-123',
      };

      // Act
      const result = await useCase.execute('123', dto);

      // Assert
      expect(result.name).toBe('José María Öñez-123');
    });
  });
});
