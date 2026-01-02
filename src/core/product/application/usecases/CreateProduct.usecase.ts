import { Product } from '../../domain/Product.entity';
import { ProductResponseMapper } from '../dtos/ProductResponse.dto';

import type { ProductRepository } from '../../domain/types';
import type { CreateProductDTO, ProductResponseDTO } from '../types';

/**
 * Use Case: Crear un nuevo producto
 */
export class CreateProduct {
  private readonly productRepository: ProductRepository;

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  public async execute(dto: CreateProductDTO): Promise<ProductResponseDTO> {
    // Crear entidad de dominio
    const product: Product = Product.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      stock: dto.stock,
    });

    // Persistir
    const savedProduct: Product = await this.productRepository.save(product);

    // Retornar DTO
    return ProductResponseMapper.fromEntity(savedProduct);
  }
}
