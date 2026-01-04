import { type Result, fail, ok } from '../../shared/domain/Result';
import { InvalidArgumentError } from '../../shared/errors';

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly name: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(id: string, email: string, name: string, createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static create(data: { email: string; name: string }): Result<User, InvalidArgumentError> {
    if (data.email.trim().length === 0) {
      return fail(new InvalidArgumentError('email', 'Email is required'));
    }

    const trimmedEmail: string = data.email.trim();
    const trimmedName: string = data.name.trim();

    if (trimmedName.length === 0) {
      return fail(new InvalidArgumentError('name', 'Name is required'));
    }

    if (trimmedName.length > 100) {
      return fail(new InvalidArgumentError('name', 'Name is too long (max 100 characters)'));
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return fail(new InvalidArgumentError('email', 'Invalid email format'));
    }

    return ok(
      new User(crypto.randomUUID(), trimmedEmail.toLowerCase(), trimmedName, new Date(), new Date())
    );
  }

  public static restore(data: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(data.id, data.email, data.name, data.createdAt, data.updatedAt);
  }

  public updateName(newName: string): Result<User, InvalidArgumentError> {
    if (newName.trim().length === 0) {
      return fail(new InvalidArgumentError('name', 'Name is required'));
    }

    if (newName.trim().length > 100) {
      return fail(new InvalidArgumentError('name', 'Name is too long (max 100 characters)'));
    }

    return ok(new User(this.id, this.email, newName.trim(), this.createdAt, new Date()));
  }

  public updateEmail(newEmail: string): Result<User, InvalidArgumentError> {
    if (newEmail.trim().length === 0) {
      return fail(new InvalidArgumentError('email', 'Email is required'));
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return fail(new InvalidArgumentError('email', 'Invalid email format'));
    }

    return ok(
      new User(this.id, newEmail.toLowerCase().trim(), this.name, this.createdAt, new Date())
    );
  }

  public equals(other: User): boolean {
    return this.id === other.id;
  }
}
