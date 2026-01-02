import { ProductNotFoundError } from '../../domain/Product.errors';

import type { Product } from '../../domain/Product.entity';
import type { ProductRepository } from '../../domain/types';

/**
 * Use Case: Eliminar un producto
 */
export class DeleteProduct {
  private readonly productRepository: ProductRepository;

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  public async execute(id: string): Promise<void> {
    // Verificar que el producto existe
    const product: Product | null = await this.productRepository.findById(id);

    if (product === null) {
      throw new ProductNotFoundError(id);
    }

    // Eliminar
    await this.productRepository.delete(id);
  }
}
