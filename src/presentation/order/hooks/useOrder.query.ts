import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  CancelOrder,
  CreateOrder,
  DeleteOrder,
  GetAllOrders,
  GetOrderById,
  GetOrdersByProduct,
  GetOrdersByUser,
  UpdateOrderStatus,
} from '../../../core/order/application/usecases';
import { container } from '../../../infrastructure/di/container';

import type {
  CreateOrderDTO,
  OrderResponseDTO,
  UpdateOrderStatusDTO,
} from '../../../core/order/application/types';
import type { OrderFilters, OrderRepository } from '../../../core/order/domain/types';
import type { UserRepository } from '../../../core/user/domain/types';
import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';

const QUERY_KEY_ORDERS: 'orders' = 'orders' as const;
const QUERY_KEY_ORDER: 'order' = 'order' as const;

/**
 * Hook: useOrdersQuery
 * Obtiene la lista de pedidos (con filtros opcionales)
 */
export function useOrdersQuery(filters?: OrderFilters): UseQueryResult<OrderResponseDTO[]> {
  const repository: OrderRepository = container.getOrderRepository();
  const getAllOrders: GetAllOrders = new GetAllOrders(repository);

  return useQuery<OrderResponseDTO[]>({
    queryKey: [QUERY_KEY_ORDERS, filters],
    queryFn: async (): Promise<OrderResponseDTO[]> => getAllOrders.execute(filters),
    staleTime: 30_000, // 30 segundos
    gcTime: 5 * 60 * 1_000, // 5 minutos
  });
}

/**
 * Hook: useOrderQuery
 * Obtiene un pedido específico por ID
 */
export function useOrderQuery(orderId: string): UseQueryResult<OrderResponseDTO> {
  const repository: OrderRepository = container.getOrderRepository();
  const getOrderById: GetOrderById = new GetOrderById(repository);

  return useQuery<OrderResponseDTO>({
    queryKey: [QUERY_KEY_ORDER, orderId],
    queryFn: async (): Promise<OrderResponseDTO> => getOrderById.execute(orderId),
    enabled: orderId.length > 0,
    staleTime: 30_000,
  });
}

/**
 * Hook: useOrdersByUserQuery
 * Obtiene pedidos de un usuario específico
 */
export function useOrdersByUserQuery(userId: string): UseQueryResult<OrderResponseDTO[]> {
  const repository: OrderRepository = container.getOrderRepository();
  const getOrdersByUser: GetOrdersByUser = new GetOrdersByUser(repository);

  return useQuery<OrderResponseDTO[]>({
    queryKey: [QUERY_KEY_ORDERS, 'user', userId],
    queryFn: async (): Promise<OrderResponseDTO[]> => getOrdersByUser.execute(userId),
    enabled: userId.length > 0,
    staleTime: 30_000,
  });
}

/**
 * Hook: useOrdersByProductQuery
 * Obtiene pedidos de un producto específico
 */
export function useOrdersByProductQuery(productId: string): UseQueryResult<OrderResponseDTO[]> {
  const repository: OrderRepository = container.getOrderRepository();
  const getOrdersByProduct: GetOrdersByProduct = new GetOrdersByProduct(repository);

  return useQuery<OrderResponseDTO[]>({
    queryKey: [QUERY_KEY_ORDERS, 'product', productId],
    queryFn: async (): Promise<OrderResponseDTO[]> => getOrdersByProduct.execute(productId),
    enabled: productId.length > 0,
    staleTime: 30_000,
  });
}

/**
 * Hook: useCreateOrderMutation
 * Crea un nuevo pedido
 */
export function useCreateOrderMutation(): UseMutationResult<
  OrderResponseDTO,
  Error,
  CreateOrderDTO
> {
  const queryClient: QueryClient = useQueryClient();
  const orderRepository: OrderRepository = container.getOrderRepository();
  const userRepository: UserRepository = container.getUserRepository();
  const createOrder: CreateOrder = new CreateOrder(orderRepository, userRepository);

  return useMutation<OrderResponseDTO, Error, CreateOrderDTO>({
    mutationFn: async (dto: CreateOrderDTO): Promise<OrderResponseDTO> => createOrder.execute(dto),
    onSuccess: async (): Promise<void> => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ORDERS] });
    },
  });
}

/**
 * Hook: useUpdateOrderStatusMutation
 * Actualiza el estado de un pedido
 */
export function useUpdateOrderStatusMutation(): UseMutationResult<
  OrderResponseDTO,
  Error,
  UpdateOrderStatusDTO
> {
  const queryClient: QueryClient = useQueryClient();
  const repository: OrderRepository = container.getOrderRepository();
  const updateOrderStatus: UpdateOrderStatus = new UpdateOrderStatus(repository);

  return useMutation<OrderResponseDTO, Error, UpdateOrderStatusDTO>({
    mutationFn: async (dto: UpdateOrderStatusDTO): Promise<OrderResponseDTO> =>
      updateOrderStatus.execute(dto),
    onSuccess: async (data: OrderResponseDTO): Promise<void> => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ORDERS] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ORDER, data.id] });
    },
  });
}

/**
 * Hook: useCancelOrderMutation
 * Cancela un pedido
 */
export function useCancelOrderMutation(): UseMutationResult<OrderResponseDTO, Error, string> {
  const queryClient: QueryClient = useQueryClient();
  const repository: OrderRepository = container.getOrderRepository();
  const cancelOrder: CancelOrder = new CancelOrder(repository);

  return useMutation<OrderResponseDTO, Error, string>({
    mutationFn: async (orderId: string): Promise<OrderResponseDTO> => cancelOrder.execute(orderId),
    onSuccess: async (data: OrderResponseDTO): Promise<void> => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ORDERS] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ORDER, data.id] });
    },
  });
}

/**
 * Hook: useDeleteOrderMutation
 * Elimina un pedido
 */
export function useDeleteOrderMutation(): UseMutationResult<undefined, Error, string> {
  const queryClient: QueryClient = useQueryClient();
  const repository: OrderRepository = container.getOrderRepository();
  const deleteOrder: DeleteOrder = new DeleteOrder(repository);

  return useMutation<undefined, Error, string>({
    mutationFn: async (orderId: string): Promise<undefined> => {
      await deleteOrder.execute(orderId);
      return undefined;
    },
    onSuccess: async (_data: undefined, orderId: string): Promise<void> => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ORDERS] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ORDER, orderId] });
    },
  });
}
