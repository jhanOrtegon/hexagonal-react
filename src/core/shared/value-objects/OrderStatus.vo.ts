import { fail, ok } from '../domain/Result';
import { InvalidArgumentError } from '../errors';

import type { Result } from '../domain/Result';

/**
 * Value Object: OrderStatus
 * Representa el estado de un pedido con transiciones válidas
 */
export class OrderStatus {
  private readonly value: string;

  // Estados válidos
  public static readonly PENDING: string = 'pending';
  public static readonly COMPLETED: string = 'completed';
  public static readonly CANCELLED: string = 'cancelled';

  private static readonly VALID_STATUSES: readonly string[] = [
    OrderStatus.PENDING,
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
  ] as const;

  // Transiciones válidas: desde → hacia[]
  private static readonly VALID_TRANSITIONS: Record<string, readonly string[]> = {
    [OrderStatus.PENDING]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
    [OrderStatus.COMPLETED]: [], // Estado final, no permite transiciones
    [OrderStatus.CANCELLED]: [], // Estado final, no permite transiciones
  };

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Crea una nueva instancia de OrderStatus
   * @param value - Estado del pedido (pending, completed, cancelled)
   */
  public static create(value: string): Result<OrderStatus, InvalidArgumentError> {
    // Validar que value sea string y no esté vacío
    if (typeof value !== 'string' || value.trim().length === 0) {
      return fail(new InvalidArgumentError('status', 'Status cannot be empty'));
    }

    const normalizedValue: string = value.trim().toLowerCase();

    // Validar que el estado sea válido
    if (!OrderStatus.VALID_STATUSES.includes(normalizedValue)) {
      return fail(
        new InvalidArgumentError(
          'status',
          `Invalid status: ${value}. Valid statuses are: ${OrderStatus.VALID_STATUSES.join(', ')}`
        )
      );
    }

    return ok(new OrderStatus(normalizedValue));
  }

  /**
   * Factory method para crear estado PENDING
   */
  public static createPending(): OrderStatus {
    return new OrderStatus(OrderStatus.PENDING);
  }

  /**
   * Factory method para crear estado COMPLETED
   */
  public static createCompleted(): OrderStatus {
    return new OrderStatus(OrderStatus.COMPLETED);
  }

  /**
   * Factory method para crear estado CANCELLED
   */
  public static createCancelled(): OrderStatus {
    return new OrderStatus(OrderStatus.CANCELLED);
  }

  /**
   * Obtiene el valor del estado
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Compara dos instancias de OrderStatus por valor
   */
  public equals(other: OrderStatus): boolean {
    if (!(other instanceof OrderStatus)) {
      return false;
    }

    return this.value === other.value;
  }

  /**
   * Verifica si el estado es PENDING
   */
  public isPending(): boolean {
    return this.value === OrderStatus.PENDING;
  }

  /**
   * Verifica si el estado es COMPLETED
   */
  public isCompleted(): boolean {
    return this.value === OrderStatus.COMPLETED;
  }

  /**
   * Verifica si el estado es CANCELLED
   */
  public isCancelled(): boolean {
    return this.value === OrderStatus.CANCELLED;
  }

  /**
   * Verifica si el estado es final (completed o cancelled)
   */
  public isFinal(): boolean {
    return this.isCompleted() || this.isCancelled();
  }

  /**
   * Verifica si es posible transicionar a otro estado
   * @param targetStatus - Estado objetivo
   */
  public canTransitionTo(targetStatus: OrderStatus): boolean {
    const allowedTransitions: readonly string[] | undefined =
      OrderStatus.VALID_TRANSITIONS[this.value];

    if (allowedTransitions === undefined) {
      return false;
    }

    return allowedTransitions.includes(targetStatus.value);
  }

  /**
   * Transiciona a un nuevo estado si es válido
   * @param targetStatus - Estado objetivo
   */
  public transitionTo(targetStatus: OrderStatus): Result<OrderStatus, InvalidArgumentError> {
    if (!this.canTransitionTo(targetStatus)) {
      return fail(
        new InvalidArgumentError(
          'status',
          `Cannot transition from ${this.value} to ${targetStatus.value}. Valid transitions: ${OrderStatus.VALID_TRANSITIONS[this.value]?.join(', ') ?? 'none'}`
        )
      );
    }

    return ok(targetStatus);
  }

  /**
   * Obtiene los estados a los que se puede transicionar
   */
  public getAllowedTransitions(): readonly string[] {
    return OrderStatus.VALID_TRANSITIONS[this.value] ?? [];
  }

  /**
   * Retorna una representación en string del OrderStatus
   */
  public toString(): string {
    return this.value;
  }

  /**
   * Convierte a objeto plano para serialización
   */
  public toJSON(): { readonly status: string } {
    return {
      status: this.value,
    };
  }
}
