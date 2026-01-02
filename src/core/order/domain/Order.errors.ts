import { DomainError } from '../../shared/errors';

/**
 * Error cuando un pedido no es encontrado
 */
export class OrderNotFoundError extends DomainError {
  constructor(orderId: string) {
    super(`Order with ID "${orderId}" was not found`);
  }
}

/**
 * Error cuando la cantidad es inválida
 */
export class InvalidOrderQuantityError extends DomainError {
  constructor(quantity: number) {
    super(`Invalid order quantity: ${String(quantity)}`);
  }
}

/**
 * Error cuando no se puede cambiar el estado del pedido
 */
export class InvalidOrderStatusTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(`Cannot transition order status from ${from} to ${to}`);
  }
}
