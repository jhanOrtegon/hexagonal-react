import { User } from '../../../core/user/domain/User.entity';

export interface ApiUserResponse {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface ApiUserRequest {
  readonly email: string;
  readonly name: string;
}

interface UserMapperType {
  toDomain: (apiUser: ApiUserResponse) => User;
  toApi: (user: User) => ApiUserRequest;
  toApiResponse: (user: User) => ApiUserResponse;
}

export const UserMapper: UserMapperType = {
  toDomain(apiUser: ApiUserResponse): User {
    return User.restore({
      id: apiUser.id,
      email: apiUser.email,
      name: apiUser.name,
      createdAt: new Date(apiUser.created_at),
      updatedAt: new Date(apiUser.updated_at),
    });
  },

  toApi(user: User): ApiUserRequest {
    return {
      email: user.email,
      name: user.name,
    };
  },

  toApiResponse(user: User): ApiUserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
    };
  },
};
