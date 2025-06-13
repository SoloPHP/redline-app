import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import type { ApiResponse, ApiError } from '$lib/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

type QueryParams = Record<string, string | number | boolean | null | undefined>;

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value: unknown) => void;
	reject: (error: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
	failedQueue.forEach(({ resolve, reject }) => {
		if (error) {
			reject(error);
		} else {
			resolve(null);
		}
	});
	failedQueue = [];
};

class APIClient {
	private baseURL: string;
	private defaultHeaders: Record<string, string>;

	constructor(baseURL: string = API_BASE_URL) {
		this.baseURL = baseURL;
		this.defaultHeaders = {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		};
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {},
        withAuth: boolean = false
	): Promise<T> {
		const makeRequest = async (): Promise<Response> => {
			const url = `${this.baseURL}${endpoint}`;
			const config: RequestInit = {
				mode: 'cors',
				credentials: 'include',
				headers: {
					...this.defaultHeaders,
					...options.headers
				},
				...options
			};
			return fetch(url, config);
		};

		let response = await makeRequest();
		if (withAuth && response.status === 401 && !endpoint.includes('/refresh') && browser) {
			if (isRefreshing) {
				return new Promise<T>((resolve, reject) => {
					failedQueue.push({
						resolve: (value) => resolve(value as T),
						reject
					});
				}).then(() => makeRequest()).then((retryResponse) => this.handleResponse<T>(retryResponse));
			}
			isRefreshing = true;
			try {
				const refreshResponse = await fetch(`${this.baseURL}/auth/refresh`, {
					method: 'POST',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' }
				});
				if (refreshResponse.ok) {
					processQueue(null);
					response = await makeRequest();
				} else {
					processQueue(new Error('Token refresh failed'));
					goto('/login');
					throw new Error('Session expired');
				}
			} finally {
				isRefreshing = false;
			}
		}
		return this.handleResponse<T>(response);
	}

	private async handleResponse<T>(response: Response): Promise<T> {
		const contentType = response.headers.get('content-type');
		if (!contentType || !contentType.includes('application/json')) {
		if (!response.ok) {
				const text = await response.text();
				throw new Error(text || `HTTP ${response.status}: ${response.statusText}`);
		}
			return response.text() as unknown as T;
			}

		const jsonResponse = await response.json() as ApiResponse<T>;
		if (jsonResponse.success) {
            return jsonResponse.data !== undefined ? jsonResponse.data : {} as T;
	}

		const error: ApiError = {
			message: jsonResponse.message || `HTTP ${response.status}: ${response.statusText}`,
			status: response.status,
			errors: jsonResponse.errors
		};
		if (response.status === 401 && browser) {
			goto('/login');
		}
		throw error;
	}

	async get<T>(endpoint: string, params?: QueryParams): Promise<T> {
		let url = endpoint;
		if (params) {
			const searchParams = new URLSearchParams();
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					searchParams.append(key, String(value));
				}
			});
			url += `?${searchParams.toString()}`;
		}
		return this.request<T>(url, { method: 'GET' }, false);
	}

	async post<T, D = unknown>(endpoint: string, data?: D): Promise<T> {
		const body = data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined);
		const headers = data instanceof FormData ? {} : this.defaultHeaders;
        return this.request<T>(endpoint, { method: 'POST', headers, body }, false);
	}

	async auth<T>(endpoint: string, options: {
		method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
		body?: unknown;
		params?: QueryParams;
	} = {}): Promise<T> {
		const { method = 'GET', body, params } = options;
		let url = endpoint;
		if (method === 'GET' && params) {
			const searchParams = new URLSearchParams();
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					searchParams.append(key, String(value));
				}
			});
			url += `?${searchParams.toString()}`;
		}

		let requestOptions: RequestInit;
		if (body && method !== 'GET') {
			if (body instanceof FormData) {
				requestOptions = { method, body, headers: {} };
			} else {
        requestOptions = { method, body: JSON.stringify(body), headers: this.defaultHeaders };
			}
		} else {
			requestOptions = { method };
		}
        return this.request<T>(url, requestOptions, true);
	}

	async put<T, D = unknown>(endpoint: string, data?: D): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'PUT',
			body: data ? JSON.stringify(data) : undefined
		}, false);
	}

	async patch<T, D = unknown>(endpoint: string, data?: D): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'PATCH',
			body: data ? JSON.stringify(data) : undefined
		}, false);
	}

	async delete<T>(endpoint: string): Promise<T> {
		return this.request<T>(endpoint, { method: 'DELETE' }, false);
	}

	async upload<T>(endpoint: string, formData: FormData): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'POST',
			headers: {},
			body: formData
		}, false);
	}
}

export const api = new APIClient();
export default api;