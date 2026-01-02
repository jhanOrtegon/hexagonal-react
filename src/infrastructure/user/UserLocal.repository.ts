import { User, type UserRepository, type UserFilters } from '../../core/user';

/**
 * UserLocalRepository - Implementación con LocalStorage
 * Persiste usuarios en el navegador usando localStorage
 */
export class UserLocalRepository implements UserRepository {
  private readonly STORAGE_KEY: string = 'hexagonal-tdd:users';

  /**
   * Obtiene todos los usuarios del localStorage
   */
  private getAllFromStorage(): User[] {
    try {
      const data: string | null = localStorage.getItem(this.STORAGE_KEY);
      if (data === null) {
        return [];
      }

      const parsed: {
        id: string;
        email: string;
        name: string;
        createdAt: string;
        updatedAt: string;
      }[] = JSON.parse(data) as {
        id: string;
        email: string;
        name: string;
        createdAt: string;
        updatedAt: string;
      }[];

      return parsed.map((item: { id: string; email: string; name: string; createdAt: string; updatedAt: string }) =>
        User.restore({
          id: item.id,
          email: item.email,
          name: item.name,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })
      );
    } catch (error: unknown) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  /**
   * Guarda todos los usuarios en el localStorage
   */
  private saveAllToStorage(users: User[]): void {
    try {
      const data: {
        id: string;
        email: string;
        name: string;
        createdAt: string;
        updatedAt: string;
      }[] = users.map((user: User) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }));

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error: unknown) {
      console.error('Error writing to localStorage:', error);
      throw new Error('Failed to save to localStorage');
    }
  }

  public findById(id: string): Promise<User | null> {
    const users: User[] = this.getAllFromStorage();
    const user: User | undefined = users.find((u: User) => u.id === id);
    return Promise.resolve(user ?? null);
  }

  public findByEmail(email: string): Promise<User | null> {
    const users: User[] = this.getAllFromStorage();
    const user: User | undefined = users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
    return Promise.resolve(user ?? null);
  }

  public findAll(filters?: UserFilters): Promise<User[]> {
    let users: User[] = this.getAllFromStorage();

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
      users = users.filter((user: User) => user.createdAt >= (filters.createdAfter ?? new Date(0)));
    }

    if (filters?.createdBefore !== undefined) {
      users = users.filter((user: User) => user.createdAt <= (filters.createdBefore ?? new Date()));
    }

    return Promise.resolve(users);
  }

  public save(user: User): Promise<User> {
    const users: User[] = this.getAllFromStorage();
    const existingIndex: number = users.findIndex((u: User) => u.id === user.id);

    if (existingIndex !== -1) {
      // Update existente
      users[existingIndex] = user;
    } else {
      // Nuevo usuario
      users.push(user);
    }

    this.saveAllToStorage(users);
    return Promise.resolve(user);
  }

  public delete(id: string): Promise<void> {
    const users: User[] = this.getAllFromStorage();
    const filteredUsers: User[] = users.filter((u: User) => u.id !== id);
    this.saveAllToStorage(filteredUsers);
    return Promise.resolve();
  }

  public exists(id: string): Promise<boolean> {
    const users: User[] = this.getAllFromStorage();
    return Promise.resolve(users.some((u: User) => u.id === id));
  }

  public existsByEmail(email: string): Promise<boolean> {
    const users: User[] = this.getAllFromStorage();
    return Promise.resolve(
      users.some((u: User) => u.email.toLowerCase() === email.toLowerCase())
    );
  }

  /**
   * Método auxiliar para limpiar el storage (útil para testing)
   */
  public clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

