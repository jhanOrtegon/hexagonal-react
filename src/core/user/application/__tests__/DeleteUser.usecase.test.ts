import { describe, it, expect, vi, beforeEach } from 'vitest';

import { UserNotFoundError } from '../../domain/User.errors';
import { DeleteUser } from '../usecases/DeleteUser.usecase';

import type { UserRepository } from '../../domain/types/repository.types';

describe('DeleteUser UseCase', () => {
  let mockRepository: UserRepository;
  let useCase: DeleteUser;

  beforeEach((): void => {
    mockRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
      exists: vi.fn().mockResolvedValue(true),
      existsByEmail: vi.fn(),
    };

    useCase = new DeleteUser(mockRepository);
  });

  describe('Happy Path', () => {
    it('should delete existing user successfully', async (): Promise<void> => {
      // Arrange
      const userId: string = '123';

      // Act
      await useCase.execute(userId);

      // Assert
      expect(mockRepository.exists).toHaveBeenCalledWith(userId);
      expect(mockRepository.delete).toHaveBeenCalledWith(userId);
      expect(mockRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should call exists before delete', async (): Promise<void> => {
      // Arrange
      const userId: string = '123';
      const callOrder: string[] = [];

      const existsSpy: typeof mockRepository.exists = vi.fn().mockImplementation(() => {
        callOrder.push('exists');
        return Promise.resolve(true);
      });

      const deleteSpy: typeof mockRepository.delete = vi.fn().mockImplementation(() => {
        callOrder.push('delete');
        return Promise.resolve(undefined);
      });

      mockRepository.exists = existsSpy;
      mockRepository.delete = deleteSpy;

      // Act
      await useCase.execute(userId);

      // Assert
      expect(callOrder).toEqual(['exists', 'delete']);
    });
  });

  describe('Error Cases', () => {
    it('should throw UserNotFoundError when user does not exist', async (): Promise<void> => {
      // Arrange
      const userId: string = '999';

      const existsSpy: typeof mockRepository.exists = vi.fn().mockResolvedValue(false);
      mockRepository.exists = existsSpy;

      // Act & Assert
      await expect(useCase.execute(userId)).rejects.toThrow(UserNotFoundError);
      await expect(useCase.execute(userId)).rejects.toThrow('User with id 999 not found');

      expect(existsSpy).toHaveBeenCalledWith(userId);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should propagate repository errors from exists', async (): Promise<void> => {
      // Arrange
      const userId: string = '123';

      const existsSpy: typeof mockRepository.exists = vi
        .fn()
        .mockRejectedValue(new Error('Database connection failed'));
      mockRepository.exists = existsSpy;

      // Act & Assert
      await expect(useCase.execute(userId)).rejects.toThrow('Database connection failed');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should propagate repository errors from delete', async (): Promise<void> => {
      // Arrange
      const userId: string = '123';

      const deleteSpy: typeof mockRepository.delete = vi
        .fn()
        .mockRejectedValue(new Error('Delete operation failed'));
      mockRepository.delete = deleteSpy;

      // Act & Assert
      await expect(useCase.execute(userId)).rejects.toThrow('Delete operation failed');
      expect(mockRepository.exists).toHaveBeenCalledWith(userId);
    });
  });

  describe('Edge Cases', () => {
    it('should handle deletion with special character IDs', async (): Promise<void> => {
      // Arrange
      const userId: string = 'user-123-abc-XYZ';

      // Act
      await useCase.execute(userId);

      // Assert
      expect(mockRepository.exists).toHaveBeenCalledWith(userId);
      expect(mockRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('should handle UUID format IDs', async (): Promise<void> => {
      // Arrange
      const userId: string = '550e8400-e29b-41d4-a716-446655440000';

      // Act
      await useCase.execute(userId);

      // Assert
      expect(mockRepository.exists).toHaveBeenCalledWith(userId);
      expect(mockRepository.delete).toHaveBeenCalledWith(userId);
    });
  });
});
