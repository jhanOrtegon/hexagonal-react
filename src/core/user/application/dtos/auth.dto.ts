/**
 * Login Request DTO
 * Data Transfer Object for login request
 */
export interface LoginRequestDTO {
  readonly email: string;
  readonly password: string;
}

/**
 * Login Response DTO
 * Data Transfer Object for login response
 */
export interface LoginResponseDTO {
  readonly token: string;
  readonly user: {
    readonly id: string;
    readonly email: string;
    readonly name: string;
  };
}
