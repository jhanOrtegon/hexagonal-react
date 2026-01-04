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
 * Usa optimistic updates para mejorar UX
 * Rollback automático en caso de error
 */
export function useCreateUserMutation(): UseMutationResult<UserResponseDTO, Error, CreateUserDTO> {
  const queryClient: QueryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserDTO): Promise<UserResponseDTO> => {
      const repository: UserRepository = container.getUserRepository();
      const useCase: CreateUser = new CreateUser(repository);
      return await useCase.execute(data);
    },
    onMutate: async (
      newUser: CreateUserDTO
    ): Promise<{ previousUsers: UserResponseDTO[] | undefined }> => {
      // Cancelar queries en curso para evitar race conditions
      await queryClient.cancelQueries({ queryKey: queryKeys.users.all });

      // Snapshot del estado anterior para rollback
      const previousUsers: UserResponseDTO[] | undefined = queryClient.getQueryData(
        queryKeys.users.lists()
      );

      // Optimistic update: agregar usuario temporalmente
      queryClient.setQueryData<UserResponseDTO[]>(
        queryKeys.users.lists(),
        (old: UserResponseDTO[] | undefined): UserResponseDTO[] => {
          const optimisticUser: UserResponseDTO = {
            id: `temp-${String(Date.now())}`, // ID temporal
            email: newUser.email,
            name: newUser.name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return old !== undefined ? [...old, optimisticUser] : [optimisticUser];
        }
      );

      return { previousUsers };
    },
    onError: (
      _error: Error,
      _newUser: CreateUserDTO,
      context: { previousUsers: UserResponseDTO[] | undefined } | undefined
    ): void => {
      // Rollback: restaurar estado anterior en caso de error
      if (context?.previousUsers !== undefined) {
        queryClient.setQueryData(queryKeys.users.lists(), context.previousUsers);
      }
    },
    onSettled: async (): Promise<void> => {
      // Siempre invalidar queries para sincronizar con servidor
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

/**
 * Hook para actualizar un usuario existente
 * Usa optimistic updates para mejorar UX
 * Rollback automático en caso de error
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
    onMutate: async (variables: {
      id: string;
      data: UpdateUserDTO;
    }): Promise<{
      previousUser: UserResponseDTO | undefined;
      previousUsers: UserResponseDTO[] | undefined;
    }> => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: queryKeys.users.detail(variables.id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.users.all });

      // Snapshot del estado anterior
      const previousUser: UserResponseDTO | undefined = queryClient.getQueryData(
        queryKeys.users.detail(variables.id)
      );
      const previousUsers: UserResponseDTO[] | undefined = queryClient.getQueryData(
        queryKeys.users.lists()
      );

      // Optimistic update: actualizar usuario en detalle
      if (previousUser !== undefined) {
        queryClient.setQueryData<UserResponseDTO>(
          queryKeys.users.detail(variables.id),
          (old: UserResponseDTO | undefined): UserResponseDTO => {
            if (old === undefined) {
              return previousUser;
            }
            return {
              ...old,
              email: variables.data.email ?? old.email,
              name: variables.data.name ?? old.name,
              updatedAt: new Date().toISOString(),
            };
          }
        );
      }

      // Optimistic update: actualizar usuario en lista
      queryClient.setQueryData<UserResponseDTO[]>(
        queryKeys.users.lists(),
        (old: UserResponseDTO[] | undefined): UserResponseDTO[] => {
          if (old === undefined) {
            return [];
          }
          return old.map(
            (user: UserResponseDTO): UserResponseDTO =>
              user.id === variables.id
                ? {
                    ...user,
                    email: variables.data.email ?? user.email,
                    name: variables.data.name ?? user.name,
                    updatedAt: new Date().toISOString(),
                  }
                : user
          );
        }
      );

      return { previousUser, previousUsers };
    },
    onError: (
      _error: Error,
      variables: { id: string; data: UpdateUserDTO },
      context:
        | {
            previousUser: UserResponseDTO | undefined;
            previousUsers: UserResponseDTO[] | undefined;
          }
        | undefined
    ): void => {
      // Rollback en caso de error
      if (context?.previousUser !== undefined) {
        queryClient.setQueryData(queryKeys.users.detail(variables.id), context.previousUser);
      }
      if (context?.previousUsers !== undefined) {
        queryClient.setQueryData(queryKeys.users.lists(), context.previousUsers);
      }
    },
    onSettled: async (
      _data: UserResponseDTO | undefined,
      _error: Error | null,
      variables: { id: string; data: UpdateUserDTO }
    ): Promise<void> => {
      // Sincronizar con servidor
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

/**
 * Hook para eliminar un usuario
 * Usa optimistic updates para mejorar UX
 * Rollback automático en caso de error
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
    onMutate: async (
      userId: string
    ): Promise<{
      previousUser: UserResponseDTO | undefined;
      previousUsers: UserResponseDTO[] | undefined;
    }> => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: queryKeys.users.detail(userId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.users.all });

      // Snapshot del estado anterior
      const previousUser: UserResponseDTO | undefined = queryClient.getQueryData(
        queryKeys.users.detail(userId)
      );
      const previousUsers: UserResponseDTO[] | undefined = queryClient.getQueryData(
        queryKeys.users.lists()
      );

      // Optimistic update: eliminar usuario de la lista
      queryClient.setQueryData<UserResponseDTO[]>(
        queryKeys.users.lists(),
        (old: UserResponseDTO[] | undefined): UserResponseDTO[] => {
          if (old === undefined) {
            return [];
          }
          return old.filter((user: UserResponseDTO): boolean => user.id !== userId);
        }
      );

      // Remover usuario de cache de detalle
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(userId) });

      return { previousUser, previousUsers };
    },
    onError: (
      _error: Error,
      userId: string,
      context:
        | {
            previousUser: UserResponseDTO | undefined;
            previousUsers: UserResponseDTO[] | undefined;
          }
        | undefined
    ): void => {
      // Rollback en caso de error
      if (context?.previousUser !== undefined) {
        queryClient.setQueryData(queryKeys.users.detail(userId), context.previousUser);
      }
      if (context?.previousUsers !== undefined) {
        queryClient.setQueryData(queryKeys.users.lists(), context.previousUsers);
      }
    },
    onSettled: async (): Promise<void> => {
      // Sincronizar con servidor
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
