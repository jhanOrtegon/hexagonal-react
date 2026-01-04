import { fail, ok } from '../domain/Result';
import { InvalidArgumentError } from '../errors';

import type { Result } from '../domain/Result';

/**
 * Value Object: Money
 * Representa un valor monetario con cantidad y moneda
 */
export class Money {
  private readonly amount: number;
  private readonly currency: string;

  private constructor(amount: number, currency: string) {
    this.amount = amount;
    this.currency = currency;
  }

  /**
   * Crea una nueva instancia de Money
   * @param amount - Cantidad (debe ser >= 0)
   * @param currency - Código de moneda (ISO 4217: USD, EUR, COP, etc.)
   */
  public static create(amount: number, currency: string): Result<Money, InvalidArgumentError> {
    // Validar que amount sea un número válido
    if (typeof amount !== 'number' || isNaN(amount)) {
      return fail(
        new InvalidArgumentError(
          'amount',
          `Amount must be a valid number, received: ${String(amount)}`
        )
      );
    }

    // Validar que amount no sea negativo
    if (amount < 0) {
      return fail(
        new InvalidArgumentError('amount', `Amount cannot be negative, received: ${String(amount)}`)
      );
    }

    // Validar que amount no sea infinito
    if (!isFinite(amount)) {
      return fail(new InvalidArgumentError('amount', 'Amount must be a finite number'));
    }

    // Validar que currency sea string y no esté vacío
    if (typeof currency !== 'string' || currency.trim().length === 0) {
      return fail(new InvalidArgumentError('currency', 'Currency cannot be empty'));
    }

    // Validar que currency sea código ISO 4217 válido (3 letras mayúsculas)
    const normalizedCurrency: string = currency.trim().toUpperCase();

    if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
      return fail(
        new InvalidArgumentError(
          'currency',
          `Currency must be a valid ISO 4217 code (3 uppercase letters), received: ${currency}`
        )
      );
    }

    // Redondear a 2 decimales para evitar problemas de precisión
    const roundedAmount: number = Math.round(amount * 100) / 100;

    return ok(new Money(roundedAmount, normalizedCurrency));
  }

  /**
   * Obtiene la cantidad
   */
  public getAmount(): number {
    return this.amount;
  }

  /**
   * Obtiene la moneda
   */
  public getCurrency(): string {
    return this.currency;
  }

  /**
   * Compara dos instancias de Money por valor
   */
  public equals(other: Money): boolean {
    if (!(other instanceof Money)) {
      return false;
    }

    return this.amount === other.amount && this.currency === other.currency;
  }

  /**
   * Suma dos valores monetarios (deben tener la misma moneda)
   */
  public add(other: Money): Result<Money, InvalidArgumentError> {
    if (this.currency !== other.currency) {
      return fail(
        new InvalidArgumentError(
          'currency',
          `Cannot add different currencies: ${this.currency} and ${other.currency}`
        )
      );
    }

    return Money.create(this.amount + other.amount, this.currency);
  }

  /**
   * Resta dos valores monetarios (deben tener la misma moneda)
   */
  public subtract(other: Money): Result<Money, InvalidArgumentError> {
    if (this.currency !== other.currency) {
      return fail(
        new InvalidArgumentError(
          'currency',
          `Cannot subtract different currencies: ${this.currency} and ${other.currency}`
        )
      );
    }

    return Money.create(this.amount - other.amount, this.currency);
  }

  /**
   * Multiplica el valor monetario por un factor
   */
  public multiply(factor: number): Result<Money, InvalidArgumentError> {
    if (typeof factor !== 'number' || isNaN(factor) || !isFinite(factor)) {
      return fail(new InvalidArgumentError('factor', 'Factor must be a valid finite number'));
    }

    return Money.create(this.amount * factor, this.currency);
  }

  /**
   * Compara si este Money es mayor que otro
   */
  public isGreaterThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error(
        `Cannot compare different currencies: ${this.currency} and ${other.currency}`
      );
    }

    return this.amount > other.amount;
  }

  /**
   * Compara si este Money es menor que otro
   */
  public isLessThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error(
        `Cannot compare different currencies: ${this.currency} and ${other.currency}`
      );
    }

    return this.amount < other.amount;
  }

  /**
   * Verifica si el monto es cero
   */
  public isZero(): boolean {
    return this.amount === 0;
  }

  /**
   * Retorna una representación en string del Money
   */
  public toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }

  /**
   * Convierte a objeto plano para serialización
   */
  public toJSON(): { readonly amount: number; readonly currency: string } {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }
}
