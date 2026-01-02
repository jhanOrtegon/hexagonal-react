import { OrderResponseMapper } from '../dtos/OrderResponse.dto';

import type { Order } from '../../domain/Order.entity';
import type { OrderRepository } from '../../domain/types';
import type { OrderResponseDTO } from '../types';

/**
 * Use Case: Obtener pedidos por usuario
 */
export class GetOrdersByUser {
  private readonly orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  public async execute(userId: string): Promise<OrderResponseDTO[]> {
    const orders: Order[] = await this.orderRepository.findByUserId(userId);
    return orders.map((order: Order) => OrderResponseMapper.fromEntity(order));
  }
}
