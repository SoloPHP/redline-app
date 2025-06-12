export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	message?: string;
	errors?: unknown;
	meta?: Record<string, unknown>;
}

// Типы ошибок
export interface ApiError {
	message: string;
	status: number;
	errors?: unknown;
}

// Специфичные типы для авторизации
export interface User {
	id: number;
	name: string;
	phone: string;
	login: string;
	pin_code?: string;
	created_at: string;
	notify: number;
}

export interface LoginCredentials {
	login: string;
	password: string;
}

export interface RegisterData {
	name: string;
	login: string;
	password: string;
	phone?: string;
}
