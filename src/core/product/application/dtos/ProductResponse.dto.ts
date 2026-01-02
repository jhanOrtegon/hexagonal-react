import type { Product } from '../../domain/Product.entity';
import type { ProductResponseDTO } from '../types';

/**
 * Mapper para ProductResponseDTO
 */
export const ProductResponseMapper: {
  fromEntity: (product: Product) => ProductResponseDTO;
} = {
  fromEntity: (product: Product): ProductResponseDTO => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }),
};
