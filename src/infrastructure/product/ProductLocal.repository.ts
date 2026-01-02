import { Product } from '@/core/product/domain/Product.entity';
import type { ProductFilters, ProductRepository } from '@/core/product/domain/types';

/**
 * ProductLocalRepository - Implementación con LocalStorage
 * Persiste productos en el navegador usando localStorage
 */
export class ProductLocalRepository implements ProductRepository {
  private readonly STORAGE_KEY: string = 'hexagonal-tdd:products';

  /**
   * Lee todos los productos desde localStorage
   */
  private getAllFromStorage(): Product[] {
    const data: string | null = localStorage.getItem(this.STORAGE_KEY);

    if (data === null) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(data);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map((item: unknown) => {
        const obj: Record<string, unknown> = item as Record<string, unknown>;
        return Product.restore({
          id: String(obj['id']),
          name: String(obj['name']),
          description: String(obj['description']),
          price: Number(obj['price']),
          stock: Number(obj['stock']),
          createdAt: new Date(String(obj['createdAt'])),
          updatedAt: new Date(String(obj['updatedAt'])),
        });
      });
    } catch (error: unknown) {
      console.error('Error parsing products from localStorage:', error);
      return [];
    }
  }

  /**
   * Guarda todos los productos en localStorage
   */
  private saveAllToStorage(products: Product[]): void {
    const serialized: string = JSON.stringify(
      products.map((p: Product) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }))
    );
    localStorage.setItem(this.STORAGE_KEY, serialized);
  }

  public findById(id: string): Promise<Product | null> {
    const products: Product[] = this.getAllFromStorage();
    return Promise.resolve(products.find((p: Product) => p.id === id) ?? null);
  }

  public findAll(filters?: ProductFilters): Promise<Product[]> {
    let products: Product[] = this.getAllFromStorage();

    if (filters === undefined) {
      return Promise.resolve(products);
    }

    // Aplicar filtros
    if (filters.name !== undefined) {
      const searchTerm: string = filters.name.toLowerCase();
      products = products.filter((p: Product) => p.name.toLowerCase().includes(searchTerm));
    }

    if (filters.minPrice !== undefined) {
      const {minPrice} = filters;
      products = products.filter((p: Product) => p.price >= minPrice);
    }

    if (filters.maxPrice !== undefined) {
      const {maxPrice} = filters;
      products = products.filter((p: Product) => p.price <= maxPrice);
    }

    if (filters.inStock !== undefined && filters.inStock) {
      products = products.filter((p: Product) => p.hasStock());
    }

    return Promise.resolve(products);
  }

  public save(product: Product): Promise<Product> {
    const products: Product[] = this.getAllFromStorage();
    const index: number = products.findIndex((p: Product) => p.id === product.id);

    if (index >= 0) {
      // Update
      products[index] = product;
    } else {
      // Create
      products.push(product);
    }

    this.saveAllToStorage(products);
    return Promise.resolve(product);
  }

  public delete(id: string): Promise<void> {
    const products: Product[] = this.getAllFromStorage();
    const filtered: Product[] = products.filter((p: Product) => p.id !== id);
    this.saveAllToStorage(filtered);
    return Promise.resolve();
  }

  public exists(id: string): Promise<boolean> {
    const products: Product[] = this.getAllFromStorage();
    return Promise.resolve(products.some((p: Product) => p.id === id));
  }

  /**
   * Limpia todos los productos (útil para testing)
   */
  public clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
