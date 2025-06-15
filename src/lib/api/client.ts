import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { auth } from '$lib/stores/auth';
import type { ApiResponse, ApiError } from '$lib/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

type QueryParams = Record<string, string | number | boolean | null | undefined>;

class APIClient {
	private baseURL: string;
	private defaultHeaders: Record<string, string>;
	private isLoggingOut: boolean = false;

	constructor(baseURL: string = API_BASE_URL) {
		this.baseURL = baseURL;
		this.defaultHeaders = {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		};
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
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

		const accessToken = localStorage.getItem('access_token');
		if (accessToken && !['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'].includes(endpoint)) {
			config.headers = {
				...config.headers,
				'Authorization': `Bearer ${accessToken}`
			};
		}

		let response = await fetch(url, config);
		if (response.status === 401 && !this.isLoggingOut) {
			const refreshed = await auth.refreshToken();
			if (!refreshed) {
				await auth.logout();
				throw new Error('Authentication failed, logged out');
			}
			const newAccessToken = localStorage.getItem('access_token');
			if (newAccessToken) {
				config.headers = {
					...config.headers,
					'Authorization': `Bearer ${newAccessToken}`
				};
				response = await fetch(url, config);
			} else {
				await auth.logout();
				throw new Error('New access token not found');
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

		let errors: Record<string, string> | undefined;
		if (jsonResponse.errors && typeof jsonResponse.errors === 'object') {
			errors = Object.entries(jsonResponse.errors).reduce((acc, [key, value]) => {
				if (typeof value === 'string') {
					acc[key] = value;
				}
				return acc;
			}, {} as Record<string, string>);
		}

		const error: ApiError = {
			message: jsonResponse.message || `HTTP ${response.status}: ${response.statusText}`,
			status: response.status,
			errors
		};
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
		return this.request<T>(url, { method: 'GET' });
	}

	async post<T, D = unknown>(endpoint: string, data?: D): Promise<T> {
		const body = data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined);
		const headers = data instanceof FormData ? {} : this.defaultHeaders;
		return this.request<T>(endpoint, { method: 'POST', headers, body });
	}

	async put<T, D = unknown>(endpoint: string, data?: D): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'PUT',
			body: data ? JSON.stringify(data) : undefined
		});
	}

	async patch<T, D = unknown>(endpoint: string, data?: D): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'PATCH',
			body: data ? JSON.stringify(data) : undefined
		});
	}

	async delete<T>(endpoint: string): Promise<T> {
		return this.request<T>(endpoint, { method: 'DELETE' });
	}

	async upload<T>(endpoint: string, formData: FormData): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'POST',
			headers: {},
			body: formData
		});
	}
}

export const api = new APIClient();
export default api;