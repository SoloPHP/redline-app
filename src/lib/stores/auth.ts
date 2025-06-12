// src/lib/stores/auth.ts - Обновлено под структуру API
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { api } from '$lib/api/client';
import type { User, LoginCredentials, RegisterData, ApiError } from '$lib/types/api';

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

interface AuthResult {
	success: boolean;
	error?: string;
	validationErrors?: Record<string, string>;
}

interface APIAuthOptions {
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	body?: unknown;
	params?: Record<string, string | number | boolean | null | undefined>;
}

const initialState: AuthState = {
	user: null,
	isAuthenticated: false,
	isLoading: false
};

function processAuthError(error: unknown): { error: string; validationErrors?: Record<string, string> } {
	let errorMessage = 'Произошла неизвестная ошибка';
	let validationErrors: Record<string, string> | undefined;

	if (error && typeof error === 'object') {
		const apiError = error as ApiError;

		// Приоритет сообщений: message > errors > общее сообщение
		errorMessage = apiError.message || apiError.errors || errorMessage;

		// Обработка ошибок валидации
		if (apiError.validationErrors) {
			validationErrors = {};
			for (const [key, value] of Object.entries(apiError.validationErrors)) {
				if (Array.isArray(value)) {
					validationErrors[key] = value.join(', ');
				} else if (typeof value === 'string') {
					validationErrors[key] = value;
				}
	}
	}
	} else if (error instanceof Error) {
		errorMessage = error.message;
	}

	return { error: errorMessage, validationErrors };
}

function createAuth() {
	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,

		// Проверка авторизации при загрузке приложения
		checkAuth: async (): Promise<void> => {
			if (!browser) return;

			update((state) => ({ ...state, isLoading: true }));

			try {
				// API клиент уже извлекает data, поэтому получаем сразу User
				const user = await api.get<User>('/auth/me');
				set({
					user,
					isAuthenticated: true,
					isLoading: false
				});
			} catch (error) {
				console.error('Auth check failed:', error);
				set(initialState);
			}
		},

		// Вход в систему
		login: async (credentials: LoginCredentials): Promise<AuthResult> => {
			update((state) => ({ ...state, isLoading: true }));

			try {
				// API клиент уже извлекает data, поэтому получаем сразу User
				const user = await api.post<User, LoginCredentials>('/auth/login', credentials);

				set({
					user,
					isAuthenticated: true,
					isLoading: false
				});
				return { success: true };
			} catch (error) {
				set({ ...initialState });
				const { error: errorMessage, validationErrors } = processAuthError(error);

				return {
					success: false,
					error: errorMessage,
					validationErrors
				};
			}
		},

		// Регистрация
		register: async (userData: RegisterData): Promise<AuthResult> => {
			update((state) => ({ ...state, isLoading: true }));

			try {
				// API клиент уже извлекает data, поэтому получаем сразу User
				const user = await api.post<User, RegisterData>('/auth/register', userData);

				set({
					user,
					isAuthenticated: true,
					isLoading: false
				});
				return { success: true };
			} catch (error) {
				set({ ...initialState });
				const { error: errorMessage, validationErrors } = processAuthError(error);

				return {
					success: false,
					error: errorMessage,
					validationErrors
				};
			}
		},

		// Выход из системы
		logout: async (): Promise<void> => {
			try {
				await api.post('/auth/logout');
			} catch (error) {
				console.error('Logout error:', error);
			} finally {
				set(initialState);
			}
		},

		// Метод для выполнения защищенных запросов с auto-refresh
		apiCall: async <T>(endpoint: string, options: APIAuthOptions = {}): Promise<T> => {
			return api.auth<T>(endpoint, options);
		},

		// Установка пользователя
		setUser: (user: User): void => {
			set({ user, isAuthenticated: true, isLoading: false });
		},

		// Установка загрузки
		setLoading: (isLoading: boolean): void => {
			update((state) => ({ ...state, isLoading }));
		}
	};
}

export const auth = createAuth();