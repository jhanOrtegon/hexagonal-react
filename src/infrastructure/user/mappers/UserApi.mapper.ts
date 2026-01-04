import type { UserResponseDTO } from '@/core/user/application/types';
import { User } from '@/core/user/domain/User.entity';

/**
 * UserApiMapper
 * Mapea entre API DTOs y Domain Entities
 */

/**
 * Convierte UserResponseDTO (API) a User Entity (Domain)
 */
export function userApiToDomain(dto: UserResponseDTO): User {
  return User.restore({
    id: dto.id,
    email: dto.email,
    name: dto.name,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  });
}

/**
 * Convierte User Entity (Domain) a request body para API (create)
 */
export function userToApiCreateRequest(user: User): { email: string; name: string } {
  return {
    email: user.email,
    name: user.name,
  };
}

/**
 * Convierte User Entity (Domain) a request body para API (update)
 */
export function userToApiUpdateRequest(user: User): { email?: string; name?: string } {
  return {
    email: user.email,
    name: user.name,
  };
}

/**
 * Convierte array de DTOs a array de Entities
 */
export function userApiToDomainList(dtos: UserResponseDTO[]): User[] {
  return dtos.map((dto: UserResponseDTO): User => userApiToDomain(dto));
}
