import { UserNotFoundError, UserEmailAlreadyExistsError } from '../../domain/User.errors';
import { UserResponseMapper } from '../dtos/UserResponse.dto';

import type { User } from '../../domain/User.entity';
import type { UserRepository } from '../../domain/User.repository';
import type { UpdateUserDTO } from '../dtos/UpdateUser.dto';
import type { UserResponseDTO } from '../dtos/UserResponse.dto';

export class UpdateUser {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async execute(id: string, dto: UpdateUserDTO): Promise<UserResponseDTO> {
    const user: User | null = await this.userRepository.findById(id);
    
    if (user === null) {
      throw new UserNotFoundError(id);
    }

    let updatedUser: User = user;

    if (dto.email !== undefined) {
      if (dto.email !== user.email) {
        const emailExists: boolean = await this.userRepository.existsByEmail(dto.email);
        
        if (emailExists) {
          throw new UserEmailAlreadyExistsError(dto.email);
        }
        
        updatedUser = updatedUser.updateEmail(dto.email);
      }
    }

    if (dto.name !== undefined) {
      updatedUser = updatedUser.updateName(dto.name);
    }

    const savedUser: User = await this.userRepository.save(updatedUser);

    return UserResponseMapper.fromEntity(savedUser);
  }
}
