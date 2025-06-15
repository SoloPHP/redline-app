import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { api } from '$lib/api/client';
import type { User, LoginCredentials, RegisterData, ApiError, AuthResponse, RefreshResponse } from '$lib/types/api';

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	accessToken: string | null;
	refreshToken: string | null;
}

interface AuthResult {
	success: boolean;
	message?: string;
	errors?: unknown;
}

const initialState: AuthState = {
	user: null,
	isAuthenticated: false,
	isLoading: false,
	accessToken: null,
	refreshToken: null
};

function createAuth() {
	const { subscribe, set, update } = writable<AuthState>(initialState);

	const setTokens = (accessToken: string, refreshToken: string) => {
		if (browser) {
			localStorage.setItem('access_token', accessToken);
			localStorage.setItem('refresh_token', refreshToken);
		}
	};

	const getTokens = () => {
		if (browser) {
			return {
				accessToken: localStorage.getItem('access_token'),
				refreshToken: localStorage.getItem('refresh_token')
			};
		}
		return { accessToken: null, refreshToken: null };
	};

	const clearTokens = () => {
		if (browser) {
			localStorage.removeItem('access_token');
			localStorage.removeItem('refresh_token');
		}
	};

	return {
		subscribe,

		checkAuth: async function checkAuth(): Promise<boolean> {
			if (!browser) return false;
			update((state) => ({ ...state, isLoading: true }));
			try {
				const { accessToken } = getTokens();
				if (!accessToken) {
					set({ ...initialState, isLoading: false });
					return false;
				}
				const response = await api.get<{ user: User }>('/auth/me');
				set({ user: response.user, isAuthenticated: true, isLoading: false, accessToken, refreshToken: getTokens().refreshToken });
				return true;
			} catch (error) {
				const apiError = error as ApiError;
				console.error('Auth check failed:', apiError);
				set({ ...initialState, isLoading: false });
				return false;
			}
		},

		login: async (credentials: LoginCredentials): Promise<AuthResult> => {
			update((state) => ({ ...state, isLoading: true }));
			try {
				const response = await api.post<AuthResponse, LoginCredentials>(
					'/auth/login',
					credentials
				);
				setTokens(response.access_token, response.refresh_token);
				set({ user: response.user, isAuthenticated: true, isLoading: false, accessToken: response.access_token, refreshToken: response.refresh_token });
				return { success: true };
			} catch (error) {
				const apiError = error as ApiError;
				console.error('Login failed:', apiError);
				set({ ...initialState, isLoading: false });
				return {
					success: false,
					message: apiError.message || 'Ошибка входа',
					errors: apiError.errors
				};
			}
		},

		register: async function register(userData: RegisterData): Promise<AuthResult> {
			update((state) => ({ ...state, isLoading: true }));
			try {
				const response = await api.post<AuthResponse, RegisterData>('/auth/register', userData);
				setTokens(response.access_token, response.refresh_token);
				set({ user: response.user, isAuthenticated: true, isLoading: false, accessToken: response.access_token, refreshToken: response.refresh_token });
				return { success: true };
			} catch (error) {
				const apiError = error as ApiError;
				console.error('Registration failed:', apiError);
				set({ ...initialState, isLoading: false });
				return {
					success: false,
					message: apiError.message || 'Ошибка регистрации',
					errors: apiError.errors
				};
			}
		},

		refreshToken: async function refreshToken(): Promise<boolean> {
			const { refreshToken } = getTokens();
			if (!refreshToken) {
				set({ ...initialState, isLoading: false });
				return false;
			}
			update((state) => ({ ...state, isLoading: true }));
			try {
				const response = await api.post<RefreshResponse>('/auth/refresh', { refresh_token: refreshToken });
				setTokens(response.access_token, response.refresh_token);
				update((state) => ({ ...state, accessToken: response.access_token, refreshToken: response.refresh_token, isLoading: false }));
				return true;
			} catch (error) {
				const apiError = error as ApiError;
				console.error('Token refresh failed:', apiError);
				if (apiError.status === 401 && apiError.message === 'Invalid refresh token') {
					clearTokens();
					set(initialState);
				}
				return false;
			}
		},

		logout: async (): Promise<void> => {
			update((state) => ({ ...state, isLoading: true }));
			try {
				await api.post('/auth/logout');
			} catch (error) {
				console.error('Logout error:', error);
			} finally {
				clearTokens();
				set(initialState);
				if (browser) {
					window.location.href = '/login'; // Принудительный редирект
				}
			}
		},

		setUser: function setUser(user: User): void {
			set({ user, isAuthenticated: true, isLoading: false, accessToken: getTokens().accessToken, refreshToken: getTokens().refreshToken });
		},

		setLoading: function setLoading(isLoading: boolean): void {
			update((state) => ({ ...state, isLoading }));
		}
	};
}

export const auth = createAuth();