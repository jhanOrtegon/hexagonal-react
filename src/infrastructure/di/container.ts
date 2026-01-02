
import { FetchHttpClient } from '../shared/http';
import { UserApiRepository } from '../user/UserApi.repository';
import { UserLocalRepository } from '../user/UserLocal.repository';

import type { UserRepository } from '../../core/user';
import type { HttpClient } from '../shared/http';

const Environment: {
  readonly DEVELOPMENT: 'development';
  readonly PRODUCTION: 'production';
  readonly TEST: 'test';
} = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

type Environment = typeof Environment[keyof typeof Environment];

class DIContainer {
  private userRepository: UserRepository | null = null;
  private httpClient: HttpClient | null = null;
  private readonly environment: Environment;

  constructor() {
    this.environment = this.detectEnvironment();
  }

  public getHttpClient(): HttpClient {
    if (this.httpClient === null) {
      const apiUrl: string = (import.meta.env['VITE_API_URL'] as string | undefined) ?? 'http://localhost:3000/api';
      this.httpClient = new FetchHttpClient(apiUrl, {
        'Content-Type': 'application/json',
      });
    }
    return this.httpClient;
  }

  public getUserRepository(): UserRepository {
    if (this.userRepository === null) {
      const useLocal: boolean = 
        this.environment === Environment.TEST || 
        (import.meta.env['VITE_USE_LOCAL_STORAGE'] as string | undefined) === 'true';

      this.userRepository = useLocal
        ? new UserLocalRepository()
        : new UserApiRepository(this.getHttpClient());
    }
    return this.userRepository;
  }

  public setUserRepository(repository: UserRepository): void {
    this.userRepository = repository;
  }

  public setHttpClient(client: HttpClient): void {
    this.httpClient = client;
  }

  public reset(): void {
    this.userRepository = null;
    this.httpClient = null;
  }

  private detectEnvironment(): Environment {
    const mode: string = (import.meta.env.MODE as string | undefined) ?? 'development';
    
    if (mode === 'test') {
      return Environment.TEST;
    }
    
    if (mode === 'production') {
      return Environment.PRODUCTION;
    }
    
    return Environment.DEVELOPMENT;
  }
}

export const container: DIContainer = new DIContainer();


