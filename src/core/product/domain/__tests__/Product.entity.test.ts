import { describe, it, expect } from 'vitest';

import { Product } from '../Product.entity';

describe('Product Entity', () => {
  describe('create', () => {
    it('should create a valid product', () => {
      const product: Product = Product.create({
        name: 'Laptop',
        description: 'High-performance laptop',
        price: 999.99,
        stock: 10,
      });

      expect(product.id).toBeDefined();
      expect(product.name).toBe('Laptop');
      expect(product.description).toBe('High-performance laptop');
      expect(product.price).toBe(999.99);
      expect(product.stock).toBe(10);
      expect(product.createdAt).toBeInstanceOf(Date);
      expect(product.updatedAt).toBeInstanceOf(Date);
    });

    it('should trim whitespace from name and description', () => {
      const product: Product = Product.create({
        name: '  Laptop  ',
        description: '  High-performance laptop  ',
        price: 999.99,
        stock: 10,
      });

      expect(product.name).toBe('Laptop');
      expect(product.description).toBe('High-performance laptop');
    });

    it('should throw error if name is empty', () => {
      expect(() => {
        Product.create({
          name: '',
          description: 'Description',
          price: 100,
          stock: 5,
        });
      }).toThrow('Product name cannot be empty');
    });

    it('should throw error if name is only whitespace', () => {
      expect(() => {
        Product.create({
          name: '   ',
          description: 'Description',
          price: 100,
          stock: 5,
        });
      }).toThrow('Product name cannot be empty');
    });

    it('should throw error if price is negative', () => {
      expect(() => {
        Product.create({
          name: 'Laptop',
          description: 'Description',
          price: -100,
          stock: 5,
        });
      }).toThrow('Product price cannot be negative');
    });

    it('should throw error if stock is negative', () => {
      expect(() => {
        Product.create({
          name: 'Laptop',
          description: 'Description',
          price: 100,
          stock: -5,
        });
      }).toThrow('Product stock cannot be negative');
    });

    it('should allow zero price', () => {
      const product: Product = Product.create({
        name: 'Free Sample',
        description: 'Free product',
        price: 0,
        stock: 100,
      });

      expect(product.price).toBe(0);
    });

    it('should allow zero stock', () => {
      const product: Product = Product.create({
        name: 'Out of stock item',
        description: 'Currently unavailable',
        price: 50,
        stock: 0,
      });

      expect(product.stock).toBe(0);
    });
  });

  describe('restore', () => {
    it('should restore a product from persistence data', () => {
      const now: Date = new Date();
      const product: Product = Product.restore({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Laptop',
        description: 'High-performance laptop',
        price: 999.99,
        stock: 10,
        createdAt: now,
        updatedAt: now,
      });

      expect(product.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(product.name).toBe('Laptop');
      expect(product.description).toBe('High-performance laptop');
      expect(product.price).toBe(999.99);
      expect(product.stock).toBe(10);
      expect(product.createdAt).toBe(now);
      expect(product.updatedAt).toBe(now);
    });
  });

  describe('updateName', () => {
    it('should update product name', () => {
      const original: Product = Product.create({
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
      });

      const updated: Product = original.updateName('Gaming Laptop');

      expect(updated.name).toBe('Gaming Laptop');
      expect(updated.id).toBe(original.id);
      expect(updated.price).toBe(original.price);
      expect(updated.stock).toBe(original.stock);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
        original.updatedAt.getTime()
      );
    });

    it('should trim whitespace from new name', () => {
      const product: Product = Product.create({
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
      });

      const updated: Product = product.updateName('  Gaming Laptop  ');

      expect(updated.name).toBe('Gaming Laptop');
    });

    it('should throw error if new name is empty', () => {
      const product: Product = Product.create({
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
      });

      expect(() => {
        product.updateName('');
      }).toThrow('Product name cannot be empty');
    });

    it('should throw error if new name is only whitespace', () => {
      const product: Product = Product.create({
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
      });

      expect(() => {
        product.updateName('   ');
      }).toThrow('Product name cannot be empty');
    });

    it('should return new instance (immutability)', () => {
      const original: Product = Product.create({
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
      });

      const updated: Product = original.updateName('Gaming Laptop');

      expect(updated).not.toBe(original);
      expect(original.name).toBe('Laptop');
      expect(updated.name).toBe('Gaming Laptop');
    });
  });

  describe('updatePrice', () => {
    it('should update product price', () => {
      const original: Product = Product.create({
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
      });

      const updated: Product = original.updatePrice(1299.99);

      expect(updated.price).toBe(1299.99);
      expect(updated.id).toBe(original.id);
      expect(updated.name).toBe(original.name);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
        original.updatedAt.getTime()
      );
    });

    it('should allow zero price', () => {
      const product: Product = Product.create({
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
      });

      const updated: Product = product.updatePrice(0);

      expect(updated.price).toBe(0);
    });

    it('should throw error if new price is negative', () => {
      const product: Product = Product.create({
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
      });

      expect(() => {
        product.updatePrice(-100);
      }).toThrow('Product price cannot be negative');
    });

    it('should return new instance (immutability)', () => {
      const original: Product = Product.create({
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
      });

      const updated: Product = original.updatePrice(1299.99);

      expect(updated).not.toBe(original);
      expect(original.price).toBe(999.99);
      expect(updated.price).toBe(1299.99);
    });
  });

  describe('updateStock', () => {
    it('should update product stock', () => {
      const original: Product = Product.create({
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
      });

      const updated: Product = original.updateStock(20);

      expect(updated.stock).toBe(20);
      expect(updated.id).toBe(original.id);
      expect(updated.name).toBe(original.name);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
        original.updatedAt.getTime()
      );
    });

    it('should allow zero stock', () => {
      const product: Product = Product.create({
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
      });

      const updated: Product = product.updateStock(0);

      expect(updated.stock).toBe(0);
    });

    it('should throw error if new stock is negative', () => {
      const product: Product = Product.create({
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
      });

      expect(() => {
        product.updateStock(-5);
      }).toThrow('Product stock cannot be negative');
    });

    it('should return new instance (immutability)', () => {
      const original: Product = Product.create({
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
      });

      const updated: Product = original.updateStock(20);

      expect(updated).not.toBe(original);
      expect(original.stock).toBe(10);
      expect(updated.stock).toBe(20);
    });
  });

  describe('hasStock', () => {
    it('should return true when stock is greater than zero', () => {
      const product: Product = Product.create({
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
      });

      expect(product.hasStock()).toBe(true);
    });

    it('should return false when stock is zero', () => {
      const product: Product = Product.create({
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 0,
      });

      expect(product.hasStock()).toBe(false);
    });
  });

  describe('hasEnoughStock', () => {
    it('should return true when stock is sufficient', () => {
      const product: Product = Product.create({
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
      });

      expect(product.hasEnoughStock(5)).toBe(true);
      expect(product.hasEnoughStock(10)).toBe(true);
    });

    it('should return false when stock is insufficient', () => {
      const product: Product = Product.create({
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
      });

      expect(product.hasEnoughStock(11)).toBe(false);
      expect(product.hasEnoughStock(100)).toBe(false);
    });

    it('should return true when requesting zero quantity', () => {
      const product: Product = Product.create({
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
      });

      expect(product.hasEnoughStock(0)).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return true for products with same ID', () => {
      const product1: Product = Product.restore({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const product2: Product = Product.restore({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Different Name',
        description: 'Different Description',
        price: 1299.99,
        stock: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(product1.equals(product2)).toBe(true);
    });

    it('should return false for products with different IDs', () => {
      const product1: Product = Product.restore({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const product2: Product = Product.restore({
        id: '987f6543-c21a-01b2-d345-516172839000',
        name: 'Laptop',
        description: 'Description',
        price: 999.99,
        stock: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(product1.equals(product2)).toBe(false);
    });
  });
});
