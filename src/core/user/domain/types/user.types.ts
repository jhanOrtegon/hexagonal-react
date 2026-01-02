/**
 * User Domain Types
 * Tipos puros del dominio sin lógica de negocio
 */

export interface CreateUserData {
  readonly email: string;
  readonly name: string;
}

export interface RestoreUserData {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface UserFilters {
  readonly name?: string;
  readonly email?: string;
  readonly createdAfter?: Date;
  readonly createdBefore?: Date;
}
