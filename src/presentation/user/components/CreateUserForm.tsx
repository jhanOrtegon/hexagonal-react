import React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/presentation/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/presentation/shared/components/ui/form';
import { Input } from '@/presentation/shared/components/ui/input';

import { createUserSchema } from '../adapters/user.validation';
import { useCreateUserMutation } from '../hooks/useUser.query';

import type { CreateUserFormData } from '../adapters/user.validation';

/**
 * CreateUserForm Component
 * Formulario con validación client-side para crear usuarios
 */
export const CreateUserForm: React.FC = (): React.JSX.Element => {
  const createMutation = useCreateUserMutation();

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  });

  const onSubmit = async (data: CreateUserFormData): Promise<void> => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('User created successfully!', {
        description: `${data.name} (${data.email}) has been added to the system.`,
      });
      form.reset();
    } catch (error: unknown) {
      // Manejar errores de dominio (InvalidArgumentError)
      if (error instanceof Error) {
        toast.error('Failed to create user', {
          description: error.message,
        });
      } else {
        toast.error('Failed to create user', {
          description: 'An unexpected error occurred. Please try again.',
        });
      }
    }
  };

  const handleFormSubmit: (event: React.FormEvent<HTMLFormElement>) => void = (
    event: React.FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();
    form
      .handleSubmit(onSubmit)(event)
      .catch((error: unknown) => {
        console.error('Form submission error:', error);
      });
  };

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({
            field,
          }: {
            field: React.InputHTMLAttributes<HTMLInputElement>;
          }): React.JSX.Element => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="john.doe@example.com"
                  type="email"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormDescription>The user&apos;s email address (must be valid)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({
            field,
          }: {
            field: React.InputHTMLAttributes<HTMLInputElement>;
          }): React.JSX.Element => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" type="text" autoComplete="name" {...field} />
              </FormControl>
              <FormDescription>
                The user&apos;s full name (at least first and last name)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={(): void => {
              form.reset();
            }}
            disabled={createMutation.isPending}
          >
            Reset
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
