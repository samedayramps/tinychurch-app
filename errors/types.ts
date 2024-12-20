// types/errors.ts
export class AppError extends Error {
    constructor(
      message: string,
      public code: string,
      public httpStatus: number,
      public context?: Record<string, any>
    ) {
      super(message);
      this.name = 'AppError';
    }
  }
  
  export class ValidationError extends AppError {
    constructor(message: string, context?: Record<string, any>) {
      super(message, 'VALIDATION_ERROR', 400, context);
      this.name = 'ValidationError';
    }
  }
  
  export class AuthorizationError extends AppError {
    constructor(message: string, context?: Record<string, any>) {
      super(message, 'AUTHORIZATION_ERROR', 403, context);
      this.name = 'AuthorizationError';
    }
  }