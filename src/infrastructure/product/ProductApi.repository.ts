import axios from 'axios';

import { ProductResponseMapper } from '@/core/product/application/dtos/ProductResponse.dto';
import type { ProductResponseDTO } from '@/core/product/application/types';
import { Product } from '@/core/product/domain/Product.entity';
import type { ProductFilters, ProductRepository } from '@/core/product/domain/types';

import { httpClient } from '../shared/http/axios.client';

/**
 * ProductApiRepository - Implementación con API REST usando Axios
 * Comunica con backend para persistir productos
 */
export class ProductApiRepository implements ProductRepository {
  private readonly basePath: string = '/products';

  public async findById(id: string): Promise<Product | null> {
    try {
      const response: ProductResponseDTO = await httpClient.get<ProductResponseDTO>(
        `${this.basePath}/${id}`
      );
      return this.mapToEntity(response);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  public async findAll(filters?: ProductFilters): Promise<Product[]> {
    try {
      const params: Record<string, string> = {};

      if (filters?.name !== undefined) {
        params['name'] = filters.name;
      }

      if (filters?.minPrice !== undefined) {
        params['minPrice'] = String(filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        params['maxPrice'] = String(filters.maxPrice);
      }

      if (filters?.inStock !== undefined) {
        params['inStock'] = String(filters.inStock);
      }

      const response: ProductResponseDTO[] = await httpClient.get<ProductResponseDTO[]>(
        this.basePath,
        { params }
      );

      return response.map((dto: ProductResponseDTO) => this.mapToEntity(dto));
    } catch (error: unknown) {
      console.error('Error fetching products from API:', error);
      throw error;
    }
  }

  public async save(product: Product): Promise<Product> {
    try {
      const dto: ProductResponseDTO = ProductResponseMapper.fromEntity(product);

      // Verificar si el producto ya existe
      const exists: boolean = await this.exists(product.id);

      if (exists) {
        // Update
        const response: ProductResponseDTO = await httpClient.put<ProductResponseDTO>(
          `${this.basePath}/${product.id}`,
          {
            name: dto.name,
            description: dto.description,
            price: dto.price,
            stock: dto.stock,
          }
        );
        return this.mapToEntity(response);
      } else {
        // Create
        const response: ProductResponseDTO = await httpClient.post<ProductResponseDTO>(
          this.basePath,
          {
            name: dto.name,
            description: dto.description,
            price: dto.price,
            stock: dto.stock,
          }
        );
        return this.mapToEntity(response);
      }
    } catch (error: unknown) {
      console.error('Error saving product to API:', error);
      throw error;
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      await httpClient.delete(`${this.basePath}/${id}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Si no existe, no hacer nada
        return;
      }
      throw error;
    }
  }

  public async exists(id: string): Promise<boolean> {
    try {
      await httpClient.get<ProductResponseDTO>(`${this.basePath}/${id}`);
      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Helper para mapear DTO a Entity
   */
  private mapToEntity(dto: ProductResponseDTO): Product {
    return Product.restore({
      id: dto.id,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      stock: dto.stock,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    });
  }
}
