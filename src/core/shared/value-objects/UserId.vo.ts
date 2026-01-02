import { InvalidArgumentError } from '../errors';

export class UserId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(): UserId {
    return new UserId(crypto.randomUUID());
  }

  public static fromString(value: string): UserId {
    if (value.trim().length === 0) {
      throw new InvalidArgumentError('userId', 'UserId cannot be empty');
    }

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim())) {
      throw new InvalidArgumentError('userId', 'UserId must be a valid UUID');
    }

    return new UserId(value.trim());
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: UserId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
