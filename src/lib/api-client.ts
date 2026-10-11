import { getMockDataForEndpoint } from './mock-data';

/**
 * Options for configuring conditional data fetching.
 */
export interface FetchOptions<T = unknown> extends RequestInit {
  /**
   * Custom mock data to return when demo mode is active.
   * Can be an object, a factory function, or a promise.
   */
  mockData?: T | (() => T | Promise<T>);

  /**
   * Simulated delay in milliseconds when returning mock data (default: 50ms).
   * Useful for ensuring loading states and skeleton UI render smoothly.
   */
  delayMs?: number;

  /**
   * If true, suppresses console logging in demo mode.
   */
  silent?: boolean;
}

/**
 * Checks whether the application is running in Demo Mode.
 * Evaluates `process.env.NEXT_PUBLIC_DEMO_MODE`.
 *
 * @returns boolean true if NEXT_PUBLIC_DEMO_MODE is 'true' or '1'
 */
export function isDemoMode(): boolean {
  const envVal = process.env.NEXT_PUBLIC_DEMO_MODE;
  if (!envVal) return false;
  const normalized = envVal.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

/**
 * Simulates a realistic network latency delay when serving mock responses.
 */
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Core conditional data fetching function.
 *
 * Logic:
 * - Checks `process.env.NEXT_PUBLIC_DEMO_MODE`.
 * - If TRUE: returns mock data (either supplied via `mockData` parameter or resolved from the mock registry).
 * - If FALSE: executes actual network `fetch()` against the API endpoint.
 *
 * @param url The API endpoint to fetch from (e.g., '/api/dashboard', '/api/flocks')
 * @param mockData Optional custom mock data or factory to return in demo mode
 * @param init Standard RequestInit options for the fetch request
 * @returns Promise<T> Parsed JSON data or mock data
 */
export async function conditionalFetch<T = unknown>(
  url: string,
  mockData?: T | (() => T | Promise<T>),
  init?: RequestInit
): Promise<T> {
  // 1. Conditional Branch: DEMO MODE ACTIVE
  if (isDemoMode()) {
    // If mock data is explicitly provided, resolve it
    if (mockData !== undefined) {
      if (typeof mockData === 'function') {
        return await (mockData as () => T | Promise<T>)();
      }
      return mockData;
    }

    // Otherwise, attempt automatic lookup from the mock registry
    const registryData = getMockDataForEndpoint<T>(url);
    if (registryData !== undefined) {
      return registryData;
    }

    // Default fallback for mutations vs queries in demo mode
    if (init?.method && init.method !== 'GET') {
      return {
        success: true,
        message: 'সফলভাবে সম্পন্ন হয়েছে (ডেমো মোড)',
      } as unknown as T;
    }

    return {} as T;
  }

  // 2. Conditional Branch: REAL API FETCH (Production / Live Mode)
  const response = await fetch(url, init);

  if (!response.ok) {
    let errorMessage = `API Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson?.error) {
        errorMessage = errorJson.error;
      }
    } catch {
      // Body was not JSON or already consumed
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}

/**
 * Extended typed API client wrapper for seamless client and server data fetching.
 *
 * Usage:
 * ```ts
 * const data = await fetchData<IFlock[]>('/api/flocks', {
 *   mockData: myCustomMockList, // optional, falls back to mock registry
 * });
 * ```
 */
export async function fetchData<T = unknown>(
  url: string,
  options?: FetchOptions<T>
): Promise<T> {
  const { mockData, delayMs = 50, silent = false, ...fetchInit } = options || {};

  if (isDemoMode()) {
    if (!silent && process.env.NODE_ENV !== 'production') {
      console.info(`[Demo Mode] Serving mock data for: ${url}`);
    }

    // Simulate realistic async network roundtrip
    if (delayMs > 0) {
      await wait(delayMs);
    }

    return conditionalFetch<T>(url, mockData, fetchInit);
  }

  return conditionalFetch<T>(url, undefined, fetchInit);
}

/**
 * Helper to execute mutations (POST, PUT, DELETE, PATCH) with demo mode simulation.
 */
export async function mutateData<T = unknown>(
  url: string,
  data?: unknown,
  options?: FetchOptions<T>
): Promise<T> {
  const method = options?.method || 'POST';
  const headers = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };

  const body = data !== undefined ? JSON.stringify(data) : options?.body;

  return fetchData<T>(url, {
    ...options,
    method,
    headers,
    body,
  });
}
