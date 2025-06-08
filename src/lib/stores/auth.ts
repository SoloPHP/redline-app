import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { API_URL, fetchConfig } from '$lib/config';

export interface User {
	id: number;
	name: string;
	email: string;
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

function createAuth() {
	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,

		// Проверка авторизации при загрузке приложения
		checkAuth: async () => {
			if (!browser) return;

			update(state => ({ ...state, isLoading: true }));

			try {
				const response = await fetch(`${API_URL}/auth/me`, fetchConfig);

				if (response.ok) {
					const user = await response.json();
					set({ user, isAuthenticated: true, isLoading: false });
				} else {
					set(initialState);
				}
			} catch (error) {
				console.error('Auth check failed:', error);
				set(initialState);
			}
		},

		// Установка пользователя после успешного входа
		setUser: (user: User) => {
			set({ user, isAuthenticated: true, isLoading: false });
		},

		// Выход
		logout: () => {
			set(initialState);
		},

		// Установка загрузки
		setLoading: (isLoading: boolean) => {
			update(state => ({ ...state, isLoading }));
		}
	};
}

export const auth = createAuth();