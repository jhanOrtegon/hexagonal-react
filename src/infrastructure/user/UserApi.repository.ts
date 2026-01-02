import { HttpError } from '../shared/http';

import { type ApiUserRequest, type ApiUserResponse, UserMapper } from './mappers';

import type { User, UserFilters, UserRepository } from '../../core/user';
import type { HttpClient } from '../shared/http';

export class UserApiRepository implements UserRepository {
  private readonly httpClient: HttpClient;
  private readonly basePath: string;

  constructor(httpClient: HttpClient, basePath?: string) {
    this.httpClient = httpClient;
    this.basePath = basePath ?? '/users';
  }

  public async findById(id: string): Promise<User | null> {
    try {
      const response: ApiUserResponse = await this.httpClient.get<ApiUserResponse>(
        `${this.basePath}/${id}`
      );
      return UserMapper.toDomain(response);
    } catch (error: unknown) {
      if (error instanceof HttpError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  public async findByEmail(email: string): Promise<User | null> {
    try {
      const response: ApiUserResponse = await this.httpClient.get<ApiUserResponse>(
        `${this.basePath}/email/${encodeURIComponent(email)}`
      );
      return UserMapper.toDomain(response);
    } catch (error: unknown) {
      if (error instanceof HttpError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  public async findAll(filters?: UserFilters): Promise<User[]> {
    const params: Record<string, string> = {};
    
    if (filters?.name !== undefined) {
      params['name'] = filters.name;
    }
    if (filters?.email !== undefined) {
      params['email'] = filters.email;
    }
    if (filters?.createdAfter !== undefined) {
      params['createdAfter'] = filters.createdAfter.toISOString();
    }
    if (filters?.createdBefore !== undefined) {
      params['createdBefore'] = filters.createdBefore.toISOString();
    }

    const response: ApiUserResponse[] = await this.httpClient.get<ApiUserResponse[]>(
      this.basePath,
      { params }
    );
    
    return response.map((apiUser: ApiUserResponse) => UserMapper.toDomain(apiUser));
  }

  public async save(user: User): Promise<User> {
    const exists: boolean = await this.exists(user.id);
    
    if (exists) {
      const request: ApiUserRequest = UserMapper.toApi(user);
      const response: ApiUserResponse = await this.httpClient.put<ApiUserResponse>(
        `${this.basePath}/${user.id}`,
        request
      );
      return UserMapper.toDomain(response);
    }
    
    const request: ApiUserRequest = UserMapper.toApi(user);
    const response: ApiUserResponse = await this.httpClient.post<ApiUserResponse>(
      this.basePath,
      request
    );
    return UserMapper.toDomain(response);
  }

  public async delete(id: string): Promise<void> {
    await this.httpClient.delete(`${this.basePath}/${id}`);
  }

  public async exists(id: string): Promise<boolean> {
    try {
      await this.httpClient.get<ApiUserResponse>(`${this.basePath}/${id}`);
      return true;
    } catch (error: unknown) {
      if (error instanceof HttpError && error.status === 404) {
        return false;
      }
      throw error;
    }
  }

  public async existsByEmail(email: string): Promise<boolean> {
    try {
      await this.httpClient.get<ApiUserResponse>(
        `${this.basePath}/email/${encodeURIComponent(email)}`
      );
      return true;
    } catch (error: unknown) {
      if (error instanceof HttpError && error.status === 404) {
        return false;
      }
      throw error;
    }
  }
}

