export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	message?: string;
	errors?: unknown;
}

export interface ApiError {
	message: string;
	status: number;
	errors?: Record<string, string>;
}

export interface User {
	id: number;
	name?: string | null;
	login?: string | null;
	phone?: string | null;
	created_at?: string | null;
	notify?: boolean | null;
	pin_code?: string | null;
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
