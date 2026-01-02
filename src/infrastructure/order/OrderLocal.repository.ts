import { Order } from '../../core/order/domain/Order.entity';

import type { OrderFilters, OrderRepository } from '../../core/order/domain/types';
import type { OrderData } from '../../core/order/domain/types/order.types';

/**
 * OrderLocalRepository - Implementación con LocalStorage
 * Persiste pedidos en el navegador usando localStorage
 */
export class OrderLocalRepository implements OrderRepository {
  private readonly STORAGE_KEY: string = 'hexagonal-tdd:orders';

  /**
   * Obtiene todos los pedidos del localStorage
   */
  private getAllFromStorage(): Order[] {
    const data: string | null = localStorage.getItem(this.STORAGE_KEY);
    if (data === null) {
      return [];
    }

    try {
      const orders: OrderData[] = JSON.parse(data) as OrderData[];
      return orders.map((orderData: OrderData) =>
        Order.restore({
          id: orderData.id,
          userId: orderData.userId,
          productId: orderData.productId,
          quantity: orderData.quantity,
          totalPrice: orderData.totalPrice,
          status: orderData.status,
          createdAt: new Date(orderData.createdAt),
          updatedAt: new Date(orderData.updatedAt),
        })
      );
    } catch (error: unknown) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  /**
   * Guarda todos los pedidos en localStorage
   */
  private saveAllToStorage(orders: Order[]): void {
    try {
      const data: OrderData[] = orders.map((order: Order) => ({
        id: order.id,
        userId: order.userId,
        productId: order.productId,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      }));

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error: unknown) {
      console.error('Error writing to localStorage:', error);
      throw new Error('Failed to save to localStorage');
    }
  }

  public findById(id: string): Promise<Order | null> {
    const orders: Order[] = this.getAllFromStorage();
    const order: Order | undefined = orders.find((o: Order) => o.id === id);
    return Promise.resolve(order ?? null);
  }

  public findAll(filters?: OrderFilters): Promise<Order[]> {
    let orders: Order[] = this.getAllFromStorage();

    if (filters === undefined) {
      return Promise.resolve(orders);
    }

    if (filters.userId !== undefined) {
      orders = orders.filter((o: Order) => o.userId === filters.userId);
    }

    if (filters.productId !== undefined) {
      orders = orders.filter((o: Order) => o.productId === filters.productId);
    }

    if (filters.status !== undefined) {
      orders = orders.filter((o: Order) => o.status === filters.status);
    }

    if (filters.createdAfter !== undefined) {
      const { createdAfter }: Pick<OrderFilters, 'createdAfter'> = filters;
      orders = orders.filter((o: Order) => o.createdAt >= createdAfter);
    }

    if (filters.createdBefore !== undefined) {
      const { createdBefore }: Pick<OrderFilters, 'createdBefore'> = filters;
      orders = orders.filter((o: Order) => o.createdAt <= createdBefore);
    }

    return Promise.resolve(orders);
  }

  public findByUserId(userId: string): Promise<Order[]> {
    const orders: Order[] = this.getAllFromStorage();
    return Promise.resolve(orders.filter((order: Order) => order.userId === userId));
  }

  public findByProductId(productId: string): Promise<Order[]> {
    const orders: Order[] = this.getAllFromStorage();
    return Promise.resolve(orders.filter((order: Order) => order.productId === productId));
  }

  public save(order: Order): Promise<Order> {
    const orders: Order[] = this.getAllFromStorage();
    const index: number = orders.findIndex((o: Order) => o.id === order.id);

    if (index >= 0) {
      // Actualizar existente
      orders[index] = order;
    } else {
      // Crear nuevo
      orders.push(order);
    }

    this.saveAllToStorage(orders);
    return Promise.resolve(order);
  }

  public delete(id: string): Promise<void> {
    const orders: Order[] = this.getAllFromStorage();
    const filteredOrders: Order[] = orders.filter((order: Order) => order.id !== id);

    // Idempotent operation: don't throw if order doesn't exist
    this.saveAllToStorage(filteredOrders);
    return Promise.resolve();
  }

  public async exists(id: string): Promise<boolean> {
    const order: Order | null = await this.findById(id);
    return order !== null;
  }

  /**
   * Método auxiliar para limpiar el storage (útil para testing)
   */
  public clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
