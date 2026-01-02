import { User } from '../../domain/User.entity';
import { UserEmailAlreadyExistsError } from '../../domain/User.errors';
import { UserResponseMapper } from '../dtos/UserResponse.dto';

import type { UserRepository } from '../../domain/types/repository.types';
import type { CreateUserDTO } from '../dtos/CreateUser.dto';
import type { UserResponseDTO } from '../dtos/UserResponse.dto';

export class CreateUser {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async execute(dto: CreateUserDTO): Promise<UserResponseDTO> {
    const emailExists: boolean = await this.userRepository.existsByEmail(dto.email);

    if (emailExists) {
      throw new UserEmailAlreadyExistsError(dto.email);
    }

    const user: User = User.create({
      email: dto.email,
      name: dto.name,
    });

    const savedUser: User = await this.userRepository.save(user);

    return UserResponseMapper.fromEntity(savedUser);
  }
}
