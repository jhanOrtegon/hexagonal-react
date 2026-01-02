import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateUserDTO, UpdateUserDTO, UserResponseDTO } from '@/core/user/application/types';
import { CreateUser } from '@/core/user/application/usecases/CreateUser.usecase';
import { DeleteUser } from '@/core/user/application/usecases/DeleteUser.usecase';
import { GetAllUsers } from '@/core/user/application/usecases/GetAllUsers.usecase';
import { GetUserById } from '@/core/user/application/usecases/GetUserById.usecase';
import { UpdateUser } from '@/core/user/application/usecases/UpdateUser.usecase';
import type { UserFilters, UserRepository } from '@/core/user/domain/types';
import { container } from '@/infrastructure/di/container';
import { queryKeys } from '@/infrastructure/shared/react-query/config';

import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';

/**
 * Hook para obtener todos los usuarios con filtros opcionales
 * Usa React Query para caching automático y gestión de estado
 */
export function useUsersQuery(filters?: UserFilters): UseQueryResult<UserResponseDTO[]> {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: async (): Promise<UserResponseDTO[]> => {
      const repository: UserRepository = container.getUserRepository();
      const useCase: GetAllUsers = new GetAllUsers(repository);
      return await useCase.execute(filters);
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para obtener un usuario por ID
 * Se invalida automáticamente cuando hay mutaciones
 */
export function useUserQuery(userId: string): UseQueryResult<UserResponseDTO> {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: async (): Promise<UserResponseDTO> => {
      const repository: UserRepository = container.getUserRepository();
      const useCase: GetUserById = new GetUserById(repository);
      return await useCase.execute(userId);
    },
    enabled: Boolean(userId), // Solo ejecuta si userId existe
  });
}

/**
 * Hook para crear un nuevo usuario
 * Invalida automáticamente la lista de usuarios después de crear
 */
export function useCreateUserMutation(): UseMutationResult<UserResponseDTO, Error, CreateUserDTO> {
  const queryClient: QueryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserDTO): Promise<UserResponseDTO> => {
      const repository: UserRepository = container.getUserRepository();
      const useCase: CreateUser = new CreateUser(repository);
      return await useCase.execute(data);
    },
    onSuccess: async (): Promise<void> => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

/**
 * Hook para actualizar un usuario existente
 * Invalida tanto la lista como el detalle del usuario
 */
export function useUpdateUserMutation(): UseMutationResult<
  UserResponseDTO,
  Error,
  { id: string; data: UpdateUserDTO }
> {
  const queryClient: QueryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUserDTO;
    }): Promise<UserResponseDTO> => {
      const repository: UserRepository = container.getUserRepository();
      const useCase: UpdateUser = new UpdateUser(repository);
      return await useCase.execute(id, data);
    },
    onSuccess: async (
      _data: UserResponseDTO,
      variables: { id: string; data: UpdateUserDTO }
    ): Promise<void> => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

/**
 * Hook para eliminar un usuario
 * Invalida todas las queries relacionadas con usuarios
 */
export function useDeleteUserMutation(): UseMutationResult<undefined, Error, string> {
  const queryClient: QueryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<undefined> => {
      const repository: UserRepository = container.getUserRepository();
      const useCase: DeleteUser = new DeleteUser(repository);
      await useCase.execute(id);
      return undefined;
    },
    onSuccess: async (_data: undefined, userId: string): Promise<void> => {
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(userId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}
