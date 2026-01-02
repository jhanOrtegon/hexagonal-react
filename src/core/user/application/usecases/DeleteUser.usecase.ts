import { UserNotFoundError } from '../../domain/User.errors';

import type { UserRepository } from '../../domain/User.repository';

export class DeleteUser {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async execute(id: string): Promise<void> {
    const exists: boolean = await this.userRepository.exists(id);
    
    if (!exists) {
      throw new UserNotFoundError(id);
    }

    await this.userRepository.delete(id);
  }
}
