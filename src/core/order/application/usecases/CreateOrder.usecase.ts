import { Order } from '../../domain/Order.entity';
import { OrderUserNotFoundError } from '../../domain/Order.errors';
import { OrderResponseMapper } from '../dtos/OrderResponse.dto';

import type { UserRepository } from '../../../user/domain/types';
import type { OrderRepository } from '../../domain/types';
import type { CreateOrderDTO, OrderResponseDTO } from '../types';

/**
 * Use Case: Crear un nuevo pedido
 * Valida que el usuario existe antes de crear el pedido
 */
export class CreateOrder {
  private readonly orderRepository: OrderRepository;
  private readonly userRepository: UserRepository;

  constructor(orderRepository: OrderRepository, userRepository: UserRepository) {
    this.orderRepository = orderRepository;
    this.userRepository = userRepository;
  }

  public async execute(dto: CreateOrderDTO): Promise<OrderResponseDTO> {
    // 1. Validar que el usuario existe
    const userExists: boolean = await this.userRepository.exists(dto.userId);

    if (!userExists) {
      throw new OrderUserNotFoundError(dto.userId);
    }

    // 2. Crear entidad de dominio
    const order: Order = Order.create({
      userId: dto.userId,
      productId: dto.productId,
      quantity: dto.quantity,
      unitPrice: dto.unitPrice,
    });

    // 3. Persistir
    const savedOrder: Order = await this.orderRepository.save(order);

    // 4. Retornar DTO
    return OrderResponseMapper.fromEntity(savedOrder);
  }
}
