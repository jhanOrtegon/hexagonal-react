import axios from 'axios';

import type { UserResponseDTO } from '@/core/user/application/types';
import type { UserRepository, UserFilters } from '@/core/user/domain/types';
import type { User } from '@/core/user/domain/User.entity';

import { httpClient } from '../shared/http/axios.client';

import {
  userApiToDomain,
  userApiToDomainList,
  userToApiCreateRequest,
  userToApiUpdateRequest,
} from './mappers/UserApi.mapper';

/**
 * UserApiRepository - Implementación con API REST usando Axios
 * Comunica con backend para persistir usuarios
 */
export class UserApiRepository implements UserRepository {
  private readonly basePath: string = '/users';

  public async findById(id: string): Promise<User | null> {
    try {
      const response: UserResponseDTO = await httpClient.get<UserResponseDTO>(
        `${this.basePath}/${id}`
      );
      return userApiToDomain(response);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  public async findByEmail(email: string): Promise<User | null> {
    try {
      const response: UserResponseDTO = await httpClient.get<UserResponseDTO>(
        `${this.basePath}/by-email/${encodeURIComponent(email)}`
      );
      return userApiToDomain(response);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  public async findAll(filters?: UserFilters): Promise<User[]> {
    try {
      const params: Record<string, string> = {};

      if (filters?.name !== undefined) {
        params['name'] = filters.name;
      }

      if (filters?.email !== undefined) {
        params['email'] = filters.email;
      }

      if (filters?.createdAfter !== undefined) {
        params['createdAfter'] = filters.createdAfter.toISOString();
      }

      if (filters?.createdBefore !== undefined) {
        params['createdBefore'] = filters.createdBefore.toISOString();
      }

      const response: UserResponseDTO[] = await httpClient.get<UserResponseDTO[]>(this.basePath, {
        params,
      });

      return userApiToDomainList(response);
    } catch (error: unknown) {
      console.error('Error fetching users from API:', error);
      throw error;
    }
  }

  public async save(user: User): Promise<User> {
    try {
      // Verificar si el usuario ya existe (tiene ID válido en la DB)
      const exists: boolean = await this.exists(user.id);

      if (exists) {
        // Update
        const requestBody: { email?: string; name?: string } = userToApiUpdateRequest(user);
        const response: UserResponseDTO = await httpClient.put<UserResponseDTO>(
          `${this.basePath}/${user.id}`,
          requestBody
        );
        return userApiToDomain(response);
      } else {
        // Create
        const requestBody: { email: string; name: string } = userToApiCreateRequest(user);
        const response: UserResponseDTO = await httpClient.post<UserResponseDTO>(
          this.basePath,
          requestBody
        );
        return userApiToDomain(response);
      }
    } catch (error: unknown) {
      console.error('Error saving user to API:', error);
      throw error;
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      await httpClient.delete(`${this.basePath}/${id}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Si no existe, no hacer nada
        return;
      }
      throw error;
    }
  }

  public async exists(id: string): Promise<boolean> {
    try {
      await httpClient.get<UserResponseDTO>(`${this.basePath}/${id}`);
      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  public async existsByEmail(email: string): Promise<boolean> {
    try {
      await httpClient.get<UserResponseDTO>(
        `${this.basePath}/by-email/${encodeURIComponent(email)}`
      );
      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }
}
