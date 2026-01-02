import type { Product } from '../Product.entity';

/**
 * Product Repository Interface
 * Define el contrato para persistencia de productos
 */
export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(filters?: ProductFilters): Promise<Product[]>;
  save(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

/**
 * Filtros para búsqueda de productos
 */
export interface ProductFilters {
  readonly name?: string;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly inStock?: boolean;
}
