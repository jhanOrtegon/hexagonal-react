import type { User } from './User.entity';

export interface UserFilters {
  readonly name?: string;
  readonly email?: string;
  readonly createdAfter?: Date;
  readonly createdBefore?: Date;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(filters?: UserFilters): Promise<User[]>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
}

