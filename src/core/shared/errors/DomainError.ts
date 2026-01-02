export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`);
  }
}

export class AlreadyExistsError extends DomainError {
  constructor(entity: string, field: string, value: string) {
    super(`${entity} with ${field} ${value} already exists`);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(`Validation error: ${message}`);
  }
}

export class InvalidArgumentError extends DomainError {
  constructor(argument: string, message: string) {
    super(`Invalid argument ${argument}: ${message}`);
  }
}
