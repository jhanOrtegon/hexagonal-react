import { OrderNotFoundError } from '../../domain/Order.errors';
import { OrderResponseMapper } from '../dtos/OrderResponse.dto';

import type { Order } from '../../domain/Order.entity';
import type { OrderRepository } from '../../domain/types';
import type { OrderResponseDTO } from '../types';

/**
 * Use Case: Cancelar un pedido
 */
export class CancelOrder {
  private readonly orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  public async execute(id: string): Promise<OrderResponseDTO> {
    // 1. Buscar pedido existente
    const existingOrder: Order | null = await this.orderRepository.findById(id);

    if (existingOrder === null) {
      throw new OrderNotFoundError(id);
    }

    // 2. Cancelar pedido (validaciones en la entidad)
    const cancelledOrder: Order = existingOrder.cancel();

    // 3. Persistir cambios
    const savedOrder: Order = await this.orderRepository.save(cancelledOrder);

    // 4. Retornar DTO
    return OrderResponseMapper.fromEntity(savedOrder);
  }
}
