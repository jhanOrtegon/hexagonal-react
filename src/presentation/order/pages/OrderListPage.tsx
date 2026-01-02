import React, { useState } from 'react';

import {
  ArrowRight,
  CheckCircle,
  Circle,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  X,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import type { OrderResponseDTO } from '@/core/order/application/types';
import { OrderStatus } from '@/core/order/domain/Order.entity';
import {
  useCancelOrderMutation,
  useCreateOrderMutation,
  useDeleteOrderMutation,
  useOrdersQuery,
  useUpdateOrderStatusMutation,
} from '@/presentation/order/hooks/useOrder.query';
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

type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

export const OrderListPage: React.FC = (): React.JSX.Element => {
  const [newOrderUserId, setNewOrderUserId]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = useState<string>('');
  const [newOrderProductId, setNewOrderProductId]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = useState<string>('');
  const [newOrderQuantity, setNewOrderQuantity]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = useState<string>('');
  const [newOrderUnitPrice, setNewOrderUnitPrice]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = useState<string>('');
  const [searchTerm, setSearchTerm]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = useState<string>('');
  const [statusFilter, setStatusFilter]: [
    OrderStatusType | 'ALL',
    React.Dispatch<React.SetStateAction<OrderStatusType | 'ALL'>>,
  ] = useState<OrderStatusType | 'ALL'>('ALL');

  const { data: orders, isLoading }: UseQueryResult<OrderResponseDTO[]> =
    useOrdersQuery();
  const createOrderMutation: UseMutationResult<
    OrderResponseDTO,
    Error,
    { userId: string; productId: string; quantity: number; unitPrice: number }
  > = useCreateOrderMutation();
  const updateOrderStatusMutation: ReturnType<typeof useUpdateOrderStatusMutation> = useUpdateOrderStatusMutation();
  const cancelOrderMutation: UseMutationResult<
    OrderResponseDTO,
    Error,
    string
  > = useCancelOrderMutation();
  const deleteOrderMutation: ReturnType<typeof useDeleteOrderMutation> = useDeleteOrderMutation();

  const filteredOrders: OrderResponseDTO[] = React.useMemo(
    (): OrderResponseDTO[] => {
      let filtered: OrderResponseDTO[] = orders ?? [];

      if (searchTerm !== '') {
        filtered = filtered.filter(
          (order: OrderResponseDTO): boolean =>
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.productId.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (statusFilter !== 'ALL') {
        filtered = filtered.filter(
          (order: OrderResponseDTO): boolean => order.status === statusFilter
        );
      }

      return filtered;
    },
    [orders, searchTerm, statusFilter]
  );

  const handleCreateOrder: () => void = (): void => {
    const quantity: number = parseInt(newOrderQuantity, 10);
    const unitPrice: number = parseFloat(newOrderUnitPrice);

    if (
      newOrderUserId.trim() !== '' &&
      newOrderProductId.trim() !== '' &&
      !isNaN(quantity) &&
      !isNaN(unitPrice)
    ) {
      const promise: Promise<OrderResponseDTO> = new Promise<OrderResponseDTO>(
        (resolve: (value: OrderResponseDTO) => void, reject: (reason?: unknown) => void): void => {
          createOrderMutation.mutate(
            {
              userId: newOrderUserId,
              productId: newOrderProductId,
              quantity,
              unitPrice,
            },
            {
              onSuccess: (data: OrderResponseDTO): void => {
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
        loading: 'Creating order...',
        success: 'Order created successfully!',
        error: 'Failed to create order',
      });

      setNewOrderUserId('');
      setNewOrderProductId('');
      setNewOrderQuantity('');
      setNewOrderUnitPrice('');
    }
  };

  const handleUpdateStatus: (orderId: string, newStatus: OrderStatusType) => void = (
    orderId: string,
    newStatus: OrderStatusType
  ): void => {
    const promise: Promise<OrderResponseDTO> = new Promise<OrderResponseDTO>(
      (resolve: (value: OrderResponseDTO) => void, reject: (reason?: unknown) => void): void => {
        updateOrderStatusMutation.mutate(
          { id: orderId, status: newStatus },
          {
            onSuccess: (data: OrderResponseDTO): void => {
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
      loading: `Updating status to ${newStatus}...`,
      success: `Order status updated to ${newStatus}!`,
      error: 'Failed to update order status',
    });
  };

  const handleCancelOrder: (orderId: string) => void = (orderId: string): void => {
    toast('Cancel Order', {
      description: 'Are you sure you want to cancel this order?',
      action: {
        label: 'Cancel Order',
        onClick: (): void => {
          const promise: Promise<OrderResponseDTO> = new Promise<OrderResponseDTO>(
            (resolve: (value: OrderResponseDTO) => void, reject: (reason?: unknown) => void): void => {
              cancelOrderMutation.mutate(orderId, {
                onSuccess: (data: OrderResponseDTO): void => {
                  resolve(data);
                },
                onError: (error: Error): void => {
                  reject(error);
                },
              });
            }
          );

          toast.promise(promise, {
            loading: 'Cancelling order...',
            success: 'Order cancelled successfully!',
            error: 'Failed to cancel order',
          });
        },
      },
      cancel: {
        label: 'Keep Order',
        onClick: (): void => {
          toast.info('Order cancellation aborted');
        },
      },
    });
  };

  const handleDeleteOrder: (orderId: string) => void = (orderId: string): void => {
    toast('Delete Order', {
      description: 'Are you sure you want to delete this order? This action cannot be undone.',
      action: {
        label: 'Delete',
        onClick: (): void => {
          const promise: Promise<void> = new Promise<void>(
            (resolve: () => void, reject: (reason?: unknown) => void): void => {
              deleteOrderMutation.mutate(orderId, {
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
            loading: 'Deleting order...',
            success: 'Order deleted successfully!',
            error: 'Failed to delete order',
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

  const getStatusBadge: (status: OrderStatusType) => React.JSX.Element = (
    status: OrderStatusType
  ): React.JSX.Element => {
    const statusConfig: Record<
      OrderStatusType,
      { variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info'; icon: React.ReactNode }
    > = {
      [OrderStatus.PENDING]: {
        variant: 'warning',
        icon: <Circle className="mr-1 h-3 w-3" />,
      },
      [OrderStatus.CONFIRMED]: {
        variant: 'info',
        icon: <CheckCircle className="mr-1 h-3 w-3" />,
      },
      [OrderStatus.SHIPPED]: {
        variant: 'secondary',
        icon: <Truck className="mr-1 h-3 w-3" />,
      },
      [OrderStatus.DELIVERED]: {
        variant: 'success',
        icon: <Package className="mr-1 h-3 w-3" />,
      },
      [OrderStatus.CANCELLED]: {
        variant: 'destructive',
        icon: <XCircle className="mr-1 h-3 w-3" />,
      },
    };

    const config: { variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info'; icon: React.ReactNode } = statusConfig[status];

    return (
      <Badge variant={config.variant} className="text-xs font-medium">
        {config.icon}
        {status}
      </Badge>
    );
  };

  const getNextActions: (order: OrderResponseDTO) => React.JSX.Element = (
    order: OrderResponseDTO
  ): React.JSX.Element => {
    const transitions: Record<OrderStatusType, OrderStatusType[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED],
      [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    const nextStatuses: OrderStatusType[] = transitions[order.status];
    const canCancel: boolean = order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED;

    return (
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map(
          (nextStatus: OrderStatusType): React.JSX.Element => (
            <Button
              key={nextStatus}
              size="sm"
              variant="outline"
              onClick={(): void => {
                handleUpdateStatus(order.id, nextStatus);
              }}
              disabled={updateOrderStatusMutation.isPending}
              className="text-xs"
            >
              <ArrowRight className="mr-1 h-3 w-3" />
              {nextStatus}
            </Button>
          )
        )}
        {canCancel && (
          <Button
            size="sm"
            variant="destructive"
            onClick={(): void => {
              handleCancelOrder(order.id);
            }}
            disabled={cancelOrderMutation.isPending}
            className="text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Cancel
          </Button>
        )}
      </div>
    );
  };

  const orderStats: {
    total: number;
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  } = React.useMemo(() => {
    const stats: {
      total: number;
      pending: number;
      confirmed: number;
      shipped: number;
      delivered: number;
      cancelled: number;
    } = {
      total: orders?.length ?? 0,
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders?.forEach((order: OrderResponseDTO): void => {
      switch (order.status) {
        case OrderStatus.PENDING:
          stats.pending += 1;
          break;
        case OrderStatus.CONFIRMED:
          stats.confirmed += 1;
          break;
        case OrderStatus.SHIPPED:
          stats.shipped += 1;
          break;
        case OrderStatus.DELIVERED:
          stats.delivered += 1;
          break;
        case OrderStatus.CANCELLED:
          stats.cancelled += 1;
          break;
      }
    });

    return stats;
  }, [orders]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Orders" description="Manage your orders" />
        <LoadingSpinner text="Loading orders..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Orders"
        description="Manage and track customer orders"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{orderStats.total} Total</Badge>
            <Badge variant="warning">{orderStats.pending} Pending</Badge>
            <Badge variant="info">{orderStats.confirmed} Confirmed</Badge>
            <Badge variant="secondary">{orderStats.shipped} Shipped</Badge>
            <Badge variant="success">{orderStats.delivered} Delivered</Badge>
          </div>
        }
      />

      {/* Create Order Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Order
          </CardTitle>
          <CardDescription>Create a new order for a customer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="order-userId">User ID</Label>
              <Input
                id="order-userId"
                placeholder="user-123"
                value={newOrderUserId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  setNewOrderUserId(e.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-productId">Product ID</Label>
              <Input
                id="order-productId"
                placeholder="product-456"
                value={newOrderProductId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  setNewOrderProductId(e.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-quantity">Quantity</Label>
              <Input
                id="order-quantity"
                type="number"
                min="1"
                placeholder="1"
                value={newOrderQuantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  setNewOrderQuantity(e.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-unitPrice">Unit Price</Label>
              <Input
                id="order-unitPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="99.99"
                value={newOrderUnitPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  setNewOrderUnitPrice(e.target.value);
                }}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleCreateOrder}
                disabled={
                  createOrderMutation.isPending ||
                  newOrderUserId.trim() === '' ||
                  newOrderProductId.trim() === '' ||
                  newOrderQuantity === '' ||
                  newOrderUnitPrice === ''
                }
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                {createOrderMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter Section */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by order ID, user ID, or product ID..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              setSearchTerm(e.target.value);
            }}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => {
            setStatusFilter(e.target.value as OrderStatusType | 'ALL');
          }}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
          aria-label="Filter by order status"
        >
          <option value="ALL">All Statuses</option>
          <option value={OrderStatus.PENDING}>Pending</option>
          <option value={OrderStatus.CONFIRMED}>Confirmed</option>
          <option value={OrderStatus.SHIPPED}>Shipped</option>
          <option value={OrderStatus.DELIVERED}>Delivered</option>
          <option value={OrderStatus.CANCELLED}>Cancelled</option>
        </select>
        {(searchTerm !== '' || statusFilter !== 'ALL') && (
          <Button
            variant="outline"
            onClick={(): void => {
              setSearchTerm('');
              setStatusFilter('ALL');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No orders found"
          description={
            searchTerm !== '' || statusFilter !== 'ALL'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first order'
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredOrders.map(
            (order: OrderResponseDTO): React.JSX.Element => (
              <Card
                key={order.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100">
                        <ShoppingCart className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate text-base">
                          Order #{order.id.slice(0, 8)}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {new Date(order.createdAt).toLocaleString()}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">User:</span>
                      <p className="truncate text-gray-900">{order.userId.slice(0, 12)}...</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Product:</span>
                      <p className="truncate text-gray-900">{order.productId.slice(0, 12)}...</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Quantity:</span>
                      <p className="text-gray-900">{order.quantity}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Total:</span>
                      <p className="font-bold text-green-600">
                        ${order.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <p className="mb-2 text-xs font-medium text-gray-500">
                      Available Actions:
                    </p>
                    {getNextActions(order)}
                  </div>

                  <div className="flex justify-end border-t border-gray-100 pt-3">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(): void => {
                        handleDeleteOrder(order.id);
                      }}
                      disabled={deleteOrderMutation.isPending}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Delete
                    </Button>
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
