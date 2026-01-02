import React, { useState } from 'react';

import { Mail, Plus, Search, Trash2, UserCircle, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import type { UserResponseDTO } from '@/core/user/application/dtos/UserResponse.dto';
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
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from '@/presentation/user/hooks/useUser.query';

import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';

export const UserListPage: React.FC = (): React.JSX.Element => {
  const [newUserName, setNewUserName]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = useState<string>('');
  const [newUserEmail, setNewUserEmail]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = useState<string>('');
  const [searchTerm, setSearchTerm]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = useState<string>('');
  const [editingUserId, setEditingUserId]: [
    string | null,
    React.Dispatch<React.SetStateAction<string | null>>,
  ] = useState<string | null>(null);
  const [editName, setEditName]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = useState<string>('');
  const [editEmail, setEditEmail]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = useState<string>('');

  const { data: users, isLoading }: UseQueryResult<UserResponseDTO[]> =
    useUsersQuery();
  const createUserMutation: UseMutationResult<
    UserResponseDTO,
    Error,
    { name: string; email: string }
  > = useCreateUserMutation();
  const deleteUserMutation: UseMutationResult<undefined, Error, string> =
    useDeleteUserMutation();
  const updateUserMutation: UseMutationResult<
    UserResponseDTO,
    Error,
    { id: string; data: { name?: string; email?: string } }
  > = useUpdateUserMutation();

  const filteredUsers: UserResponseDTO[] = React.useMemo(
    (): UserResponseDTO[] =>
      users?.filter(
        (user: UserResponseDTO): boolean =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      ) ?? [],
    [users, searchTerm]
  );

  const handleCreateUser: () => void = (): void => {
    if (newUserName.trim() !== '' && newUserEmail.trim() !== '') {
      const promise: Promise<UserResponseDTO> = new Promise<UserResponseDTO>(
        (resolve: (value: UserResponseDTO) => void, reject: (reason?: unknown) => void): void => {
          createUserMutation.mutate(
            {
              name: newUserName,
              email: newUserEmail,
            },
            {
              onSuccess: (data: UserResponseDTO): void => {
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
        loading: 'Creating user...',
        success: 'User created successfully!',
        error: 'Failed to create user',
      });

      setNewUserName('');
      setNewUserEmail('');
    }
  };

  const handleStartEdit: (user: UserResponseDTO) => void = (
    user: UserResponseDTO
  ): void => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
  };

  const handleSaveEdit: () => void = (): void => {
    if (editingUserId !== null) {
      const promise: Promise<UserResponseDTO> = new Promise<UserResponseDTO>(
        (resolve: (value: UserResponseDTO) => void, reject: (reason?: unknown) => void): void => {
          updateUserMutation.mutate(
            {
              id: editingUserId,
              data: {
                name: editName,
                email: editEmail,
              },
            },
            {
              onSuccess: (data: UserResponseDTO): void => {
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
        loading: 'Updating user...',
        success: 'User updated successfully!',
        error: 'Failed to update user',
      });

      setEditingUserId(null);
    }
  };

  const handleCancelEdit: () => void = (): void => {
    setEditingUserId(null);
    setEditName('');
    setEditEmail('');
  };

  const handleDelete: (userId: string) => void = (userId: string): void => {
    toast('Delete User', {
      description: 'Are you sure you want to delete this user?',
      action: {
        label: 'Delete',
        onClick: (): void => {
          const promise: Promise<void> = new Promise<void>(
            (resolve: () => void, reject: (reason?: unknown) => void): void => {
              deleteUserMutation.mutate(userId, {
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
            loading: 'Deleting user...',
            success: 'User deleted successfully!',
            error: 'Failed to delete user',
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

  const handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void = (
    e: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (e.key === 'Enter') {
      handleCreateUser();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Users" description="Manage your user accounts" />
        <LoadingSpinner text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Users"
        description="Manage your user accounts and permissions"
        action={
          <Badge variant="secondary" className="text-sm">
            {users?.length ?? 0} Total
          </Badge>
        }
      />

      {/* Create User Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create New User
          </CardTitle>
          <CardDescription>Add a new user to the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={newUserName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  setNewUserName(e.target.value);
                }}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={newUserEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  setNewUserEmail(e.target.value);
                }}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleCreateUser}
                disabled={
                  createUserMutation.isPending ||
                  newUserName.trim() === '' ||
                  newUserEmail.trim() === ''
                }
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                {createUserMutation.isPending ? 'Creating...' : 'Create User'}
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
            placeholder="Search users by name or email..."
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

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={UserCircle}
          title="No users found"
          description={
            searchTerm !== ''
              ? 'Try adjusting your search terms'
              : 'Get started by creating your first user'
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map(
            (user: UserResponseDTO): React.JSX.Element => (
              <Card
                key={user.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100">
                        <UserCircle className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        {editingUserId === user.id ? (
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
                            {user.name}
                          </CardTitle>
                        )}
                        <CardDescription className="flex items-center gap-1 text-xs">
                          <Mail className="h-3 w-3 shrink-0" />
                          {editingUserId === user.id ? (
                            <Input
                              value={editEmail}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ): void => {
                                setEditEmail(e.target.value);
                              }}
                              className="h-7 text-xs"
                              type="email"
                            />
                          ) : (
                            <span className="truncate">{user.email}</span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      <div className="truncate">ID: {user.id.slice(0, 8)}...</div>
                      <div>
                        Created:{' '}
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {editingUserId === user.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={updateUserMutation.isPending}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
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
                              handleStartEdit(user);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(): void => {
                              handleDelete(user.id);
                            }}
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
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
