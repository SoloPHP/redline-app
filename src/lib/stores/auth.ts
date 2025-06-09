import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { api } from '$lib/api/client';

export interface User {
	id: number;
	name: string;
	email: string;
	avatar?: string;
}

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

const initialState: AuthState = {
	user: null,
	isAuthenticated: false,
	isLoading: false
};

/**
 * Функция для получения сообщения об ошибке
 * @param error - ошибка, которую нужно обработать
 * @returns строка с сообщением об ошибке
 */
function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === 'object' && error !== null && 'message' in error) {
		return String(error.message);
	}
	return 'Произошла неизвестная ошибка';
}

function createAuth() {
	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,

		// Проверка авторизации при загрузке приложения
		checkAuth: async () => {
			if (!browser) return;

			update((state) => ({ ...state, isLoading: true }));

			try {
				const user = await api.get<User>('/auth/me');
				set({ user, isAuthenticated: true, isLoading: false });
			} catch (error) {
				console.error('Auth check failed:', error);
				set(initialState);
			}
		},

		// Вход в систему
		login: async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
			update((state) => ({ ...state, isLoading: true }));

			try {
				const response = await api.post<{ user: User }>('/auth/login', credentials);
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
		register: async (userData: { name: string; email: string; password: string }) => {
			update((state) => ({ ...state, isLoading: true }));

			try {
				const response = await api.post<{ user: User }>('/auth/register', userData);
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
		logout: async () => {
			try {
				await api.post('/auth/logout');
			} catch (error) {
				console.error('Logout error:', error);
			} finally {
				set(initialState);
			}
		},

		// Установка пользователя (для обратной совместимости)
		setUser: (user: User) => {
			set({ user, isAuthenticated: true, isLoading: false });
		},

		// Установка загрузки
		setLoading: (isLoading: boolean) => {
			update((state) => ({ ...state, isLoading }));
		}
	};
}

export const auth = createAuth();
