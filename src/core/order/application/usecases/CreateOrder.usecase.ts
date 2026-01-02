import { Order } from '../../domain/Order.entity';
import { OrderResponseMapper } from '../dtos/OrderResponse.dto';

import type { OrderRepository } from '../../domain/types';
import type { CreateOrderDTO, OrderResponseDTO } from '../types';

/**
 * Use Case: Crear un nuevo pedido
 */
export class CreateOrder {
  private readonly orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  public async execute(dto: CreateOrderDTO): Promise<OrderResponseDTO> {
    // Crear entidad de dominio
    const order: Order = Order.create({
      userId: dto.userId,
      productId: dto.productId,
      quantity: dto.quantity,
      unitPrice: dto.unitPrice,
    });

    // Persistir
    const savedOrder: Order = await this.orderRepository.save(order);

    // Retornar DTO
    return OrderResponseMapper.fromEntity(savedOrder);
  }
}
