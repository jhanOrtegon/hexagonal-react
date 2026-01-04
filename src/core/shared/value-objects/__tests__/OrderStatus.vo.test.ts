import { describe, expect, it } from 'vitest';

import { InvalidArgumentError } from '../../errors';
import { OrderStatus } from '../OrderStatus.vo';

import type { Result } from '../../domain/Result';

describe('OrderStatus Value Object', (): void => {
  describe('create', (): void => {
    it('should create a valid OrderStatus with pending status', (): void => {
      // Act
      const result: Result<OrderStatus, InvalidArgumentError> = OrderStatus.create('pending');

      // Assert
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const status: OrderStatus = result.value;
        expect(status.getValue()).toBe('pending');
        expect(status.isPending()).toBe(true);
      }
    });

    it('should create a valid OrderStatus with completed status', (): void => {
      // Act
      const result: Result<OrderStatus, InvalidArgumentError> = OrderStatus.create('completed');

      // Assert
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.getValue()).toBe('completed');
        expect(result.value.isCompleted()).toBe(true);
      }
    });

    it('should create a valid OrderStatus with cancelled status', (): void => {
      // Act
      const result: Result<OrderStatus, InvalidArgumentError> = OrderStatus.create('cancelled');

      // Assert
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.getValue()).toBe('cancelled');
        expect(result.value.isCancelled()).toBe(true);
      }
    });

    it('should normalize status to lowercase', (): void => {
      // Act
      const result: Result<OrderStatus, InvalidArgumentError> = OrderStatus.create('PENDING');

      // Assert
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.getValue()).toBe('pending');
      }
    });

    it('should trim whitespace from status', (): void => {
      // Act
      const result: Result<OrderStatus, InvalidArgumentError> = OrderStatus.create('  pending  ');

      // Assert
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.getValue()).toBe('pending');
      }
    });
  });

  describe('create - validation errors', (): void => {
    it('should fail with invalid status', (): void => {
      // Act
      const result: Result<OrderStatus, InvalidArgumentError> = OrderStatus.create('invalid');

      // Assert
      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error).toBeInstanceOf(InvalidArgumentError);
        expect(result.error.field).toBe('status');
        expect(result.error.reason).toContain('Invalid status');
      }
    });

    it('should fail with empty status', (): void => {
      // Act
      const result: Result<OrderStatus, InvalidArgumentError> = OrderStatus.create('');

      // Assert
      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.field).toBe('status');
        expect(result.error.reason).toContain('cannot be empty');
      }
    });

    it('should fail with whitespace-only status', (): void => {
      // Act
      const result: Result<OrderStatus, InvalidArgumentError> = OrderStatus.create('   ');

      // Assert
      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.field).toBe('status');
        expect(result.error.reason).toContain('cannot be empty');
      }
    });
  });

  describe('factory methods', (): void => {
    it('should create PENDING status with factory method', (): void => {
      // Act
      const status: OrderStatus = OrderStatus.createPending();

      // Assert
      expect(status.isPending()).toBe(true);
      expect(status.getValue()).toBe('pending');
    });

    it('should create COMPLETED status with factory method', (): void => {
      // Act
      const status: OrderStatus = OrderStatus.createCompleted();

      // Assert
      expect(status.isCompleted()).toBe(true);
      expect(status.getValue()).toBe('completed');
    });

    it('should create CANCELLED status with factory method', (): void => {
      // Act
      const status: OrderStatus = OrderStatus.createCancelled();

      // Assert
      expect(status.isCancelled()).toBe(true);
      expect(status.getValue()).toBe('cancelled');
    });
  });

  describe('equals', (): void => {
    it('should return true for equal OrderStatus instances', (): void => {
      // Arrange
      const status1: OrderStatus = OrderStatus.createPending();
      const status2: OrderStatus = OrderStatus.createPending();

      // Assert
      expect(status1.equals(status2)).toBe(true);
    });

    it('should return false for different OrderStatus instances', (): void => {
      // Arrange
      const status1: OrderStatus = OrderStatus.createPending();
      const status2: OrderStatus = OrderStatus.createCompleted();

      // Assert
      expect(status1.equals(status2)).toBe(false);
    });
  });

  describe('status checks', (): void => {
    it('should correctly identify pending status', (): void => {
      // Arrange
      const status: OrderStatus = OrderStatus.createPending();

      // Assert
      expect(status.isPending()).toBe(true);
      expect(status.isCompleted()).toBe(false);
      expect(status.isCancelled()).toBe(false);
      expect(status.isFinal()).toBe(false);
    });

    it('should correctly identify completed status', (): void => {
      // Arrange
      const status: OrderStatus = OrderStatus.createCompleted();

      // Assert
      expect(status.isPending()).toBe(false);
      expect(status.isCompleted()).toBe(true);
      expect(status.isCancelled()).toBe(false);
      expect(status.isFinal()).toBe(true);
    });

    it('should correctly identify cancelled status', (): void => {
      // Arrange
      const status: OrderStatus = OrderStatus.createCancelled();

      // Assert
      expect(status.isPending()).toBe(false);
      expect(status.isCompleted()).toBe(false);
      expect(status.isCancelled()).toBe(true);
      expect(status.isFinal()).toBe(true);
    });
  });

  describe('canTransitionTo', (): void => {
    it('should allow transition from pending to completed', (): void => {
      // Arrange
      const pending: OrderStatus = OrderStatus.createPending();
      const completed: OrderStatus = OrderStatus.createCompleted();

      // Assert
      expect(pending.canTransitionTo(completed)).toBe(true);
    });

    it('should allow transition from pending to cancelled', (): void => {
      // Arrange
      const pending: OrderStatus = OrderStatus.createPending();
      const cancelled: OrderStatus = OrderStatus.createCancelled();

      // Assert
      expect(pending.canTransitionTo(cancelled)).toBe(true);
    });

    it('should not allow transition from completed to any state', (): void => {
      // Arrange
      const completed: OrderStatus = OrderStatus.createCompleted();
      const pending: OrderStatus = OrderStatus.createPending();
      const cancelled: OrderStatus = OrderStatus.createCancelled();

      // Assert
      expect(completed.canTransitionTo(pending)).toBe(false);
      expect(completed.canTransitionTo(cancelled)).toBe(false);
      expect(completed.canTransitionTo(completed)).toBe(false);
    });

    it('should not allow transition from cancelled to any state', (): void => {
      // Arrange
      const cancelled: OrderStatus = OrderStatus.createCancelled();
      const pending: OrderStatus = OrderStatus.createPending();
      const completed: OrderStatus = OrderStatus.createCompleted();

      // Assert
      expect(cancelled.canTransitionTo(pending)).toBe(false);
      expect(cancelled.canTransitionTo(completed)).toBe(false);
      expect(cancelled.canTransitionTo(cancelled)).toBe(false);
    });

    it('should not allow transition from pending to pending', (): void => {
      // Arrange
      const pending: OrderStatus = OrderStatus.createPending();

      // Assert
      expect(pending.canTransitionTo(pending)).toBe(false);
    });
  });

  describe('transitionTo', (): void => {
    it('should successfully transition from pending to completed', (): void => {
      // Arrange
      const pending: OrderStatus = OrderStatus.createPending();
      const completed: OrderStatus = OrderStatus.createCompleted();

      // Act
      const result: Result<OrderStatus, InvalidArgumentError> = pending.transitionTo(completed);

      // Assert
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.equals(completed)).toBe(true);
      }
    });

    it('should successfully transition from pending to cancelled', (): void => {
      // Arrange
      const pending: OrderStatus = OrderStatus.createPending();
      const cancelled: OrderStatus = OrderStatus.createCancelled();

      // Act
      const result: Result<OrderStatus, InvalidArgumentError> = pending.transitionTo(cancelled);

      // Assert
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.equals(cancelled)).toBe(true);
      }
    });

    it('should fail to transition from completed to pending', (): void => {
      // Arrange
      const completed: OrderStatus = OrderStatus.createCompleted();
      const pending: OrderStatus = OrderStatus.createPending();

      // Act
      const result: Result<OrderStatus, InvalidArgumentError> = completed.transitionTo(pending);

      // Assert
      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.field).toBe('status');
        expect(result.error.reason).toContain('Cannot transition');
        expect(result.error.reason).toContain('completed');
        expect(result.error.reason).toContain('pending');
      }
    });

    it('should fail to transition from cancelled to completed', (): void => {
      // Arrange
      const cancelled: OrderStatus = OrderStatus.createCancelled();
      const completed: OrderStatus = OrderStatus.createCompleted();

      // Act
      const result: Result<OrderStatus, InvalidArgumentError> = cancelled.transitionTo(completed);

      // Assert
      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.field).toBe('status');
        expect(result.error.reason).toContain('Cannot transition');
      }
    });
  });

  describe('getAllowedTransitions', (): void => {
    it('should return allowed transitions for pending status', (): void => {
      // Arrange
      const pending: OrderStatus = OrderStatus.createPending();

      // Act
      const allowed: readonly string[] = pending.getAllowedTransitions();

      // Assert
      expect(allowed).toEqual(['completed', 'cancelled']);
    });

    it('should return empty array for completed status', (): void => {
      // Arrange
      const completed: OrderStatus = OrderStatus.createCompleted();

      // Act
      const allowed: readonly string[] = completed.getAllowedTransitions();

      // Assert
      expect(allowed).toEqual([]);
    });

    it('should return empty array for cancelled status', (): void => {
      // Arrange
      const cancelled: OrderStatus = OrderStatus.createCancelled();

      // Act
      const allowed: readonly string[] = cancelled.getAllowedTransitions();

      // Assert
      expect(allowed).toEqual([]);
    });
  });

  describe('utility methods', (): void => {
    it('should convert to string correctly', (): void => {
      // Arrange
      const pending: OrderStatus = OrderStatus.createPending();

      // Assert
      expect(pending.toString()).toBe('pending');
    });

    it('should serialize to JSON correctly', (): void => {
      // Arrange
      const completed: OrderStatus = OrderStatus.createCompleted();

      // Act
      const json: { readonly status: string } = completed.toJSON();

      // Assert
      expect(json).toEqual({ status: 'completed' });
    });
  });
});
