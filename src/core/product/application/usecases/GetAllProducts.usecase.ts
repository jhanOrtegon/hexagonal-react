import { ProductResponseMapper } from '../dtos/ProductResponse.dto';

import type { Product } from '../../domain/Product.entity';
import type { ProductFilters, ProductRepository } from '../../domain/types';
import type { ProductResponseDTO } from '../types';

/**
 * Use Case: Obtener todos los productos
 */
export class GetAllProducts {
  private readonly productRepository: ProductRepository;

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  public async execute(filters?: ProductFilters): Promise<ProductResponseDTO[]> {
    const products: Product[] = await this.productRepository.findAll(filters);
    return products.map((product: Product) => ProductResponseMapper.fromEntity(product));
  }
}
