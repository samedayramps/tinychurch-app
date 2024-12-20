import { z } from 'zod';

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: { [key: string]: string[] } = {},
    public status: number = 400
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Formats Zod validation errors into a more user-friendly structure
 */
export function formatZodError(error: z.ZodError) {
  const errors: { [key: string]: string[] } = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });
  
  return errors;
}

/**
 * Validates data against a Zod schema and throws a ValidationError if validation fails
 */
export async function validateData<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'Validation failed',
        formatZodError(error)
      );
    }
    throw error;
  }
}

/**
 * Safe parser that returns either the validated data or validation errors
 */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: { [key: string]: string[] };
} {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return {
      success: false,
      errors: formatZodError(result.error),
    };
  }
  
  return {
    success: true,
    data: result.data,
  };
}

/**
 * Helper to create partial validation schemas for PATCH operations
 */
export function createPartialSchema<T extends z.ZodObject<any, any, any>>(schema: T) {
  return schema.partial();
}

/**
 * Helper to add custom validation rules to existing schemas
 */
export function extendSchema<T extends z.ZodTypeAny>(
  baseSchema: T,
  customValidation: (data: z.infer<T>) => boolean | Promise<boolean>,
  errorMessage: string
) {
  return baseSchema.refine(customValidation, errorMessage);
} 