import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { api } from '$lib/api/client';

export interface User {
	id: string;
	name: string;
	login: string;
}

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

interface LoginCredentials {
	login: string;
	password: string;
}

interface RegisterData {
	name: string;
	login: string;
	password: string;
}

interface AuthResult {
	success: boolean;
	error?: string;
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

function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === 'object' && error !== null && 'message' in error) {
		return String((error as { message: unknown }).message);
	}
	return 'Произошла неизвестная ошибка';
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
				// Используем обычный запрос без auto-refresh для проверки
				const user = await api.get<User>('/auth/me');
				set({ user, isAuthenticated: true, isLoading: false });
			} catch (error) {
				console.error('Auth check failed:', error);
				set(initialState);
			}
		},

		// Вход в систему
		login: async (credentials: LoginCredentials): Promise<AuthResult> => {
			update((state) => ({ ...state, isLoading: true }));

			try {
				const response = await api.post<{ user: User }, LoginCredentials>('/auth/login', credentials);
				set({
					user: response.user,
					isAuthenticated: true,
					isLoading: false
				});
				return { success: true };
			} catch (error) {
				set({ ...initialState });
				return {
					success: false,
					error: getErrorMessage(error)
				};
			}
		},

		// Регистрация
		register: async (userData: RegisterData): Promise<AuthResult> => {
			update((state) => ({ ...state, isLoading: true }));

			try {
				const response = await api.post<{ user: User }, RegisterData>('/auth/register', userData);
				set({
					user: response.user,
					isAuthenticated: true,
					isLoading: false
				});
				return { success: true };
			} catch (error) {
				set({ ...initialState });
				return {
					success: false,
					error: getErrorMessage(error)
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