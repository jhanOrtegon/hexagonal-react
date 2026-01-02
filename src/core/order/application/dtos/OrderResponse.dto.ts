import type { Order } from '../../domain/Order.entity';
import type { OrderResponseDTO } from '../types';

/**
 * Mapper para OrderResponseDTO
 */
export const OrderResponseMapper: {
  fromEntity: (order: Order) => OrderResponseDTO;
} = {
  fromEntity: (order: Order): OrderResponseDTO => ({
    id: order.id,
    userId: order.userId,
    productId: order.productId,
    quantity: order.quantity,
    totalPrice: order.totalPrice,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }),
};
