/**
 * User Repository Interface Types
 */

import type { User } from '../User.entity';
import type { UserFilters } from './user.types';
import type { LoginResponseDTO } from '../../application/dtos/auth.dto';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(filters?: UserFilters): Promise<User[]>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
  login(email: string, password: string): Promise<LoginResponseDTO>;
}
