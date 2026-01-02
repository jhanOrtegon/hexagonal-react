/**
 * Product Entity - Domain Layer
 * Representa un producto en el sistema con su lógica de negocio
 */
export class Product {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly price: number;
  public readonly stock: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: string,
    name: string,
    description: string,
    price: number,
    stock: number,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.stock = stock;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Factory method para crear un nuevo producto
   */
  public static create(data: {
    readonly name: string;
    readonly description: string;
    readonly price: number;
    readonly stock: number;
  }): Product {
    // Validaciones de dominio
    if (data.name.trim().length === 0) {
      throw new Error('Product name cannot be empty');
    }

    if (data.price < 0) {
      throw new Error('Product price cannot be negative');
    }

    if (data.stock < 0) {
      throw new Error('Product stock cannot be negative');
    }

    return new Product(
      crypto.randomUUID(),
      data.name.trim(),
      data.description.trim(),
      data.price,
      data.stock,
      new Date(),
      new Date()
    );
  }

  /**
   * Factory method para reconstruir desde persistencia
   */
  public static restore(data: {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly price: number;
    readonly stock: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
  }): Product {
    return new Product(
      data.id,
      data.name,
      data.description,
      data.price,
      data.stock,
      data.createdAt,
      data.updatedAt
    );
  }

  /**
   * Actualizar nombre del producto
   */
  public updateName(newName: string): Product {
    if (newName.trim().length === 0) {
      throw new Error('Product name cannot be empty');
    }

    return new Product(
      this.id,
      newName.trim(),
      this.description,
      this.price,
      this.stock,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Actualizar precio del producto
   */
  public updatePrice(newPrice: number): Product {
    if (newPrice < 0) {
      throw new Error('Product price cannot be negative');
    }

    return new Product(
      this.id,
      this.name,
      this.description,
      newPrice,
      this.stock,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Actualizar stock del producto
   */
  public updateStock(newStock: number): Product {
    if (newStock < 0) {
      throw new Error('Product stock cannot be negative');
    }

    return new Product(
      this.id,
      this.name,
      this.description,
      this.price,
      newStock,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Verificar si hay stock disponible
   */
  public hasStock(): boolean {
    return this.stock > 0;
  }

  /**
   * Verificar si hay suficiente stock
   */
  public hasEnoughStock(quantity: number): boolean {
    return this.stock >= quantity;
  }

  /**
   * Comparar productos por ID
   */
  public equals(other: Product): boolean {
    return this.id === other.id;
  }
}
