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
import type { OrderFilters } from '../../../core/order/domain/types';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

const QUERY_KEY_ORDERS = 'orders';
const QUERY_KEY_ORDER = 'order';

/**
 * Hook: useOrdersQuery
 * Obtiene la lista de pedidos (con filtros opcionales)
 */
export const useOrdersQuery = (filters?: OrderFilters): UseQueryResult<OrderResponseDTO[]> => {
  const repository = container.getOrderRepository();
  const getAllOrders: GetAllOrders = new GetAllOrders(repository);

  return useQuery<OrderResponseDTO[]>({
    queryKey: [QUERY_KEY_ORDERS, filters],
    queryFn: async (): Promise<OrderResponseDTO[]> => getAllOrders.execute(filters),
    staleTime: 30_000, // 30 segundos
    gcTime: 5 * 60 * 1_000, // 5 minutos
  });
};

/**
 * Hook: useOrderQuery
 * Obtiene un pedido específico por ID
 */
export const useOrderQuery = (orderId: string): UseQueryResult<OrderResponseDTO> => {
  const repository = container.getOrderRepository();
  const getOrderById: GetOrderById = new GetOrderById(repository);

  return useQuery<OrderResponseDTO>({
    queryKey: [QUERY_KEY_ORDER, orderId],
    queryFn: async (): Promise<OrderResponseDTO> => getOrderById.execute(orderId),
    enabled: orderId.length > 0,
    staleTime: 30_000,
  });
};

/**
 * Hook: useOrdersByUserQuery
 * Obtiene pedidos de un usuario específico
 */
export const useOrdersByUserQuery = (userId: string): UseQueryResult<OrderResponseDTO[]> => {
  const repository = container.getOrderRepository();
  const getOrdersByUser: GetOrdersByUser = new GetOrdersByUser(repository);

  return useQuery<OrderResponseDTO[]>({
    queryKey: [QUERY_KEY_ORDERS, 'user', userId],
    queryFn: async (): Promise<OrderResponseDTO[]> => getOrdersByUser.execute(userId),
    enabled: userId.length > 0,
    staleTime: 30_000,
  });
};

/**
 * Hook: useOrdersByProductQuery
 * Obtiene pedidos de un producto específico
 */
export const useOrdersByProductQuery = (productId: string): UseQueryResult<OrderResponseDTO[]> => {
  const repository = container.getOrderRepository();
  const getOrdersByProduct: GetOrdersByProduct = new GetOrdersByProduct(repository);

  return useQuery<OrderResponseDTO[]>({
    queryKey: [QUERY_KEY_ORDERS, 'product', productId],
    queryFn: async (): Promise<OrderResponseDTO[]> => getOrdersByProduct.execute(productId),
    enabled: productId.length > 0,
    staleTime: 30_000,
  });
};

/**
 * Hook: useCreateOrderMutation
 * Crea un nuevo pedido
 */
export const useCreateOrderMutation = (): UseMutationResult<OrderResponseDTO, Error, CreateOrderDTO> => {
  const queryClient = useQueryClient();
  const repository = container.getOrderRepository();
  const createOrder: CreateOrder = new CreateOrder(repository);

  return useMutation<OrderResponseDTO, Error, CreateOrderDTO>({
    mutationFn: async (dto: CreateOrderDTO): Promise<OrderResponseDTO> => createOrder.execute(dto),
    onSuccess: (): void => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ORDERS] });
    },
  });
};

/**
 * Hook: useUpdateOrderStatusMutation
 * Actualiza el estado de un pedido
 */
export const useUpdateOrderStatusMutation = (): UseMutationResult<OrderResponseDTO, Error, UpdateOrderStatusDTO> => {
  const queryClient = useQueryClient();
  const repository = container.getOrderRepository();
  const updateOrderStatus: UpdateOrderStatus = new UpdateOrderStatus(repository);

  return useMutation<OrderResponseDTO, Error, UpdateOrderStatusDTO>({
    mutationFn: async (dto: UpdateOrderStatusDTO): Promise<OrderResponseDTO> =>
      updateOrderStatus.execute(dto),
    onSuccess: (data: OrderResponseDTO): void => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ORDERS] });
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ORDER, data.id] });
    },
  });
};

/**
 * Hook: useCancelOrderMutation
 * Cancela un pedido
 */
export const useCancelOrderMutation = (): UseMutationResult<OrderResponseDTO, Error, string> => {
  const queryClient = useQueryClient();
  const repository = container.getOrderRepository();
  const cancelOrder: CancelOrder = new CancelOrder(repository);

  return useMutation<OrderResponseDTO, Error, string>({
    mutationFn: async (orderId: string): Promise<OrderResponseDTO> => cancelOrder.execute(orderId),
    onSuccess: (data: OrderResponseDTO): void => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ORDERS] });
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ORDER, data.id] });
    },
  });
};

/**
 * Hook: useDeleteOrderMutation
 * Elimina un pedido
 */
export const useDeleteOrderMutation = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();
  const repository = container.getOrderRepository();
  const deleteOrder: DeleteOrder = new DeleteOrder(repository);

  return useMutation<void, Error, string>({
    mutationFn: async (orderId: string): Promise<void> => deleteOrder.execute(orderId),
    onSuccess: (_data: void, orderId: string): void => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ORDERS] });
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ORDER, orderId] });
    },
  });
};
