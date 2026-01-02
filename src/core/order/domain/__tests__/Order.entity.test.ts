import { describe, expect, it } from 'vitest';

import { Order, OrderStatus } from '../Order.entity';

describe('Order.entity', () => {
  describe('create', () => {
    it('should create a new order with valid data', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 3,
        unitPrice: 99.99,
      });

      expect(order.id).toBeDefined();
      expect(order.userId).toBe('user-123');
      expect(order.productId).toBe('product-456');
      expect(order.quantity).toBe(3);
      expect(order.totalPrice).toBeCloseTo(299.97, 2);
      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.createdAt).toBeInstanceOf(Date);
      expect(order.updatedAt).toBeInstanceOf(Date);
    });

    it('should trim userId and productId', () => {
      const order: Order = Order.create({
        userId: '  user-123  ',
        productId: '  product-456  ',
        quantity: 1,
        unitPrice: 100,
      });

      expect(order.userId).toBe('user-123');
      expect(order.productId).toBe('product-456');
    });

    it('should throw error if userId is empty', () => {
      expect(() =>
        Order.create({
          userId: '',
          productId: 'product-456',
          quantity: 1,
          unitPrice: 100,
        })
      ).toThrow('User ID cannot be empty');
    });

    it('should throw error if userId is only whitespace', () => {
      expect(() =>
        Order.create({
          userId: '   ',
          productId: 'product-456',
          quantity: 1,
          unitPrice: 100,
        })
      ).toThrow('User ID cannot be empty');
    });

    it('should throw error if productId is empty', () => {
      expect(() =>
        Order.create({
          userId: 'user-123',
          productId: '',
          quantity: 1,
          unitPrice: 100,
        })
      ).toThrow('Product ID cannot be empty');
    });

    it('should throw error if productId is only whitespace', () => {
      expect(() =>
        Order.create({
          userId: 'user-123',
          productId: '   ',
          quantity: 1,
          unitPrice: 100,
        })
      ).toThrow('Product ID cannot be empty');
    });

    it('should throw error if quantity is zero', () => {
      expect(() =>
        Order.create({
          userId: 'user-123',
          productId: 'product-456',
          quantity: 0,
          unitPrice: 100,
        })
      ).toThrow('Quantity must be greater than zero');
    });

    it('should throw error if quantity is negative', () => {
      expect(() =>
        Order.create({
          userId: 'user-123',
          productId: 'product-456',
          quantity: -5,
          unitPrice: 100,
        })
      ).toThrow('Quantity must be greater than zero');
    });

    it('should throw error if unitPrice is negative', () => {
      expect(() =>
        Order.create({
          userId: 'user-123',
          productId: 'product-456',
          quantity: 1,
          unitPrice: -50,
        })
      ).toThrow('Unit price cannot be negative');
    });

    it('should calculate totalPrice correctly', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 5,
        unitPrice: 19.99,
      });

      expect(order.totalPrice).toBeCloseTo(99.95, 2);
    });

    it('should handle unitPrice of zero', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 10,
        unitPrice: 0,
      });

      expect(order.totalPrice).toBe(0);
    });
  });

  describe('restore', () => {
    it('should restore an order from persistence data', () => {
      const createdAt: Date = new Date('2024-01-01');
      const updatedAt: Date = new Date('2024-01-02');

      const order: Order = Order.restore({
        id: 'order-123',
        userId: 'user-123',
        productId: 'product-456',
        quantity: 2,
        totalPrice: 199.98,
        status: OrderStatus.CONFIRMED,
        createdAt,
        updatedAt,
      });

      expect(order.id).toBe('order-123');
      expect(order.userId).toBe('user-123');
      expect(order.productId).toBe('product-456');
      expect(order.quantity).toBe(2);
      expect(order.totalPrice).toBe(199.98);
      expect(order.status).toBe(OrderStatus.CONFIRMED);
      expect(order.createdAt).toBe(createdAt);
      expect(order.updatedAt).toBe(updatedAt);
    });
  });

  describe('State Machine - confirm', () => {
    it('should confirm a PENDING order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      });

      const confirmed: Order = order.confirm();

      expect(confirmed.status).toBe(OrderStatus.CONFIRMED);
      expect(confirmed.id).toBe(order.id);
      expect(confirmed.updatedAt.getTime()).toBeGreaterThanOrEqual(order.updatedAt.getTime());
    });

    it('should throw error when confirming CONFIRMED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      }).confirm();

      expect(() => order.confirm()).toThrow('Cannot confirm order with status CONFIRMED');
    });

    it('should throw error when confirming SHIPPED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      })
        .confirm()
        .ship();

      expect(() => order.confirm()).toThrow('Cannot confirm order with status SHIPPED');
    });

    it('should throw error when confirming DELIVERED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      })
        .confirm()
        .ship()
        .deliver();

      expect(() => order.confirm()).toThrow('Cannot confirm order with status DELIVERED');
    });

    it('should throw error when confirming CANCELLED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      }).cancel();

      expect(() => order.confirm()).toThrow('Cannot confirm order with status CANCELLED');
    });
  });

  describe('State Machine - ship', () => {
    it('should ship a CONFIRMED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      }).confirm();

      const shipped: Order = order.ship();

      expect(shipped.status).toBe(OrderStatus.SHIPPED);
      expect(shipped.id).toBe(order.id);
      expect(shipped.updatedAt.getTime()).toBeGreaterThanOrEqual(order.updatedAt.getTime());
    });

    it('should throw error when shipping PENDING order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      });

      expect(() => order.ship()).toThrow('Cannot ship order with status PENDING');
    });

    it('should throw error when shipping SHIPPED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      })
        .confirm()
        .ship();

      expect(() => order.ship()).toThrow('Cannot ship order with status SHIPPED');
    });

    it('should throw error when shipping DELIVERED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      })
        .confirm()
        .ship()
        .deliver();

      expect(() => order.ship()).toThrow('Cannot ship order with status DELIVERED');
    });

    it('should throw error when shipping CANCELLED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      }).cancel();

      expect(() => order.ship()).toThrow('Cannot ship order with status CANCELLED');
    });
  });

  describe('State Machine - deliver', () => {
    it('should deliver a SHIPPED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      })
        .confirm()
        .ship();

      const delivered: Order = order.deliver();

      expect(delivered.status).toBe(OrderStatus.DELIVERED);
      expect(delivered.id).toBe(order.id);
      expect(delivered.updatedAt.getTime()).toBeGreaterThanOrEqual(order.updatedAt.getTime());
    });

    it('should throw error when delivering PENDING order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      });

      expect(() => order.deliver()).toThrow('Cannot deliver order with status PENDING');
    });

    it('should throw error when delivering CONFIRMED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      }).confirm();

      expect(() => order.deliver()).toThrow('Cannot deliver order with status CONFIRMED');
    });

    it('should throw error when delivering DELIVERED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      })
        .confirm()
        .ship()
        .deliver();

      expect(() => order.deliver()).toThrow('Cannot deliver order with status DELIVERED');
    });

    it('should throw error when delivering CANCELLED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      }).cancel();

      expect(() => order.deliver()).toThrow('Cannot deliver order with status CANCELLED');
    });
  });

  describe('State Machine - cancel', () => {
    it('should cancel a PENDING order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      });

      const cancelled: Order = order.cancel();

      expect(cancelled.status).toBe(OrderStatus.CANCELLED);
      expect(cancelled.id).toBe(order.id);
      expect(cancelled.updatedAt.getTime()).toBeGreaterThanOrEqual(order.updatedAt.getTime());
    });

    it('should cancel a CONFIRMED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      }).confirm();

      const cancelled: Order = order.cancel();

      expect(cancelled.status).toBe(OrderStatus.CANCELLED);
    });

    it('should cancel a SHIPPED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      })
        .confirm()
        .ship();

      const cancelled: Order = order.cancel();

      expect(cancelled.status).toBe(OrderStatus.CANCELLED);
    });

    it('should throw error when cancelling DELIVERED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      })
        .confirm()
        .ship()
        .deliver();

      expect(() => order.cancel()).toThrow('Cannot cancel a delivered order');
    });

    it('should throw error when cancelling already CANCELLED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      }).cancel();

      expect(() => order.cancel()).toThrow('Order is already cancelled');
    });
  });

  describe('canBeCancelled', () => {
    it('should return true for PENDING order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      });

      expect(order.canBeCancelled()).toBe(true);
    });

    it('should return true for CONFIRMED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      }).confirm();

      expect(order.canBeCancelled()).toBe(true);
    });

    it('should return true for SHIPPED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      })
        .confirm()
        .ship();

      expect(order.canBeCancelled()).toBe(true);
    });

    it('should return false for DELIVERED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      })
        .confirm()
        .ship()
        .deliver();

      expect(order.canBeCancelled()).toBe(false);
    });

    it('should return false for CANCELLED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      }).cancel();

      expect(order.canBeCancelled()).toBe(false);
    });
  });

  describe('isCompleted', () => {
    it('should return false for PENDING order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      });

      expect(order.isCompleted()).toBe(false);
    });

    it('should return false for CONFIRMED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      }).confirm();

      expect(order.isCompleted()).toBe(false);
    });

    it('should return false for SHIPPED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      })
        .confirm()
        .ship();

      expect(order.isCompleted()).toBe(false);
    });

    it('should return true for DELIVERED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      })
        .confirm()
        .ship()
        .deliver();

      expect(order.isCompleted()).toBe(true);
    });

    it('should return false for CANCELLED order', () => {
      const order: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      }).cancel();

      expect(order.isCompleted()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for orders with same id', () => {
      const order1: Order = Order.restore({
        id: 'order-123',
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        totalPrice: 100,
        status: OrderStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const order2: Order = Order.restore({
        id: 'order-123',
        userId: 'user-999',
        productId: 'product-999',
        quantity: 99,
        totalPrice: 9999,
        status: OrderStatus.DELIVERED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(order1.equals(order2)).toBe(true);
    });

    it('should return false for orders with different id', () => {
      const order1: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      });

      const order2: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      });

      expect(order1.equals(order2)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should not mutate original order when confirming', () => {
      const original: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      });

      const confirmed: Order = original.confirm();

      expect(original.status).toBe(OrderStatus.PENDING);
      expect(confirmed.status).toBe(OrderStatus.CONFIRMED);
      expect(original).not.toBe(confirmed);
    });

    it('should not mutate original order when shipping', () => {
      const original: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      }).confirm();

      const shipped: Order = original.ship();

      expect(original.status).toBe(OrderStatus.CONFIRMED);
      expect(shipped.status).toBe(OrderStatus.SHIPPED);
      expect(original).not.toBe(shipped);
    });

    it('should not mutate original order when delivering', () => {
      const original: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      })
        .confirm()
        .ship();

      const delivered: Order = original.deliver();

      expect(original.status).toBe(OrderStatus.SHIPPED);
      expect(delivered.status).toBe(OrderStatus.DELIVERED);
      expect(original).not.toBe(delivered);
    });

    it('should not mutate original order when cancelling', () => {
      const original: Order = Order.create({
        userId: 'user-123',
        productId: 'product-456',
        quantity: 1,
        unitPrice: 100,
      });

      const cancelled: Order = original.cancel();

      expect(original.status).toBe(OrderStatus.PENDING);
      expect(cancelled.status).toBe(OrderStatus.CANCELLED);
      expect(original).not.toBe(cancelled);
    });
  });
});
