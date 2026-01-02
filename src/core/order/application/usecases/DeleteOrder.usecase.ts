import { OrderNotFoundError } from '../../domain/Order.errors';

import type { OrderRepository } from '../../domain/types';

/**
 * Use Case: Eliminar un pedido
 */
export class DeleteOrder {
  private readonly orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  public async execute(id: string): Promise<void> {
    // 1. Verificar que el pedido existe
    const exists: boolean = await this.orderRepository.exists(id);

    if (!exists) {
      throw new OrderNotFoundError(id);
    }

    // 2. Eliminar pedido
    await this.orderRepository.delete(id);
  }
}
