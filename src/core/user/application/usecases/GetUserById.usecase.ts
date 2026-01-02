import { UserNotFoundError } from '../../domain/User.errors';
import { UserResponseMapper } from '../dtos/UserResponse.dto';

import type { User } from '../../domain/User.entity';
import type { UserRepository } from '../../domain/User.repository';
import type { UserResponseDTO } from '../dtos/UserResponse.dto';

export class GetUserById {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async execute(id: string): Promise<UserResponseDTO> {
    const user: User | null = await this.userRepository.findById(id);
    
    if (user === null) {
      throw new UserNotFoundError(id);
    }

    return UserResponseMapper.fromEntity(user);
  }
}
