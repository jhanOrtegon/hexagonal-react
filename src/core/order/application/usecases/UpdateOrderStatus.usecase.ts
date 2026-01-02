import { OrderNotFoundError } from '../../domain/Order.errors';
import { OrderResponseMapper } from '../dtos/OrderResponse.dto';

import type { Order } from '../../domain/Order.entity';
import type { OrderRepository } from '../../domain/types';
import type { OrderResponseDTO, UpdateOrderStatusDTO } from '../types';

/**
 * Use Case: Actualizar estado de un pedido
 */
export class UpdateOrderStatus {
  private readonly orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  public async execute(
    dto: UpdateOrderStatusDTO
  ): Promise<OrderResponseDTO> {
    // 1. Buscar pedido existente
    const existingOrder: Order | null =
      await this.orderRepository.findById(dto.id);

    if (existingOrder === null) {
      throw new OrderNotFoundError(dto.id);
    }

    // 2. Cambiar estado según el tipo de transición
    let updatedOrder: Order;

    switch (dto.status) {
      case 'PENDING':
        // No se puede volver a PENDING, mantener orden actual
        updatedOrder = existingOrder;
        break;
      case 'CONFIRMED':
        updatedOrder = existingOrder.confirm();
        break;
      case 'SHIPPED':
        updatedOrder = existingOrder.ship();
        break;
      case 'DELIVERED':
        updatedOrder = existingOrder.deliver();
        break;
      case 'CANCELLED':
        updatedOrder = existingOrder.cancel();
        break;
    }

    // 3. Persistir cambios
    const savedOrder: Order = await this.orderRepository.save(updatedOrder);

    // 4. Retornar DTO
    return OrderResponseMapper.fromEntity(savedOrder);
  }
}
