import type { Order, OrderStatus } from '../Order.entity';

/**
 * Order Repository Interface
 * Define el contrato para persistencia de pedidos
 */
export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findAll(filters?: OrderFilters): Promise<Order[]>;
  findByUserId(userId: string): Promise<Order[]>;
  findByProductId(productId: string): Promise<Order[]>;
  save(order: Order): Promise<Order>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

/**
 * Filtros para búsqueda de pedidos
 */
export interface OrderFilters {
  readonly userId?: string;
  readonly productId?: string;
  readonly status?: OrderStatus;
  readonly createdAfter?: Date;
  readonly createdBefore?: Date;
}
