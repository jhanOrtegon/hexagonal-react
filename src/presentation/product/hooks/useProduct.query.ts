import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  CreateProductDTO,
  ProductResponseDTO,
  UpdateProductDTO,
} from '@/core/product/application/types';
import {
  CreateProduct,
  DeleteProduct,
  GetAllProducts,
  GetProductById,
  UpdateProduct,
} from '@/core/product/application/usecases';
import type { ProductRepository, ProductFilters } from '@/core/product/domain/types';
import { container } from '@/infrastructure/di/container';
import { queryKeys } from '@/infrastructure/shared/react-query/config';


import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';


/**
 * Hook para obtener todos los productos con filtros opcionales
 */
export function useProductsQuery(
  filters?: ProductFilters
): UseQueryResult<ProductResponseDTO[]> {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: async (): Promise<ProductResponseDTO[]> => {
      const repository: ProductRepository = container.getProductRepository();
      const useCase: GetAllProducts = new GetAllProducts(repository);
      return await useCase.execute(filters);
    },
  });
}

/**
 * Hook para obtener un producto por ID
 */
export function useProductQuery(productId: string): UseQueryResult<ProductResponseDTO> {
  return useQuery({
    queryKey: queryKeys.products.detail(productId),
    queryFn: async (): Promise<ProductResponseDTO> => {
      const repository: ProductRepository = container.getProductRepository();
      const useCase: GetProductById = new GetProductById(repository);
      return await useCase.execute(productId);
    },
    enabled: productId.length > 0,
  });
}

/**
 * Hook para crear un producto
 */
export function useCreateProductMutation(): UseMutationResult<
  ProductResponseDTO,
  Error,
  CreateProductDTO
> {
  const queryClient: QueryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateProductDTO): Promise<ProductResponseDTO> => {
      const repository: ProductRepository = container.getProductRepository();
      const useCase: CreateProduct = new CreateProduct(repository);
      return await useCase.execute(dto);
    },
    onSuccess: (): void => {
      // Invalida todas las listas para refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() }).catch((err: unknown) => {
        console.error('Error invalidating products list:', err);
      });
    },
  });
}

/**
 * Hook para actualizar un producto
 */
export function useUpdateProductMutation(): UseMutationResult<
  ProductResponseDTO,
  Error,
  UpdateProductDTO
> {
  const queryClient: QueryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: UpdateProductDTO): Promise<ProductResponseDTO> => {
      const repository: ProductRepository = container.getProductRepository();
      const useCase: UpdateProduct = new UpdateProduct(repository);
      return await useCase.execute(dto);
    },
    onSuccess: (data: ProductResponseDTO): void => {
      // Invalida el cache del producto actualizado
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(data.id) }).catch((err: unknown) => {
        console.error('Error invalidating product detail:', err);
      });

      // Invalida todas las listas para refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() }).catch((err: unknown) => {
        console.error('Error invalidating products list:', err);
      });
    },
  });
}

/**
 * Hook para eliminar un producto
 */
export function useDeleteProductMutation(): UseMutationResult<undefined, Error, string> {
  const queryClient: QueryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<undefined> => {
      const repository: ProductRepository = container.getProductRepository();
      const useCase: DeleteProduct = new DeleteProduct(repository);
      await useCase.execute(id);
      return undefined;
    },
    onSuccess: (_data: undefined, productId: string): void => {
      // Elimina específicamente el cache del producto eliminado
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(productId) });

      // Invalida todas las listas para refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() }).catch((err: unknown) => {
        console.error('Error invalidating products list:', err);
      });
    },
  });
}
