/**
 * Order Status Enum
 */
export const OrderStatus: {
  readonly PENDING: 'PENDING';
  readonly CONFIRMED: 'CONFIRMED';
  readonly SHIPPED: 'SHIPPED';
  readonly DELIVERED: 'DELIVERED';
  readonly CANCELLED: 'CANCELLED';
} = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

/**
 * Order Entity - Domain Layer
 * Representa un pedido en el sistema con su lógica de negocio
 */
export class Order {
  public readonly id: string;
  public readonly userId: string;
  public readonly productId: string;
  public readonly quantity: number;
  public readonly totalPrice: number;
  public readonly status: OrderStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: string,
    userId: string,
    productId: string,
    quantity: number,
    totalPrice: number,
    status: OrderStatus,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.userId = userId;
    this.productId = productId;
    this.quantity = quantity;
    this.totalPrice = totalPrice;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Factory method para crear un nuevo pedido
   */
  public static create(data: {
    readonly userId: string;
    readonly productId: string;
    readonly quantity: number;
    readonly unitPrice: number;
  }): Order {
    // Validaciones de dominio
    if (data.userId.trim().length === 0) {
      throw new Error('User ID cannot be empty');
    }

    if (data.productId.trim().length === 0) {
      throw new Error('Product ID cannot be empty');
    }

    if (data.quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    if (data.unitPrice < 0) {
      throw new Error('Unit price cannot be negative');
    }

    const totalPrice: number = data.quantity * data.unitPrice;

    return new Order(
      crypto.randomUUID(),
      data.userId.trim(),
      data.productId.trim(),
      data.quantity,
      totalPrice,
      OrderStatus.PENDING,
      new Date(),
      new Date()
    );
  }

  /**
   * Factory method para reconstruir desde persistencia
   */
  public static restore(data: {
    readonly id: string;
    readonly userId: string;
    readonly productId: string;
    readonly quantity: number;
    readonly totalPrice: number;
    readonly status: OrderStatus;
    readonly createdAt: Date;
    readonly updatedAt: Date;
  }): Order {
    return new Order(
      data.id,
      data.userId,
      data.productId,
      data.quantity,
      data.totalPrice,
      data.status,
      data.createdAt,
      data.updatedAt
    );
  }

  /**
   * Confirmar el pedido
   */
  public confirm(): Order {
    if (this.status !== OrderStatus.PENDING) {
      throw new Error(`Cannot confirm order with status ${this.status}`);
    }

    return new Order(
      this.id,
      this.userId,
      this.productId,
      this.quantity,
      this.totalPrice,
      OrderStatus.CONFIRMED,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Marcar como enviado
   */
  public ship(): Order {
    if (this.status !== OrderStatus.CONFIRMED) {
      throw new Error(`Cannot ship order with status ${this.status}`);
    }

    return new Order(
      this.id,
      this.userId,
      this.productId,
      this.quantity,
      this.totalPrice,
      OrderStatus.SHIPPED,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Marcar como entregado
   */
  public deliver(): Order {
    if (this.status !== OrderStatus.SHIPPED) {
      throw new Error(`Cannot deliver order with status ${this.status}`);
    }

    return new Order(
      this.id,
      this.userId,
      this.productId,
      this.quantity,
      this.totalPrice,
      OrderStatus.DELIVERED,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Cancelar el pedido
   */
  public cancel(): Order {
    if (this.status === OrderStatus.DELIVERED) {
      throw new Error('Cannot cancel a delivered order');
    }

    if (this.status === OrderStatus.CANCELLED) {
      throw new Error('Order is already cancelled');
    }

    return new Order(
      this.id,
      this.userId,
      this.productId,
      this.quantity,
      this.totalPrice,
      OrderStatus.CANCELLED,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Verificar si el pedido puede ser cancelado
   */
  public canBeCancelled(): boolean {
    return this.status !== OrderStatus.DELIVERED && this.status !== OrderStatus.CANCELLED;
  }

  /**
   * Verificar si el pedido está completado
   */
  public isCompleted(): boolean {
    return this.status === OrderStatus.DELIVERED;
  }

  /**
   * Comparar pedidos por ID
   */
  public equals(other: Order): boolean {
    return this.id === other.id;
  }
}
