export type UserId = string;
export type UserEmail = string;

export interface CreateUserData {
  readonly email: string;
  readonly name: string;
}

export interface RestoreUserData {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface UpdateUserData {
  readonly name?: string;
  readonly email?: string;
}

