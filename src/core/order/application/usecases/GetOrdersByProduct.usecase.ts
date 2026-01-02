import { OrderResponseMapper } from '../dtos/OrderResponse.dto';

import type { Order } from '../../domain/Order.entity';
import type { OrderRepository } from '../../domain/types';
import type { OrderResponseDTO } from '../types';

/**
 * Use Case: Obtener pedidos por producto
 */
export class GetOrdersByProduct {
  private readonly orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  public async execute(productId: string): Promise<OrderResponseDTO[]> {
    const orders: Order[] =
      await this.orderRepository.findByProductId(productId);
    return orders.map((order: Order) => OrderResponseMapper.fromEntity(order));
  }
}
