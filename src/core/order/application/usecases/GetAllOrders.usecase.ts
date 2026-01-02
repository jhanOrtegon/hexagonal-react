import { OrderResponseMapper } from '../dtos/OrderResponse.dto';

import type { Order } from '../../domain/Order.entity';
import type { OrderFilters, OrderRepository } from '../../domain/types';
import type { OrderResponseDTO } from '../types';

/**
 * Use Case: Obtener todos los pedidos
 */
export class GetAllOrders {
  private readonly orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  public async execute(filters?: OrderFilters): Promise<OrderResponseDTO[]> {
    const orders: Order[] = await this.orderRepository.findAll(filters);
    return orders.map((order: Order) => OrderResponseMapper.fromEntity(order));
  }
}
