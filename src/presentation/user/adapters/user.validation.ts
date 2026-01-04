import { z } from 'zod';

/**
 * Zod Schema para validación de CreateUser
 * Valida email y name según reglas de dominio
 */
export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim()
    .pipe(z.email()),

  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .refine((val: string): boolean => val.split(/\s+/).length >= 2, {
      message: 'Name must contain at least first and last name',
    }),
});

/**
 * Zod Schema para validación de UpdateUser
 */
export const updateUserSchema = z.object({
  email: z
    .string()
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim()
    .pipe(z.email())
    .optional(),

  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional()
    .refine(
      (val: string | undefined): boolean => {
        if (val === undefined) {
          return true;
        }
        return val.split(/\s+/).length >= 2;
      },
      {
        message: 'Name must contain at least first and last name',
      }
    ),
});

/**
 * TypeScript types inferred from schemas
 */
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
