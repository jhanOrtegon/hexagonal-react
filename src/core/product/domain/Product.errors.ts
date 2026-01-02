import { DomainError } from '../../shared/errors';

/**
 * Error cuando un producto no es encontrado
 */
export class ProductNotFoundError extends DomainError {
  constructor(productId: string) {
    super(`Product with ID "${productId}" was not found`);
  }
}

/**
 * Error cuando el nombre del producto ya existe
 */
export class ProductNameAlreadyExistsError extends DomainError {
  constructor(name: string) {
    super(`Product with name "${name}" already exists`);
  }
}

/**
 * Error cuando el precio es inválido
 */
export class InvalidProductPriceError extends DomainError {
  constructor(price: number) {
    super(`Invalid product price: ${String(price)}`);
  }
}

/**
 * Error cuando el stock es inválido
 */
export class InvalidProductStockError extends DomainError {
  constructor(stock: number) {
    super(`Invalid product stock: ${String(stock)}`);
  }
}

/**
 * Error cuando no hay suficiente stock
 */
export class InsufficientStockError extends DomainError {
  constructor(productId: string, requested: number, available: number) {
    super(
      `Insufficient stock for product "${productId}". Requested: ${String(requested)}, Available: ${String(available)}`
    );
  }
}
