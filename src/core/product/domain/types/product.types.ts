/**
 * Tipos para crear un producto
 */
export interface CreateProductData {
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly stock: number;
}

/**
 * Tipos para restaurar un producto desde persistencia
 */
export interface RestoreProductData {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly stock: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
