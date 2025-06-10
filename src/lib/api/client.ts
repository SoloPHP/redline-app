import { browser } from '$app/environment';
import { goto } from '$app/navigation';

// Базовая конфигурация
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Типы для API
type RequestData = Record<string, unknown> | FormData | string | null | undefined;
type QueryParams = Record<string, string | number | boolean | null | undefined>;

// Интерфейс для ошибок API
interface APIError {
	message: string;
	status: number;
	code?: string;
}

// Класс для работы с API
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

	// Приватный метод для выполнения запросов
	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		const url = `${this.baseURL}${endpoint}`;

		const config: RequestInit = {
			credentials: 'include', // Для отправки cookies
			mode: 'cors', // Явно указываем CORS режим
			headers: {
				...this.defaultHeaders,
				...options.headers
			},
			...options
		};

		try {
			const response = await fetch(url, config);

			// Проверяем статус ответа
			if (!response.ok) {
				await this.handleErrorResponse(response);
			}

			// Проверяем есть ли контент для парсинга
			const contentType = response.headers.get('content-type');
			if (contentType && contentType.includes('application/json')) {
				return await response.json() as T;
			}

			return response.text() as T;
		} catch (error) {
			console.error('API Request failed:', error);
			throw error;
		}
	}

	// Обработка ошибок
	private async handleErrorResponse(response: Response): Promise<never> {
		let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

		try {
			const errorData = await response.json() as { message?: string; error?: string };
			errorMessage = errorData.message || errorData.error || errorMessage;
		} catch {
			// Если не JSON, используем текст
			try {
				errorMessage = await response.text() || errorMessage;
			} catch {
				// Используем стандартное сообщение
			}
		}

		// Автоматический редирект на логин при 401
		if (response.status === 401 && browser) {
			goto('/login');
		}

		const error: APIError = {
			message: errorMessage,
			status: response.status
		};

		throw error;
	}

	// GET запрос
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

	// POST запрос
	async post<T>(endpoint: string, data?: RequestData): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'POST',
			body: data ? JSON.stringify(data) : undefined
		});
	}

	// PUT запрос
	async put<T>(endpoint: string, data?: RequestData): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'PUT',
			body: data ? JSON.stringify(data) : undefined
		});
	}

	// PATCH запрос
	async patch<T>(endpoint: string, data?: RequestData): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'PATCH',
			body: data ? JSON.stringify(data) : undefined
		});
	}

	// DELETE запрос
	async delete<T>(endpoint: string): Promise<T> {
		return this.request<T>(endpoint, { method: 'DELETE' });
	}

	// Загрузка файлов
	async upload<T>(endpoint: string, formData: FormData): Promise<T> {
		// Для FormData не устанавливаем Content-Type
		const headers = { ...this.defaultHeaders };
		delete headers['Content-Type'];

		return this.request<T>(endpoint, {
			method: 'POST',
			headers,
			body: formData
		});
	}
}

// Создаем и экспортируем экземпляр клиента
export const api = new APIClient();

export default api;