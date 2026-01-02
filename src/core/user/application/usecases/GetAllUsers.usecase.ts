import { UserResponseMapper } from '../dtos/UserResponse.dto';

import type { UserRepository } from '../../domain/types/repository.types';
import type { UserFilters } from '../../domain/types/user.types';
import type { User } from '../../domain/User.entity';
import type { UserResponseDTO } from '../dtos/UserResponse.dto';

export class GetAllUsers {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async execute(filters?: UserFilters): Promise<UserResponseDTO[]> {
    const users: User[] = await this.userRepository.findAll(filters);
    return UserResponseMapper.fromEntities(users);
  }
}
