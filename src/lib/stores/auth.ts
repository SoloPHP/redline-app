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
	message?: string;
	errors?: unknown;
}

const initialState: AuthState = {
	user: null,
	isAuthenticated: false,
	isLoading: false
};

function createAuth() {
	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,

		checkAuth: async (): Promise<void> => {
			if (!browser) return;
			update((state) => ({ ...state, isLoading: true }));
			try {
				const user = await api.get<User>('/auth/me');
				set({ user, isAuthenticated: true, isLoading: false });
			} catch (error) {
				console.error('Auth check failed:', error);
				set({ ...initialState, isLoading: false });
			}
		},

		login: async (credentials: LoginCredentials): Promise<AuthResult> => {
			update((state) => ({ ...state, isLoading: true }));
			try {
				const response = await api.post<{ user: User }, LoginCredentials>('/auth/login', credentials);
				set({ user: response.user, isAuthenticated: true, isLoading: false });
				return { success: true };
			} catch (error) {
				set({ ...initialState });
				const apiError = error as ApiError;
				return {
					success: false,
					message: apiError.message || 'Ошибка входа',
					errors: apiError.errors
				};
			}
		},

		register: async (userData: RegisterData): Promise<AuthResult> => {
			update((state) => ({ ...state, isLoading: true }));
			try {
				const response = await api.post<{ user: User }, RegisterData>('/auth/register', userData);
				set({ user: response.user, isAuthenticated: true, isLoading: false });
				return { success: true };
			} catch (error) {
				set({ ...initialState });
				const apiError = error as ApiError;
				return {
					success: false,
					message: apiError.message || 'Ошибка регистрации',
					errors: apiError.errors
				};
			}
		},

		logout: async (): Promise<void> => {
			try {
				await api.post('/auth/logout');
			} catch (error) {
				console.error('Logout error:', error);
			} finally {
				set(initialState);
			}
		},

		setUser: (user: User): void => {
			set({ user, isAuthenticated: true, isLoading: false });
		},

		setLoading: (isLoading: boolean): void => {
			update((state) => ({ ...state, isLoading }));
		}
	};
}

export const auth = createAuth();