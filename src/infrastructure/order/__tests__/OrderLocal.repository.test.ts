import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Order, OrderStatus } from '../../../core/order/domain/Order.entity';
import { OrderLocalRepository } from '../OrderLocal.repository';

describe('OrderLocalRepository', () => {
  let repository: OrderLocalRepository;

  beforeEach(() => {
    repository = new OrderLocalRepository();
    repository.clear(); // Limpiar localStorage antes de cada test
  });

  afterEach(() => {
    repository.clear(); // Limpiar localStorage después de cada test
  });

  describe('save and findById', () => {
    it('should save and retrieve an order', async () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 3,
        unitPrice: 99.99,
      });

      await repository.save(order);

      const retrieved: Order | null = await repository.findById(order.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(order.id);
      expect(retrieved?.userId).toBe(order.userId);
      expect(retrieved?.productId).toBe(order.productId);
      expect(retrieved?.quantity).toBe(order.quantity);
      expect(retrieved?.totalPrice).toBe(order.totalPrice);
      expect(retrieved?.status).toBe(order.status);
    });

    it('should return null for non-existent order', async () => {
      const result: Order | null = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should update existing order', async () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      });

      await repository.save(order);

      const confirmed: Order = order.confirm();
      await repository.save(confirmed);

      const retrieved: Order | null = await repository.findById(order.id);

      expect(retrieved?.status).toBe(OrderStatus.CONFIRMED);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no orders exist', async () => {
      const orders: Order[] = await repository.findAll();

      expect(orders).toEqual([]);
    });

    it('should return all orders', async () => {
      const order1: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      });

      const order2: Order = Order.create({
        userId: 'user-456',
        productId: 'product-789',
        quantity: 2,
        unitPrice: 50,
      });

      await repository.save(order1);
      await repository.save(order2);

      const orders: Order[] = await repository.findAll();

      expect(orders).toHaveLength(2);
      expect(orders.some((o: Order) => o.id === order1.id)).toBe(true);
      expect(orders.some((o: Order) => o.id === order2.id)).toBe(true);
    });
  });

  describe('findByUserId', () => {
    it('should return orders for specific user', async () => {
      const order1: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      });

      const order2: Order = Order.create({
        userId: 'user-123',
        productId: 'product-789',
        quantity: 2,
        unitPrice: 50,
      });

      const order3: Order = Order.create({
        userId: 'user-456',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      });

      await repository.save(order1);
      await repository.save(order2);
      await repository.save(order3);

      const orders: Order[] = await repository.findByUserId('user-123');

      expect(orders).toHaveLength(2);
      expect(orders.every((o: Order) => o.userId === 'user-123')).toBe(true);
    });

    it('should return empty array if no orders for user', async () => {
      const orders: Order[] = await repository.findByUserId('non-existent-user');

      expect(orders).toEqual([]);
    });
  });

  describe('findByProductId', () => {
    it('should return orders for specific product', async () => {
      const order1: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      });

      const order2: Order = Order.create({
        userId: 'user-456',
        productId: 'product-456',
        quantity: 2,
        unitPrice: 100,
      });

      const order3: Order = Order.create({
        userId: 'user-123',
        productId: 'product-789',
        quantity: 1,
        unitPrice: 50,
      });

      await repository.save(order1);
      await repository.save(order2);
      await repository.save(order3);

      const orders: Order[] = await repository.findByProductId('product-456');

      expect(orders).toHaveLength(2);
      expect(orders.every((o: Order) => o.productId === 'product-456')).toBe(true);
    });

    it('should return empty array if no orders for product', async () => {
      const orders: Order[] = await repository.findByProductId('non-existent-product');

      expect(orders).toEqual([]);
    });
  });

  describe('findAll with status filter', () => {
    it('should return orders with specific status', async () => {
      const order1: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      });

      const order2: Order = Order.create({
        userId: 'user-456',
        productId: 'product-789',
        quantity: 2,
        unitPrice: 50,
      }).confirm();

      const order3: Order = Order.create({
        userId: 'user-789',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      })
        .confirm()
        .ship();

      await repository.save(order1);
      await repository.save(order2);
      await repository.save(order3);

      const pendingOrders: Order[] = await repository.findAll({ status: OrderStatus.PENDING });
      expect(pendingOrders).toHaveLength(1);
      expect(pendingOrders[0]?.status).toBe(OrderStatus.PENDING);

      const confirmedOrders: Order[] = await repository.findAll({ status: OrderStatus.CONFIRMED });
      expect(confirmedOrders).toHaveLength(1);
      expect(confirmedOrders[0]?.status).toBe(OrderStatus.CONFIRMED);

      const shippedOrders: Order[] = await repository.findAll({ status: OrderStatus.SHIPPED });
      expect(shippedOrders).toHaveLength(1);
      expect(shippedOrders[0]?.status).toBe(OrderStatus.SHIPPED);
    });

    it('should return empty array if no orders with status', async () => {
      const orders: Order[] = await repository.findAll({ status: OrderStatus.DELIVERED });

      expect(orders).toEqual([]);
    });
  });

  describe('findAll with multiple filters', () => {
    beforeEach(async () => {
      // Crear órdenes de prueba
      const order1: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 2,
        unitPrice: 100,
      });

      const order2: Order = Order.create({
        userId: 'user-123',
        productId: 'product-789',
        quantity: 1,
        unitPrice: 50,
      }).confirm();

      const order3: Order = Order.create({
        userId: 'user-456',
        productId: 'product-456',
        quantity: 3,
        unitPrice: 100,
      })
        .confirm()
        .ship();

      const order4: Order = Order.create({
        userId: 'user-789',
        productId: 'product-999',
        quantity: 5,
        unitPrice: 200,
      })
        .confirm()
        .ship()
        .deliver();

      await repository.save(order1);
      await repository.save(order2);
      await repository.save(order3);
      await repository.save(order4);
    });

    it('should filter by userId', async () => {
      const orders: Order[] = await repository.findAll({ userId: 'user-123' });

      expect(orders).toHaveLength(2);
      expect(orders.every((o: Order) => o.userId === 'user-123')).toBe(true);
    });

    it('should filter by productId', async () => {
      const orders: Order[] = await repository.findAll({ productId: 'product-456' });

      expect(orders).toHaveLength(2);
      expect(orders.every((o: Order) => o.productId === 'product-456')).toBe(true);
    });

    it('should filter by status', async () => {
      const orders: Order[] = await repository.findAll({ status: OrderStatus.CONFIRMED });

      expect(orders).toHaveLength(1);
      expect(orders[0]?.status).toBe(OrderStatus.CONFIRMED);
    });

    it('should filter by createdAfter', async () => {
      const now: Date = new Date();
      const yesterday: Date = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const orders: Order[] = await repository.findAll({ createdAfter: yesterday });

      expect(orders).toHaveLength(4); // Todas las órdenes fueron creadas hoy
    });

    it('should filter by createdBefore', async () => {
      const tomorrow: Date = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const orders: Order[] = await repository.findAll({ createdBefore: tomorrow });

      expect(orders).toHaveLength(4); // Todas las órdenes fueron creadas antes de mañana
    });

    it('should apply multiple filters', async () => {
      const orders: Order[] = await repository.findAll({
        userId: 'user-123',
        status: OrderStatus.CONFIRMED,
      });

      expect(orders).toHaveLength(1);
      expect(orders[0]?.userId).toBe('user-123');
      expect(orders[0]?.status).toBe(OrderStatus.CONFIRMED);
    });

    it('should apply all filters at once', async () => {
      const yesterday: Date = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const tomorrow: Date = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const orders: Order[] = await repository.findAll({
        userId: 'user-456',
        productId: 'product-456',
        status: OrderStatus.SHIPPED,
        createdAfter: yesterday,
        createdBefore: tomorrow,
      });

      expect(orders).toHaveLength(1);
      expect(orders[0]?.userId).toBe('user-456');
      expect(orders[0]?.productId).toBe('product-456');
      expect(orders[0]?.status).toBe(OrderStatus.SHIPPED);
      expect(orders[0]?.totalPrice).toBe(300);
    });

    it('should return empty array if no orders match filters', async () => {
      const orders: Order[] = await repository.findAll({
        userId: 'user-123',
        status: OrderStatus.DELIVERED,
      });

      expect(orders).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete an order', async () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      });

      await repository.save(order);
      await repository.delete(order.id);

      const retrieved: Order | null = await repository.findById(order.id);

      expect(retrieved).toBeNull();
    });

    it('should not throw error when deleting non-existent order', async () => {
      await expect(repository.delete('non-existent-id')).resolves.not.toThrow();
    });
  });

  describe('exists', () => {
    it('should return true for existing order', async () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      });

      await repository.save(order);

      const exists: boolean = await repository.exists(order.id);

      expect(exists).toBe(true);
    });

    it('should return false for non-existent order', async () => {
      const exists: boolean = await repository.exists('non-existent-id');

      expect(exists).toBe(false);
    });
  });

  describe('persistence', () => {
    it('should persist orders across repository instances', async () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      });

      await repository.save(order);

      // Crear nueva instancia del repositorio
      const newRepository: OrderLocalRepository = new OrderLocalRepository();
      const retrieved: Order | null = await newRepository.findById(order.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(order.id);
      expect(retrieved?.userId).toBe(order.userId);
    });

    it('should handle corrupted localStorage data gracefully', async () => {
      // Corromper datos en localStorage
      localStorage.setItem('hexagonal-tdd:orders', 'invalid-json');

      const orders: Order[] = await repository.findAll();

      expect(orders).toEqual([]);
    });

    it('should preserve order status across persistence', async () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      })
        .confirm()
        .ship();

      await repository.save(order);

      const newRepository: OrderLocalRepository = new OrderLocalRepository();
      const retrieved: Order | null = await newRepository.findById(order.id);

      expect(retrieved?.status).toBe(OrderStatus.SHIPPED);
    });
  });

  describe('clear', () => {
    it('should clear all orders from storage', async () => {
      const order1: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      });

      const order2: Order = Order.create({
        userId: 'user-456',
        productId: 'product-789',
        quantity: 2,
        unitPrice: 50,
      });

      await repository.save(order1);
      await repository.save(order2);

      repository.clear();

      const orders: Order[] = await repository.findAll();

      expect(orders).toEqual([]);
    });
  });

  describe('state transitions persistence', () => {
    it('should persist complete order lifecycle', async () => {
      // Crear orden
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      });
      await repository.save(order);

      // Confirmar
      const confirmed: Order = order.confirm();
      await repository.save(confirmed);
      let retrieved: Order | null = await repository.findById(order.id);
      expect(retrieved?.status).toBe(OrderStatus.CONFIRMED);

      // Enviar
      const shipped: Order = confirmed.ship();
      await repository.save(shipped);
      retrieved = await repository.findById(order.id);
      expect(retrieved?.status).toBe(OrderStatus.SHIPPED);

      // Entregar
      const delivered: Order = shipped.deliver();
      await repository.save(delivered);
      retrieved = await repository.findById(order.id);
      expect(retrieved?.status).toBe(OrderStatus.DELIVERED);
    });

    it('should persist cancelled orders', async () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      });
      await repository.save(order);

      const cancelled: Order = order.cancel();
      await repository.save(cancelled);

      const retrieved: Order | null = await repository.findById(order.id);
      expect(retrieved?.status).toBe(OrderStatus.CANCELLED);
    });
  });
});
