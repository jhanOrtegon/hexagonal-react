import { InvalidArgumentError } from '../errors';

export class Email {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): Email {
    if (value.trim().length === 0) {
      throw new InvalidArgumentError('email', 'Email cannot be empty');
    }

    const trimmedValue: string = value.trim();

    if (!Email.isValid(trimmedValue)) {
      throw new InvalidArgumentError('email', 'Invalid email format');
    }

    return new Email(trimmedValue.toLowerCase());
  }

  private static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
