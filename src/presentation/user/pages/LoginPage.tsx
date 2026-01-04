/**
 * Login Page
 * Página de autenticación de usuarios
 */

import React, { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { Button } from '@/presentation/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/shared/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/presentation/shared/components/ui/form';
import { Input } from '@/presentation/shared/components/ui/input';
import { useAuth } from '@/presentation/shared/hooks/useAuth';

import type { ControllerRenderProps, UseFormReturn } from 'react-hook-form';
import type { NavigateFunction } from 'react-router-dom';

// Validation schema
const loginSchema: z.ZodObject<{
  email: z.ZodString;
  password: z.ZodString;
}> = z.object({
  email: z.string().min(1, 'Email is required').regex(/@/, 'Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = (): React.JSX.Element => {
  const navigate: NavigateFunction = useNavigate();
  const { login }: { login: (email: string, password: string) => Promise<void> } = useAuth();
  const [error, setError]: [string | null, React.Dispatch<React.SetStateAction<string | null>>] =
    useState<string | null>(null);
  const [isLoading, setIsLoading]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    useState<boolean>(false);

  const form: UseFormReturn<LoginFormValues> = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit: (values: LoginFormValues) => void = (values: LoginFormValues): void => {
    setIsLoading(true);
    setError(null);

    // Using IIFE to handle async operation in sync handler
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async (): Promise<void> => {
      try {
        await login(values.email, values.password);
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        navigate('/users');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred during login');
      } finally {
        setIsLoading(false);
      }
    })();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises -- react-hook-form handleSubmit signature */}
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<LoginFormValues, 'email'>;
                }): React.JSX.Element => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@email.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<LoginFormValues, 'password'>;
                }): React.JSX.Element => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error !== null && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
