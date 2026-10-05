export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
