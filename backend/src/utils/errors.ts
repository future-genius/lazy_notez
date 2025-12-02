// Custom error class for consistent error handling
export class AppError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errors = {
  UNAUTHORIZED: new AppError('Unauthorized', 401, 'UNAUTHORIZED'),
  FORBIDDEN: new AppError('Forbidden', 403, 'FORBIDDEN'),
  NOT_FOUND: new AppError('Not found', 404, 'NOT_FOUND'),
  CONFLICT: new AppError('Resource already exists', 409, 'CONFLICT'),
  INVALID_CREDENTIALS: new AppError('Invalid credentials', 400, 'INVALID_CREDENTIALS'),
  TOKEN_EXPIRED: new AppError('Token expired', 401, 'TOKEN_EXPIRED'),
  INVALID_TOKEN: new AppError('Invalid token', 401, 'INVALID_TOKEN'),
  RATE_LIMIT: new AppError('Too many requests', 429, 'RATE_LIMIT'),
  CSRF_INVALID: new AppError('Invalid CSRF token', 403, 'CSRF_INVALID')
};
