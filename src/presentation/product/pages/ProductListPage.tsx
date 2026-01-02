import React, { useState } from 'react';

import { DollarSign, Package, PackagePlus, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import type { ProductResponseDTO, UpdateProductDTO } from '@/core/product/application/types';
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useProductsQuery,
  useUpdateProductMutation,
} from '@/presentation/product/hooks/useProduct.query';
import { Badge } from '@/presentation/shared/components/ui/badge';
import { Button } from '@/presentation/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/shared/components/ui/card';
import { EmptyState } from '@/presentation/shared/components/ui/empty-state';
import { Input } from '@/presentation/shared/components/ui/input';
import { Label } from '@/presentation/shared/components/ui/label';
import { LoadingSpinner } from '@/presentation/shared/components/ui/loading-spinner';
import { PageHeader } from '@/presentation/shared/components/ui/page-header';

import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';

export const ProductListPage: React.FC = (): React.JSX.Element => {
  const [newProductName, setNewProductName]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = useState<string>('');
  const [newProductDescription, setNewProductDescription]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = useState<string>('');
  const [newProductPrice, setNewProductPrice]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = useState<string>('');
  const [newProductStock, setNewProductStock]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = useState<string>('');
  const [searchTerm, setSearchTerm]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = useState<string>('');
  const [editingProductId, setEditingProductId]: [
    string | null,
    React.Dispatch<React.SetStateAction<string | null>>,
  ] = useState<string | null>(null);
  const [editName, setEditName]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = useState<string>('');
  const [editDescription, setEditDescription]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = useState<string>('');
  const [editPrice, setEditPrice]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = useState<string>('');
  const [editStock, setEditStock]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = useState<string>('');

  const { data: products, isLoading }: UseQueryResult<ProductResponseDTO[]> =
    useProductsQuery();
  const createProductMutation: UseMutationResult<
    ProductResponseDTO,
    Error,
    { name: string; description: string; price: number; stock: number }
  > = useCreateProductMutation();
  const deleteProductMutation: UseMutationResult<undefined, Error, string> =
    useDeleteProductMutation();
  const updateProductMutation: ReturnType<typeof useUpdateProductMutation> = useUpdateProductMutation();

  const filteredProducts: ProductResponseDTO[] = React.useMemo(
    (): ProductResponseDTO[] =>
      products?.filter(
        (product: ProductResponseDTO): boolean =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) ?? [],
    [products, searchTerm]
  );

  const handleCreateProduct: () => void = (): void => {
    const price: number = parseFloat(newProductPrice);
    const stock: number = parseInt(newProductStock, 10);

    if (
      newProductName.trim() !== '' &&
      !isNaN(price) &&
      !isNaN(stock)
    ) {
      const promise: Promise<ProductResponseDTO> = new Promise<ProductResponseDTO>(
        (resolve: (value: ProductResponseDTO) => void, reject: (reason?: unknown) => void): void => {
          createProductMutation.mutate(
            {
              name: newProductName,
              description: newProductDescription,
              price,
              stock,
            },
            {
              onSuccess: (data: ProductResponseDTO): void => {
                resolve(data);
              },
              onError: (error: Error): void => {
                reject(error);
              },
            }
          );
        }
      );

      toast.promise(promise, {
        loading: 'Creating product...',
        success: 'Product created successfully!',
        error: 'Failed to create product',
      });

      setNewProductName('');
      setNewProductDescription('');
      setNewProductPrice('');
      setNewProductStock('');
    }
  };

  const handleStartEdit: (product: ProductResponseDTO) => void = (
    product: ProductResponseDTO
  ): void => {
    setEditingProductId(product.id);
    setEditName(product.name);
    setEditDescription(product.description);
    setEditPrice(product.price.toString());
    setEditStock(product.stock.toString());
  };

  const handleSaveEdit: () => void = (): void => {
    if (editingProductId !== null) {
      const price: number = parseFloat(editPrice);
      const stock: number = parseInt(editStock, 10);

      const updateData: UpdateProductDTO = {
        id: editingProductId,
        name: editName,
        description: editDescription,
        ...((!isNaN(price)) && { price }),
        ...((!isNaN(stock)) && { stock }),
      };

      const promise: Promise<ProductResponseDTO> = new Promise<ProductResponseDTO>(
        (resolve: (value: ProductResponseDTO) => void, reject: (reason?: unknown) => void): void => {
          updateProductMutation.mutate(
            updateData,
            {
              onSuccess: (data: ProductResponseDTO): void => {
                resolve(data);
              },
              onError: (error: Error): void => {
                reject(error);
              },
            }
          );
        }
      );

      toast.promise(promise, {
        loading: 'Updating product...',
        success: 'Product updated successfully!',
        error: 'Failed to update product',
      });

      setEditingProductId(null);
    }
  };

  const handleCancelEdit: () => void = (): void => {
    setEditingProductId(null);
    setEditName('');
    setEditDescription('');
    setEditPrice('');
    setEditStock('');
  };

  const handleDelete: (productId: string) => void = (productId: string): void => {
    toast('Delete Product', {
      description: 'Are you sure you want to delete this product?',
      action: {
        label: 'Delete',
        onClick: (): void => {
          const promise: Promise<void> = new Promise<void>(
            (resolve: () => void, reject: (reason?: unknown) => void): void => {
              deleteProductMutation.mutate(productId, {
                onSuccess: (): void => {
                  resolve();
                },
                onError: (error: Error): void => {
                  reject(error);
                },
              });
            }
          );

          toast.promise(promise, {
            loading: 'Deleting product...',
            success: 'Product deleted successfully!',
            error: 'Failed to delete product',
          });
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: (): void => {
          toast.info('Deletion cancelled');
        },
      },
    });
  };

  const getStockBadge: (stock: number) => React.JSX.Element = (
    stock: number
  ): React.JSX.Element => {
    if (stock === 0) {
      return (
        <Badge variant="destructive" className="text-xs">
          Out of Stock
        </Badge>
      );
    } else if (stock < 10) {
      return (
        <Badge variant="warning" className="text-xs">
          Low Stock ({stock})
        </Badge>
      );
    }
    return (
      <Badge variant="success" className="text-xs">
        In Stock ({stock})
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Products" description="Manage your product catalog" />
        <LoadingSpinner text="Loading products..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Products"
        description="Manage your product catalog and inventory"
        action={
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {products?.length ?? 0} Products
            </Badge>
            <Badge variant="info" className="text-sm">
              {products?.reduce((sum: number, p: ProductResponseDTO) => sum + p.stock, 0) ?? 0}{' '}
              Total Stock
            </Badge>
          </div>
        }
      />

      {/* Create Product Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5" />
            Create New Product
          </CardTitle>
          <CardDescription>Add a new product to your catalog</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                id="product-name"
                placeholder="Gaming Laptop"
                value={newProductName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  setNewProductName(e.target.value);
                }}
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="product-description">Description</Label>
              <Input
                id="product-description"
                placeholder="High-performance gaming laptop"
                value={newProductDescription}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  setNewProductDescription(e.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-price">Price</Label>
              <Input
                id="product-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="999.99"
                value={newProductPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  setNewProductPrice(e.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-stock">Stock</Label>
              <Input
                id="product-stock"
                type="number"
                min="0"
                placeholder="10"
                value={newProductStock}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  setNewProductStock(e.target.value);
                }}
              />
            </div>
            <div className="flex items-end lg:col-span-6">
              <Button
                onClick={handleCreateProduct}
                disabled={
                  createProductMutation.isPending ||
                  newProductName.trim() === '' ||
                  newProductPrice === '' ||
                  newProductStock === ''
                }
                className="w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Section */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search products by name or description..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              setSearchTerm(e.target.value);
            }}
            className="pl-10"
          />
        </div>
        {searchTerm !== '' && (
          <Button
            variant="outline"
            onClick={(): void => {
              setSearchTerm('');
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description={
            searchTerm !== ''
              ? 'Try adjusting your search terms'
              : 'Get started by adding your first product'
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map(
            (product: ProductResponseDTO): React.JSX.Element => (
              <Card
                key={product.id}
                className="group transition-all hover:shadow-lg"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-purple-100 to-blue-100">
                        <Package className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        {editingProductId === product.id ? (
                          <Input
                            value={editName}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ): void => {
                              setEditName(e.target.value);
                            }}
                            className="mb-1 h-8 text-sm font-semibold"
                          />
                        ) : (
                          <CardTitle className="truncate text-lg">
                            {product.name}
                          </CardTitle>
                        )}
                        {getStockBadge(product.stock)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingProductId === product.id ? (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={editDescription}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ): void => {
                            setEditDescription(e.target.value);
                          }}
                          className="mt-1 h-8 text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={editPrice}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ): void => {
                              setEditPrice(e.target.value);
                            }}
                            className="mt-1 h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Stock</Label>
                          <Input
                            type="number"
                            value={editStock}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ): void => {
                              setEditStock(e.target.value);
                            }}
                            className="mt-1 h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <CardDescription className="line-clamp-2 text-xs">
                        {product.description}
                      </CardDescription>
                      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-lg font-bold text-green-600">
                            ${product.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {product.id.slice(0, 8)}...
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex gap-2 border-t border-gray-100 pt-3">
                    {editingProductId === product.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={updateProductMutation.isPending}
                          className="flex-1"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(): void => {
                            handleStartEdit(product);
                          }}
                          className="flex-1"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(): void => {
                            handleDelete(product.id);
                          }}
                          disabled={deleteProductMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
};
