import { OrderNotFoundError } from '../../domain/Order.errors';
import { OrderResponseMapper } from '../dtos/OrderResponse.dto';

import type { Order } from '../../domain/Order.entity';
import type { OrderRepository } from '../../domain/types';
import type { OrderResponseDTO } from '../types';

/**
 * Use Case: Obtener un pedido por ID
 */
export class GetOrderById {
  private readonly orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  public async execute(id: string): Promise<OrderResponseDTO> {
    const order: Order | null = await this.orderRepository.findById(id);

    if (order === null) {
      throw new OrderNotFoundError(id);
    }

    return OrderResponseMapper.fromEntity(order);
  }
}
