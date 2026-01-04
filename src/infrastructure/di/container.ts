import { LoginUser } from '../../core/user/application/usecases/LoginUser.usecase';
import { OrderApiRepository } from '../order/OrderApi.repository';
import { OrderLocalRepository } from '../order/OrderLocal.repository';
import { ProductApiRepository } from '../product/ProductApi.repository';
import { ProductLocalRepository } from '../product/ProductLocal.repository';
import { UserApiRepository } from '../user/UserApi.repository';
import { UserLocalRepository } from '../user/UserLocal.repository';

import type { OrderRepository } from '../../core/order/domain/types';
import type { ProductRepository } from '../../core/product/domain/types';
import type { UserRepository } from '../../core/user';

const Environment: {
  readonly DEVELOPMENT: 'development';
  readonly PRODUCTION: 'production';
  readonly TEST: 'test';
} = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

type Environment = (typeof Environment)[keyof typeof Environment];

/**
 * Dependency Injection Container
 * Gestiona la creación e inyección de dependencias según el entorno
 *
 * Modos de operación:
 * - TEST: Siempre usa LocalStorage
 * - DEVELOPMENT/PRODUCTION: Lee VITE_USE_LOCAL_STORAGE del .env
 *   - true: LocalRepository (desarrollo offline)
 *   - false: ApiRepository (producción con API real)
 */
class DIContainer {
  private userRepository: UserRepository | null = null;
  private productRepository: ProductRepository | null = null;
  private orderRepository: OrderRepository | null = null;
  private readonly environment: Environment;

  constructor() {
    this.environment = this.detectEnvironment();
  }

  /**
   * Obtiene el repositorio de usuarios según configuración
   * @returns UserLocalRepository o UserApiRepository según entorno
   */
  public getUserRepository(): UserRepository {
    if (this.userRepository === null) {
      const useLocal: boolean =
        this.environment === Environment.TEST || import.meta.env.VITE_USE_LOCAL_STORAGE === 'true';

      this.userRepository = useLocal ? new UserLocalRepository() : new UserApiRepository();
    }
    return this.userRepository;
  }

  /**
   * Obtiene el repositorio de productos según configuración
   * @returns ProductLocalRepository o ProductApiRepository según entorno
   */
  public getProductRepository(): ProductRepository {
    if (this.productRepository === null) {
      const useLocal: boolean =
        this.environment === Environment.TEST || import.meta.env.VITE_USE_LOCAL_STORAGE === 'true';

      this.productRepository = useLocal ? new ProductLocalRepository() : new ProductApiRepository();
    }
    return this.productRepository;
  }

  /**
   * Obtiene el repositorio de pedidos según configuración
   * @returns OrderLocalRepository o OrderApiRepository según entorno
   */
  public getOrderRepository(): OrderRepository {
    if (this.orderRepository === null) {
      const useLocal: boolean =
        this.environment === Environment.TEST || import.meta.env.VITE_USE_LOCAL_STORAGE === 'true';

      this.orderRepository = useLocal ? new OrderLocalRepository() : new OrderApiRepository();
    }
    return this.orderRepository;
  }

  /**
   * Permite inyectar un repositorio custom (útil para testing)
   */
  public setUserRepository(repository: UserRepository): void {
    this.userRepository = repository;
  }

  /**
   * Permite inyectar un repositorio custom de productos (útil para testing)
   */
  public setProductRepository(repository: ProductRepository): void {
    this.productRepository = repository;
  }

  /**
   * Permite inyectar un repositorio custom de pedidos (útil para testing)
   */
  public setOrderRepository(repository: OrderRepository): void {
    this.orderRepository = repository;
  }

  /**
   * Obtiene el caso de uso para login
   */
  public getLoginUserUseCase(): LoginUser {
    const userRepository: UserRepository = this.getUserRepository();
    return new LoginUser(userRepository);
  }

  /**
   * Resetea todas las dependencias (útil para testing)
   */
  public reset(): void {
    this.userRepository = null;
    this.productRepository = null;
    this.orderRepository = null;
  }

  private detectEnvironment(): Environment {
    const mode: string = import.meta.env.MODE;

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
