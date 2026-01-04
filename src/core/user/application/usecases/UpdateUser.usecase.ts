import { UserNotFoundError, UserEmailAlreadyExistsError } from '../../domain/User.errors';
import { UserResponseMapper } from '../dtos/UserResponse.dto';

import type { UserRepository } from '../../domain/types/repository.types';
import type { User } from '../../domain/User.entity';
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
      const trimmedEmail: string = dto.email.trim();
      if (trimmedEmail !== user.email) {
        const emailExists: boolean = await this.userRepository.existsByEmail(trimmedEmail);

        if (emailExists) {
          throw new UserEmailAlreadyExistsError(trimmedEmail);
        }

        updatedUser = updatedUser.updateEmail(trimmedEmail);
      }
    }

    if (dto.name !== undefined) {
      const trimmedName: string = dto.name.trim();
      updatedUser = updatedUser.updateName(trimmedName);
    }

    const savedUser: User = await this.userRepository.save(updatedUser);

    return UserResponseMapper.fromEntity(savedUser);
  }
}
