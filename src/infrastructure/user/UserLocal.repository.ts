import type { User, UserRepository, UserFilters } from '../../core/user';

export class UserLocalRepository implements UserRepository {
  private readonly storage: Map<string, User>;

  constructor() {
    this.storage = new Map();
  }

  public async findById(id: string): Promise<User | null> {
    return await Promise.resolve(this.storage.get(id) ?? null);
  }

  public async findByEmail(email: string): Promise<User | null> {
    for (const user of this.storage.values()) {
      if (user.email === email) {
        return await Promise.resolve(user);
      }
    }
    return await Promise.resolve(null);
  }

  public async findAll(filters?: UserFilters): Promise<User[]> {
    let users: User[] = Array.from(this.storage.values());

    if (filters?.name !== undefined) {
      users = users.filter((user: User) => 
        user.name.toLowerCase().includes(filters.name?.toLowerCase() ?? '')
      );
    }

    if (filters?.email !== undefined) {
      users = users.filter((user: User) => 
        user.email.toLowerCase().includes(filters.email?.toLowerCase() ?? '')
      );
    }

    if (filters?.createdAfter !== undefined) {
      users = users.filter((user: User) => 
        user.createdAt >= (filters.createdAfter ?? new Date(0))
      );
    }

    if (filters?.createdBefore !== undefined) {
      users = users.filter((user: User) => 
        user.createdAt <= (filters.createdBefore ?? new Date())
      );
    }

    return await Promise.resolve(users);
  }

  public async save(user: User): Promise<User> {
    this.storage.set(user.id, user);
    return await Promise.resolve(user);
  }

  public async delete(id: string): Promise<void> {
    this.storage.delete(id);
    await Promise.resolve();
  }

  public async exists(id: string): Promise<boolean> {
    return await Promise.resolve(this.storage.has(id));
  }

  public async existsByEmail(email: string): Promise<boolean> {
    for (const user of this.storage.values()) {
      if (user.email === email) {
        return await Promise.resolve(true);
      }
    }
    return await Promise.resolve(false);
  }
}

