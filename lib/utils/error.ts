export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new ApiError('UNKNOWN_ERROR', error.message);
  }
  
  return new ApiError('UNKNOWN_ERROR', 'An unknown error occurred');
};

export const logError = (error: unknown, context?: string) => {
  const apiError = handleError(error);
  console.error(
    `[${context || 'ERROR'}] ${apiError.code}: ${apiError.message}`
  );
  // TODO: Send to error tracking service (Sentry, etc.)
};