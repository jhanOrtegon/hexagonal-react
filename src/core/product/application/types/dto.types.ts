/**
 * DTO para crear un producto
 */
export interface CreateProductDTO {
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly stock: number;
}

/**
 * DTO para actualizar un producto
 */
export interface UpdateProductDTO {
  readonly id: string;
  readonly name?: string;
  readonly description?: string;
  readonly price?: number;
  readonly stock?: number;
}

/**
 * DTO de respuesta de producto
 */
export interface ProductResponseDTO {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly stock: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}
