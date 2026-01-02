import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Product } from '../../../core/product/domain/Product.entity';
import { ProductLocalRepository } from '../ProductLocal.repository';

describe('ProductLocalRepository', () => {
  let repository: ProductLocalRepository;

  beforeEach(() => {
    repository = new ProductLocalRepository();
    repository.clear(); // Limpiar localStorage antes de cada test
  });

  afterEach(() => {
    repository.clear(); // Limpiar localStorage después de cada test
  });

  describe('save and findById', () => {
    it('should save and retrieve a product', async () => {
      const product: Product = Product.create({
        name: 'Laptop',
        description: 'High-performance laptop',
        price: 999.99,
        stock: 10,
      });

      await repository.save(product);

      const retrieved: Product | null = await repository.findById(product.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(product.id);
      expect(retrieved?.name).toBe(product.name);
      expect(retrieved?.description).toBe(product.description);
      expect(retrieved?.price).toBe(product.price);
      expect(retrieved?.stock).toBe(product.stock);
    });

    it('should return null for non-existent product', async () => {
      const result: Product | null = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should update existing product', async () => {
      const product: Product = Product.create({
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
      });

      await repository.save(product);

      const updated: Product = product.updatePrice(1299.99);
      await repository.save(updated);

      const retrieved: Product | null = await repository.findById(product.id);

      expect(retrieved?.price).toBe(1299.99);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no products exist', async () => {
      const products: Product[] = await repository.findAll();

      expect(products).toEqual([]);
    });

    it('should return all products', async () => {
      const product1: Product = Product.create({
        name: 'Laptop',
        description: 'Description 1',
        price: 999.99,
        stock: 10,
      });

      const product2: Product = Product.create({
        name: 'Mouse',
        description: 'Description 2',
        price: 29.99,
        stock: 50,
      });

      await repository.save(product1);
      await repository.save(product2);

      const products: Product[] = await repository.findAll();

      expect(products).toHaveLength(2);
      expect(products.some((p: Product) => p.id === product1.id)).toBe(true);
      expect(products.some((p: Product) => p.id === product2.id)).toBe(true);
    });

    it('should filter by name', async () => {
      const product1: Product = Product.create({
        name: 'Gaming Laptop',
        description: 'High-end gaming laptop',
        price: 1999.99,
        stock: 5,
      });

      const product2: Product = Product.create({
        name: 'Office Laptop',
        description: 'Business laptop',
        price: 899.99,
        stock: 15,
      });

      const product3: Product = Product.create({
        name: 'Mouse',
        description: 'Wireless mouse',
        price: 29.99,
        stock: 50,
      });

      await repository.save(product1);
      await repository.save(product2);
      await repository.save(product3);

      const filtered: Product[] = await repository.findAll({ name: 'laptop' });

      expect(filtered).toHaveLength(2);
      expect(filtered.every((p: Product) => p.name.toLowerCase().includes('laptop'))).toBe(true);
    });

    it('should filter by minimum price', async () => {
      const product1: Product = Product.create({
        name: 'Expensive Item',
        description: 'Costly product',
        price: 1000,
        stock: 5,
      });

      const product2: Product = Product.create({
        name: 'Mid Item',
        description: 'Medium priced',
        price: 500,
        stock: 10,
      });

      const product3: Product = Product.create({
        name: 'Cheap Item',
        description: 'Budget product',
        price: 100,
        stock: 50,
      });

      await repository.save(product1);
      await repository.save(product2);
      await repository.save(product3);

      const filtered: Product[] = await repository.findAll({ minPrice: 500 });

      expect(filtered).toHaveLength(2);
      expect(filtered.every((p: Product) => p.price >= 500)).toBe(true);
    });

    it('should filter by maximum price', async () => {
      const product1: Product = Product.create({
        name: 'Expensive Item',
        description: 'Costly product',
        price: 1000,
        stock: 5,
      });

      const product2: Product = Product.create({
        name: 'Mid Item',
        description: 'Medium priced',
        price: 500,
        stock: 10,
      });

      const product3: Product = Product.create({
        name: 'Cheap Item',
        description: 'Budget product',
        price: 100,
        stock: 50,
      });

      await repository.save(product1);
      await repository.save(product2);
      await repository.save(product3);

      const filtered: Product[] = await repository.findAll({ maxPrice: 500 });

      expect(filtered).toHaveLength(2);
      expect(filtered.every((p: Product) => p.price <= 500)).toBe(true);
    });

    it('should filter by in stock', async () => {
      const product1: Product = Product.create({
        name: 'In Stock Item',
        description: 'Available',
        price: 100,
        stock: 10,
      });

      const product2: Product = Product.create({
        name: 'Out of Stock Item',
        description: 'Unavailable',
        price: 100,
        stock: 0,
      });

      await repository.save(product1);
      await repository.save(product2);

      const filtered: Product[] = await repository.findAll({ inStock: true });

      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.id).toBe(product1.id);
    });

    it('should apply multiple filters', async () => {
      const product1: Product = Product.create({
        name: 'Gaming Laptop',
        description: 'High-end',
        price: 1500,
        stock: 5,
      });

      const product2: Product = Product.create({
        name: 'Office Laptop',
        description: 'Business',
        price: 800,
        stock: 0,
      });

      const product3: Product = Product.create({
        name: 'Budget Laptop',
        description: 'Entry-level',
        price: 400,
        stock: 10,
      });

      await repository.save(product1);
      await repository.save(product2);
      await repository.save(product3);

      const filtered: Product[] = await repository.findAll({
        name: 'laptop',
        minPrice: 500,
        inStock: true,
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.id).toBe(product1.id);
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      const product: Product = Product.create({
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
      });

      await repository.save(product);
      await repository.delete(product.id);

      const retrieved: Product | null = await repository.findById(product.id);

      expect(retrieved).toBeNull();
    });

    it('should not throw error when deleting non-existent product', async () => {
      await expect(repository.delete('non-existent-id')).resolves.not.toThrow();
    });
  });

  describe('exists', () => {
    it('should return true for existing product', async () => {
      const product: Product = Product.create({
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
      });

      await repository.save(product);

      const exists: boolean = await repository.exists(product.id);

      expect(exists).toBe(true);
    });

    it('should return false for non-existent product', async () => {
      const exists: boolean = await repository.exists('non-existent-id');

      expect(exists).toBe(false);
    });
  });

  describe('persistence', () => {
    it('should persist products across repository instances', async () => {
      const product: Product = Product.create({
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
      });

      await repository.save(product);

      // Crear nueva instancia del repositorio
      const newRepository: ProductLocalRepository = new ProductLocalRepository();
      const retrieved: Product | null = await newRepository.findById(product.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(product.id);
      expect(retrieved?.name).toBe(product.name);
    });

    it('should handle corrupted localStorage data gracefully', async () => {
      // Corromper datos en localStorage
      localStorage.setItem('hexagonal-tdd:products', 'invalid-json');

      const products: Product[] = await repository.findAll();

      expect(products).toEqual([]);
    });
  });

  describe('clear', () => {
    it('should clear all products from storage', async () => {
      const product1: Product = Product.create({
        name: 'Product 1',
        description: 'Description',
        price: 100,
        stock: 10,
      });

      const product2: Product = Product.create({
        name: 'Product 2',
        description: 'Description',
        price: 200,
        stock: 20,
      });

      await repository.save(product1);
      await repository.save(product2);

      repository.clear();

      const products: Product[] = await repository.findAll();

      expect(products).toEqual([]);
    });
  });
});
