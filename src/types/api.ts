// src/types/api.ts

export interface ApiResponseOk<T = unknown> {
  ok: true;
  data: T;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponseErr {
  ok: false;
  error: ApiError;
}
