import { UserNotFoundError, UserEmailAlreadyExistsError } from '../../domain/User.errors';
import { UserResponseMapper } from '../dtos/UserResponse.dto';

import type { Result } from '../../../shared/domain/Result';
import type { InvalidArgumentError } from '../../../shared/errors';
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

        const emailResult: Result<User, InvalidArgumentError> =
          updatedUser.updateEmail(trimmedEmail);
        if (emailResult.isFailure()) {
          throw emailResult.error;
        }
        updatedUser = emailResult.value;
      }
    }

    if (dto.name !== undefined) {
      const trimmedName: string = dto.name.trim();
      const nameResult: Result<User, InvalidArgumentError> = updatedUser.updateName(trimmedName);
      if (nameResult.isFailure()) {
        throw nameResult.error;
      }
      updatedUser = nameResult.value;
    }

    const savedUser: User = await this.userRepository.save(updatedUser);

    return UserResponseMapper.fromEntity(savedUser);
  }
}
