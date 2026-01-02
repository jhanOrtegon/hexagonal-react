/**
 * User Application DTOs Types
 */

export interface CreateUserDTO {
  readonly email: string;
  readonly name: string;
}

export interface UpdateUserDTO {
  readonly email?: string;
  readonly name?: string;
}

export interface UserResponseDTO {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
