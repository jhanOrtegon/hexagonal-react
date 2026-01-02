import { Order } from '../../core/order/domain/Order.entity';
import { OrderNotFoundError } from '../../core/order/domain/Order.errors';
import { axiosClient } from '../shared/http/axios.client';

import type { OrderFilters, OrderRepository } from '../../core/order/domain/types';
import type { OrderData } from '../../core/order/domain/types/order.types';
import type { AxiosResponse } from 'axios';

/**
 * Repository Implementation: OrderApiRepository
 * Implementación usando API HTTP con Axios
 */
export class OrderApiRepository implements OrderRepository {
  private readonly baseUrl: string = '/orders';

  /**
   * Mapear datos de API a entidad de dominio
   */
  private toDomain(data: OrderData): Order {
    return Order.restore({
      id: data.id,
      userId: data.userId,
      productId: data.productId,
      quantity: data.quantity,
      totalPrice: data.totalPrice,
      status: data.status,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    });
  }

  /**
   * Mapear entidad de dominio a datos de API
   */
  private toApi(order: Order): OrderData {
    return {
      id: order.id,
      userId: order.userId,
      productId: order.productId,
      quantity: order.quantity,
      totalPrice: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  public async findById(id: string): Promise<Order | null> {
    try {
      const response: AxiosResponse<OrderData> =
        await axiosClient.get<OrderData>(`${this.baseUrl}/${id}`);
      return this.toDomain(response.data);
    } catch (error: unknown) {
      if (
        error !== null &&
        typeof error === 'object' &&
        'response' in error &&
        error.response !== null &&
        typeof error.response === 'object' &&
        'status' in error.response &&
        error.response.status === 404
      ) {
        return null;
      }
      throw error;
    }
  }

  public async findAll(filters?: OrderFilters): Promise<Order[]> {
    const params: Record<string, string> = {};

    if (filters !== undefined) {
      if (filters.userId !== undefined) {
        params['userId'] = filters.userId;
      }
      if (filters.productId !== undefined) {
        params['productId'] = filters.productId;
      }
      if (filters.status !== undefined) {
        params['status'] = filters.status;
      }
      if (filters.createdAfter !== undefined) {
        params['createdAfter'] = filters.createdAfter.toISOString();
      }
      if (filters.createdBefore !== undefined) {
        params['createdBefore'] = filters.createdBefore.toISOString();
      }
    }

    const response: AxiosResponse<OrderData[]> = await axiosClient.get<
      OrderData[]
    >(this.baseUrl, { params });

    return response.data.map((orderData: OrderData) =>
      this.toDomain(orderData)
    );
  }

  public async findByUserId(userId: string): Promise<Order[]> {
    return this.findAll({ userId });
  }

  public async findByProductId(productId: string): Promise<Order[]> {
    return this.findAll({ productId });
  }

  public async save(order: Order): Promise<Order> {
    const orderData: OrderData = this.toApi(order);

    // Intentar actualizar primero (asumiendo que existe)
    try {
      const response: AxiosResponse<OrderData> = await axiosClient.put<OrderData>(
        `${this.baseUrl}/${order.id}`,
        orderData
      );
      return this.toDomain(response.data);
    } catch (error: unknown) {
      // Si no existe (404), crear nuevo
      if (
        error !== null &&
        typeof error === 'object' &&
        'response' in error &&
        error.response !== null &&
        typeof error.response === 'object' &&
        'status' in error.response &&
        error.response.status === 404
      ) {
        const createResponse: AxiosResponse<OrderData> =
          await axiosClient.post<OrderData>(this.baseUrl, orderData);
        return this.toDomain(createResponse.data);
      }
      throw error;
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      await axiosClient.delete(`${this.baseUrl}/${id}`);
    } catch (error: unknown) {
      if (
        error !== null &&
        typeof error === 'object' &&
        'response' in error &&
        error.response !== null &&
        typeof error.response === 'object' &&
        'status' in error.response &&
        error.response.status === 404
      ) {
        throw new OrderNotFoundError(id);
      }
      throw error;
    }
  }

  public async exists(id: string): Promise<boolean> {
    const order: Order | null = await this.findById(id);
    return order !== null;
  }
}
