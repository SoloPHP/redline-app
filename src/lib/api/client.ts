// src/lib/api/client.ts (финальная версия с правильной типизацией)
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import type { ApiResponse, ApiError } from '$lib/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Типы для API
type QueryParams = Record<string, string | number | boolean | null | undefined>;

// Переменные для управления очередью запросов
let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value: unknown) => void;
	reject: (error: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
	failedQueue.forEach(({ resolve, reject }) => {
		if (error) {
			reject(error);
		} else {
			resolve(token);
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

	// Основной метод для выполнения запросов
	private async request<T>(
		endpoint: string,
		options: RequestInit = {},
		withAuth: boolean = false // Флаг для включения автоматического refresh
	): Promise<T> {
		const makeRequest = async (): Promise<Response> => {
			const url = `${this.baseURL}${endpoint}`;

			const config: RequestInit = {
				credentials: 'include',
				mode: 'cors',
				headers: {
					...this.defaultHeaders,
					...options.headers
				},
				...options
			};

			return fetch(url, config);
		};

		let response = await makeRequest();

		// Автоматический refresh только если включен withAuth и получен 401
		if (withAuth && response.status === 401 && !endpoint.includes('/refresh') && browser) {
			if (isRefreshing) {
				// Добавляем запрос в очередь
				return new Promise<T>((resolve, reject) => {
					failedQueue.push({
						resolve: (value: unknown) => resolve(value as T),
						reject
					});
				}).then(() => {
					return makeRequest();
				}).then(async (retryResponse) => {
					return this.handleResponse<T>(retryResponse);
				}).catch(err => {
					return Promise.reject(err);
				});
			}

			isRefreshing = true;

			try {
				const refreshResponse = await fetch(`${this.baseURL}/auth/refresh`, {
					method: 'POST',
					credentials: 'include'
				});

				if (refreshResponse.ok) {
					processQueue(null, 'success');
					// Повторяем оригинальный запрос
					response = await makeRequest();
				} else {
					processQueue(new Error('Token refresh failed'), null);
					// Перенаправляем на логин
					if (browser) {
						goto('/login');
					}
					throw new Error('Session expired');
				}
			} catch (error) {
				processQueue(error as Error, null);
				if (browser) {
					goto('/login');
				}
				throw error;
			} finally {
				isRefreshing = false;
			}
		}

		return this.handleResponse<T>(response);
	}

	// Обработка ответа с учетом вашего PHP класса JsonResponse
	private async handleResponse<T>(response: Response): Promise<T> {
		const contentType = response.headers.get('content-type');

		if (!contentType || !contentType.includes('application/json')) {
			// Если не JSON, то обрабатываем как текст
		if (!response.ok) {
				const text = await response.text();
				throw new Error(text || `HTTP ${response.status}: ${response.statusText}`);
		}
			return response.text() as unknown as T;
			}

		const jsonResponse = await response.json() as ApiResponse<T>;

		// Обрабатываем успешные ответы
		if (jsonResponse.success) {
			// Возвращаем data если есть, иначе пустой объект
			return (jsonResponse.data !== undefined ? jsonResponse.data : {} as T);
	}

		// Обрабатываем ошибки
		const errorMessage = jsonResponse.message || `HTTP ${response.status}: ${response.statusText}`;

		const error: ApiError = {
			message: errorMessage,
			status: response.status,
			errors: jsonResponse.errors,
			validationErrors: jsonResponse.validation_errors
		};

		// Автоматический редирект на логин при 401
		if (response.status === 401 && browser) {
			goto('/login');
		}

		throw error;
	}

	// Обычные запросы (публичные, авторизация, регистрация)
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

		return this.request<T>(endpoint, {
			method: 'POST',
			headers,
			body
		}, false);
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

	// Универсальный метод для авторизованных запросов с auto-refresh
	async auth<T>(endpoint: string, options: {
		method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
		body?: unknown;
		params?: QueryParams;
	} = {}): Promise<T> {
		const { method = 'GET', body, params } = options;

		let url = endpoint;

		// Обработка параметров для GET запросов
		if (method === 'GET' && params) {
			const searchParams = new URLSearchParams();
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					searchParams.append(key, String(value));
				}
			});
			url += `?${searchParams.toString()}`;
		}

		// Формируем опции запроса в зависимости от типа данных
		let requestOptions: RequestInit;

		if (body && method !== 'GET') {
			if (body instanceof FormData) {
				requestOptions = {
					method,
					body,
					headers: {} // Для FormData не устанавливаем Content-Type
				};
			} else {
				requestOptions = {
					method,
					body: JSON.stringify(body),
					headers: this.defaultHeaders
				};
			}
		} else {
			requestOptions = { method };
		}

		return this.request<T>(url, requestOptions, true); // withAuth = true
	}
}

// Создаем и экспортируем экземпляр клиента
export const api = new APIClient();
export default api;