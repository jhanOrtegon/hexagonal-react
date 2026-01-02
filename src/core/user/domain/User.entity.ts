import { InvalidArgumentError } from '../../shared/errors';

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly name: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: string,
    email: string,
    name: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static create(data: {
    email: string;
    name: string;
  }): User {
    if (data.email.trim().length === 0) {
      throw new InvalidArgumentError('email', 'Email is required');
    }

    if (data.name.trim().length === 0) {
      throw new InvalidArgumentError('name', 'Name is required');
    }

    if (data.name.trim().length > 100) {
      throw new InvalidArgumentError('name', 'Name is too long (max 100 characters)');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new InvalidArgumentError('email', 'Invalid email format');
    }

    return new User(
      crypto.randomUUID(),
      data.email.toLowerCase().trim(),
      data.name.trim(),
      new Date(),
      new Date()
    );
  }

  public static restore(data: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      data.id,
      data.email,
      data.name,
      data.createdAt,
      data.updatedAt
    );
  }

  public updateName(newName: string): User {
    if (newName.trim().length === 0) {
      throw new InvalidArgumentError('name', 'Name is required');
    }

    if (newName.trim().length > 100) {
      throw new InvalidArgumentError('name', 'Name is too long (max 100 characters)');
    }

    return new User(
      this.id,
      this.email,
      newName.trim(),
      this.createdAt,
      new Date()
    );
  }

  public updateEmail(newEmail: string): User {
    if (newEmail.trim().length === 0) {
      throw new InvalidArgumentError('email', 'Email is required');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      throw new InvalidArgumentError('email', 'Invalid email format');
    }

    return new User(
      this.id,
      newEmail.toLowerCase().trim(),
      this.name,
      this.createdAt,
      new Date()
    );
  }

  public equals(other: User): boolean {
    return this.id === other.id;
  }
}


