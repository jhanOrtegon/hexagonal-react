/**
 * Use Case - LoginUser
 * Caso de uso para autenticar un usuario
 */

import type { UserRepository } from '../../domain/types/repository.types';
import type { LoginRequestDTO, LoginResponseDTO } from '../dtos/auth.dto';

export class LoginUser {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async execute(dto: LoginRequestDTO): Promise<LoginResponseDTO> {
    // Validar que el email y password no estén vacíos
    if (dto.email.trim().length === 0) {
      throw new Error('Email is required');
    }

    if (dto.password.trim().length === 0) {
      throw new Error('Password is required');
    }

    // Llamar al repositorio para autenticar
    const response: LoginResponseDTO = await this.userRepository.login(dto.email, dto.password);

    return response;
  }
}
