import { Product } from '../../domain/Product.entity';
import { ProductNotFoundError } from '../../domain/Product.errors';
import { ProductResponseMapper } from '../dtos/ProductResponse.dto';

import type { ProductRepository } from '../../domain/types';
import type { ProductResponseDTO, UpdateProductDTO } from '../types';

/**
 * Use Case: Actualizar un producto
 */
export class UpdateProduct {
  private readonly productRepository: ProductRepository;

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  public async execute(dto: UpdateProductDTO): Promise<ProductResponseDTO> {
    // Buscar producto existente
    const existingProduct: Product | null = await this.productRepository.findById(dto.id);

    if (existingProduct === null) {
      throw new ProductNotFoundError(dto.id);
    }

    // Aplicar actualizaciones
    let updatedProduct: Product = existingProduct;

    if (dto.name !== undefined) {
      updatedProduct = updatedProduct.updateName(dto.name);
    }

    if (dto.price !== undefined) {
      updatedProduct = updatedProduct.updatePrice(dto.price);
    }

    if (dto.stock !== undefined) {
      updatedProduct = updatedProduct.updateStock(dto.stock);
    }

    if (dto.description !== undefined) {
      // Para description necesitamos crear un nuevo producto ya que no hay método específico
      updatedProduct = Product.restore({
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: dto.description,
        price: updatedProduct.price,
        stock: updatedProduct.stock,
        createdAt: updatedProduct.createdAt,
        updatedAt: new Date(),
      });
    }

    // Persistir
    const savedProduct: Product = await this.productRepository.save(updatedProduct);

    return ProductResponseMapper.fromEntity(savedProduct);
  }
}
