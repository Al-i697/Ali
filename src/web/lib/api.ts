// عميل الـ API: يضيف رأس CSRF لكل طلب، ويحوّل الأخطاء إلى ApiError برسائل عربية جاهزة للعرض.
import { CLIENT_HEADER, CLIENT_HEADER_VALUE } from '@shared/constants';
import type { ApiErrorBody } from '@shared/dto';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

type Query = Record<string, string | number | boolean | null | undefined>;

export function withQuery(path: string, query?: Query): string {
  if (!query) return path;
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  const s = sp.toString();
  return s ? `${path}?${s}` : path;
}

async function request<T>(method: string, path: string, body?: unknown, query?: Query): Promise<T> {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(`/api${withQuery(path, query)}`, {
      method,
      credentials: 'same-origin',
      headers: {
        ...(method !== 'GET' ? { [CLIENT_HEADER]: CLIENT_HEADER_VALUE } : {}),
        ...(body !== undefined && !isForm ? { 'content-type': 'application/json' } : {}),
      },
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'NETWORK', 'تعذّر الاتصال بالخادم. تحقق من الاتصال ثم حاول مجددًا.');
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  if (!res.ok) {
    const err = (data as ApiErrorBody | null)?.error;
    if (res.status === 401 && !path.startsWith('/auth/login')) onUnauthorized?.();
    throw new ApiError(
      res.status,
      err?.code ?? 'HTTP_ERROR',
      err?.message ?? (res.status >= 500 ? 'حدث خطأ في الخادم. حاول مرة أخرى.' : 'تعذّر تنفيذ الطلب'),
      err?.fields,
    );
  }
  return data as T;
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, undefined, query),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body ?? {}),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body ?? {}),
  del: <T>(path: string, query?: Query) => request<T>('DELETE', path, undefined, query),
  upload: <T>(path: string, form: FormData) => request<T>('POST', path, form),
};

/** رابط مباشر لملف يولّده الخادم (تقارير/نسخ) — يعمل بالكوكي نفسه */
export const apiUrl = (path: string, query?: Query) => `/api${withQuery(path, query)}`;

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'حدث خطأ غير متوقع';
}
