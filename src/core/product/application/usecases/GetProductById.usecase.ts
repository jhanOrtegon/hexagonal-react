import { ProductNotFoundError } from '../../domain/Product.errors';
import { ProductResponseMapper } from '../dtos/ProductResponse.dto';

import type { Product } from '../../domain/Product.entity';
import type { ProductRepository } from '../../domain/types';
import type { ProductResponseDTO } from '../types';

/**
 * Use Case: Obtener un producto por ID
 */
export class GetProductById {
  private readonly productRepository: ProductRepository;

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  public async execute(id: string): Promise<ProductResponseDTO> {
    const product: Product | null = await this.productRepository.findById(id);

    if (product === null) {
      throw new ProductNotFoundError(id);
    }

    return ProductResponseMapper.fromEntity(product);
  }
}
