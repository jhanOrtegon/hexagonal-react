import { describe, expect, it } from 'vitest';

import { InvalidArgumentError } from '../../errors';
import { Money } from '../Money.vo';

import type { Result } from '../../domain/Result';

describe('Money Value Object', (): void => {
  describe('create', (): void => {
    it('should create a valid Money instance with valid amount and currency', (): void => {
      // Act
      const result: Result<Money, InvalidArgumentError> = Money.create(100.5, 'USD');

      // Assert
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const money: Money = result.value;
        expect(money.getAmount()).toBe(100.5);
        expect(money.getCurrency()).toBe('USD');
      }
    });

    it('should normalize currency to uppercase', (): void => {
      // Act
      const result: Result<Money, InvalidArgumentError> = Money.create(50, 'usd');

      // Assert
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.getCurrency()).toBe('USD');
      }
    });

    it('should round amount to 2 decimal places', (): void => {
      // Act
      const result: Result<Money, InvalidArgumentError> = Money.create(100.999, 'EUR');

      // Assert
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.getAmount()).toBe(101.0);
      }
    });

    it('should accept zero as valid amount', (): void => {
      // Act
      const result: Result<Money, InvalidArgumentError> = Money.create(0, 'COP');

      // Assert
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.getAmount()).toBe(0);
        expect(result.value.isZero()).toBe(true);
      }
    });

    it('should trim currency whitespace', (): void => {
      // Act
      const result: Result<Money, InvalidArgumentError> = Money.create(25, '  EUR  ');

      // Assert
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.getCurrency()).toBe('EUR');
      }
    });
  });

  describe('create - validation errors', (): void => {
    it('should fail with negative amount', (): void => {
      // Act
      const result: Result<Money, InvalidArgumentError> = Money.create(-10, 'USD');

      // Assert
      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error).toBeInstanceOf(InvalidArgumentError);
        expect(result.error.field).toBe('amount');
        expect(result.error.reason).toContain('cannot be negative');
      }
    });

    it('should fail with NaN amount', (): void => {
      // Act
      const result: Result<Money, InvalidArgumentError> = Money.create(NaN, 'USD');

      // Assert
      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.field).toBe('amount');
        expect(result.error.reason).toContain('valid number');
      }
    });

    it('should fail with infinite amount', (): void => {
      // Act
      const result: Result<Money, InvalidArgumentError> = Money.create(Infinity, 'USD');

      // Assert
      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.field).toBe('amount');
        expect(result.error.reason).toContain('finite number');
      }
    });

    it('should fail with empty currency', (): void => {
      // Act
      const result: Result<Money, InvalidArgumentError> = Money.create(100, '');

      // Assert
      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.field).toBe('currency');
        expect(result.error.reason).toContain('cannot be empty');
      }
    });

    it('should fail with whitespace-only currency', (): void => {
      // Act
      const result: Result<Money, InvalidArgumentError> = Money.create(100, '   ');

      // Assert
      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.field).toBe('currency');
        expect(result.error.reason).toContain('cannot be empty');
      }
    });

    it('should fail with invalid currency format (too short)', (): void => {
      // Act
      const result: Result<Money, InvalidArgumentError> = Money.create(100, 'US');

      // Assert
      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.field).toBe('currency');
        expect(result.error.reason).toContain('ISO 4217');
      }
    });

    it('should fail with invalid currency format (too long)', (): void => {
      // Act
      const result: Result<Money, InvalidArgumentError> = Money.create(100, 'USDD');

      // Assert
      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.field).toBe('currency');
        expect(result.error.reason).toContain('ISO 4217');
      }
    });

    it('should fail with invalid currency format (numbers)', (): void => {
      // Act
      const result: Result<Money, InvalidArgumentError> = Money.create(100, '123');

      // Assert
      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.field).toBe('currency');
        expect(result.error.reason).toContain('ISO 4217');
      }
    });
  });

  describe('equals', (): void => {
    it('should return true for equal Money instances', (): void => {
      // Arrange
      const money1Result: Result<Money, InvalidArgumentError> = Money.create(100, 'USD');
      const money2Result: Result<Money, InvalidArgumentError> = Money.create(100, 'USD');

      // Assert
      expect(money1Result.isSuccess()).toBe(true);
      expect(money2Result.isSuccess()).toBe(true);
      if (money1Result.isSuccess() && money2Result.isSuccess()) {
        expect(money1Result.value.equals(money2Result.value)).toBe(true);
      }
    });

    it('should return false for different amounts', (): void => {
      // Arrange
      const money1Result: Result<Money, InvalidArgumentError> = Money.create(100, 'USD');
      const money2Result: Result<Money, InvalidArgumentError> = Money.create(200, 'USD');

      // Assert
      if (money1Result.isSuccess() && money2Result.isSuccess()) {
        expect(money1Result.value.equals(money2Result.value)).toBe(false);
      }
    });

    it('should return false for different currencies', (): void => {
      // Arrange
      const money1Result: Result<Money, InvalidArgumentError> = Money.create(100, 'USD');
      const money2Result: Result<Money, InvalidArgumentError> = Money.create(100, 'EUR');

      // Assert
      if (money1Result.isSuccess() && money2Result.isSuccess()) {
        expect(money1Result.value.equals(money2Result.value)).toBe(false);
      }
    });
  });

  describe('add', (): void => {
    it('should add two Money instances with same currency', (): void => {
      // Arrange
      const money1Result: Result<Money, InvalidArgumentError> = Money.create(100, 'USD');
      const money2Result: Result<Money, InvalidArgumentError> = Money.create(50, 'USD');

      // Act & Assert
      if (money1Result.isSuccess() && money2Result.isSuccess()) {
        const result: Result<Money, InvalidArgumentError> = money1Result.value.add(
          money2Result.value
        );

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          expect(result.value.getAmount()).toBe(150);
          expect(result.value.getCurrency()).toBe('USD');
        }
      }
    });

    it('should fail to add Money instances with different currencies', (): void => {
      // Arrange
      const money1Result: Result<Money, InvalidArgumentError> = Money.create(100, 'USD');
      const money2Result: Result<Money, InvalidArgumentError> = Money.create(50, 'EUR');

      // Act & Assert
      if (money1Result.isSuccess() && money2Result.isSuccess()) {
        const result: Result<Money, InvalidArgumentError> = money1Result.value.add(
          money2Result.value
        );

        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
          expect(result.error.field).toBe('currency');
          expect(result.error.reason).toContain('different currencies');
        }
      }
    });
  });

  describe('subtract', (): void => {
    it('should subtract two Money instances with same currency', (): void => {
      // Arrange
      const money1Result: Result<Money, InvalidArgumentError> = Money.create(100, 'USD');
      const money2Result: Result<Money, InvalidArgumentError> = Money.create(30, 'USD');

      // Act & Assert
      if (money1Result.isSuccess() && money2Result.isSuccess()) {
        const result: Result<Money, InvalidArgumentError> = money1Result.value.subtract(
          money2Result.value
        );

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          expect(result.value.getAmount()).toBe(70);
          expect(result.value.getCurrency()).toBe('USD');
        }
      }
    });

    it('should fail when result is negative', (): void => {
      // Arrange
      const money1Result: Result<Money, InvalidArgumentError> = Money.create(50, 'USD');
      const money2Result: Result<Money, InvalidArgumentError> = Money.create(100, 'USD');

      // Act & Assert
      if (money1Result.isSuccess() && money2Result.isSuccess()) {
        const result: Result<Money, InvalidArgumentError> = money1Result.value.subtract(
          money2Result.value
        );

        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
          expect(result.error.field).toBe('amount');
          expect(result.error.reason).toContain('negative');
        }
      }
    });

    it('should fail to subtract Money instances with different currencies', (): void => {
      // Arrange
      const money1Result: Result<Money, InvalidArgumentError> = Money.create(100, 'USD');
      const money2Result: Result<Money, InvalidArgumentError> = Money.create(30, 'EUR');

      // Act & Assert
      if (money1Result.isSuccess() && money2Result.isSuccess()) {
        const result: Result<Money, InvalidArgumentError> = money1Result.value.subtract(
          money2Result.value
        );

        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
          expect(result.error.field).toBe('currency');
          expect(result.error.reason).toContain('different currencies');
        }
      }
    });
  });

  describe('multiply', (): void => {
    it('should multiply Money by a positive factor', (): void => {
      // Arrange
      const moneyResult: Result<Money, InvalidArgumentError> = Money.create(100, 'USD');

      // Act & Assert
      if (moneyResult.isSuccess()) {
        const result: Result<Money, InvalidArgumentError> = moneyResult.value.multiply(2);

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          expect(result.value.getAmount()).toBe(200);
          expect(result.value.getCurrency()).toBe('USD');
        }
      }
    });

    it('should multiply Money by zero', (): void => {
      // Arrange
      const moneyResult: Result<Money, InvalidArgumentError> = Money.create(100, 'USD');

      // Act & Assert
      if (moneyResult.isSuccess()) {
        const result: Result<Money, InvalidArgumentError> = moneyResult.value.multiply(0);

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          expect(result.value.getAmount()).toBe(0);
          expect(result.value.isZero()).toBe(true);
        }
      }
    });

    it('should fail when multiplying by NaN', (): void => {
      // Arrange
      const moneyResult: Result<Money, InvalidArgumentError> = Money.create(100, 'USD');

      // Act & Assert
      if (moneyResult.isSuccess()) {
        const result: Result<Money, InvalidArgumentError> = moneyResult.value.multiply(NaN);

        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
          expect(result.error.field).toBe('factor');
        }
      }
    });
  });

  describe('comparison methods', (): void => {
    it('should correctly compare greater than', (): void => {
      // Arrange
      const money1Result: Result<Money, InvalidArgumentError> = Money.create(100, 'USD');
      const money2Result: Result<Money, InvalidArgumentError> = Money.create(50, 'USD');

      // Assert
      if (money1Result.isSuccess() && money2Result.isSuccess()) {
        expect(money1Result.value.isGreaterThan(money2Result.value)).toBe(true);
        expect(money2Result.value.isGreaterThan(money1Result.value)).toBe(false);
      }
    });

    it('should correctly compare less than', (): void => {
      // Arrange
      const money1Result: Result<Money, InvalidArgumentError> = Money.create(50, 'USD');
      const money2Result: Result<Money, InvalidArgumentError> = Money.create(100, 'USD');

      // Assert
      if (money1Result.isSuccess() && money2Result.isSuccess()) {
        expect(money1Result.value.isLessThan(money2Result.value)).toBe(true);
        expect(money2Result.value.isLessThan(money1Result.value)).toBe(false);
      }
    });

    it('should throw when comparing different currencies', (): void => {
      // Arrange
      const money1Result: Result<Money, InvalidArgumentError> = Money.create(100, 'USD');
      const money2Result: Result<Money, InvalidArgumentError> = Money.create(50, 'EUR');

      // Assert
      if (money1Result.isSuccess() && money2Result.isSuccess()) {
        expect((): boolean => money1Result.value.isGreaterThan(money2Result.value)).toThrow(
          'different currencies'
        );
      }
    });
  });

  describe('utility methods', (): void => {
    it('should correctly identify zero amount', (): void => {
      // Arrange
      const zeroResult: Result<Money, InvalidArgumentError> = Money.create(0, 'USD');
      const nonZeroResult: Result<Money, InvalidArgumentError> = Money.create(100, 'USD');

      // Assert
      if (zeroResult.isSuccess() && nonZeroResult.isSuccess()) {
        expect(zeroResult.value.isZero()).toBe(true);
        expect(nonZeroResult.value.isZero()).toBe(false);
      }
    });

    it('should convert to string with 2 decimal places', (): void => {
      // Arrange
      const moneyResult: Result<Money, InvalidArgumentError> = Money.create(100.5, 'USD');

      // Assert
      if (moneyResult.isSuccess()) {
        expect(moneyResult.value.toString()).toBe('100.50 USD');
      }
    });

    it('should serialize to JSON correctly', (): void => {
      // Arrange
      const moneyResult: Result<Money, InvalidArgumentError> = Money.create(100.99, 'EUR');

      // Assert
      if (moneyResult.isSuccess()) {
        const json: { readonly amount: number; readonly currency: string } =
          moneyResult.value.toJSON();
        expect(json).toEqual({ amount: 100.99, currency: 'EUR' });
      }
    });
  });
});
