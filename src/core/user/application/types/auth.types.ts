/**
 * Auth Types
 * Tipos relacionados con autenticación
 */

export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

export interface AuthToken {
  readonly token: string;
  readonly expiresAt?: Date;
}

export interface AuthSession {
  readonly token: string;
  readonly userId: string;
  readonly email: string;
}
