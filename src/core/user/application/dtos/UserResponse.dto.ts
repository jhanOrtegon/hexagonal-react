import type { User } from '../../domain/User.entity';

export interface UserResponseDTO {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface UserResponseMapperType {
  fromEntity: (user: User) => UserResponseDTO;
  fromEntities: (users: User[]) => UserResponseDTO[];
}

export const UserResponseMapper: UserResponseMapperType = {
  fromEntity(user: User): UserResponseDTO {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  },

  fromEntities(users: User[]): UserResponseDTO[] {
    return users.map((user: User) => UserResponseMapper.fromEntity(user));
  },
};
