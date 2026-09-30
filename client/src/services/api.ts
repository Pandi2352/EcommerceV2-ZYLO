import axios, { type AxiosError } from 'axios';

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiErrorResponse {
  success: boolean;
  statusCode: number;
  message: string | string[];
  error?: string;
  path?: string;
  timestamp?: string;
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const resData = axiosError.response?.data;
    if (resData?.message) {
      if (Array.isArray(resData.message)) {
        return resData.message.join('. ');
      }
      return resData.message;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}
