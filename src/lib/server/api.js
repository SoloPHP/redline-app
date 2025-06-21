import { PHP_API_URL } from '$env/static/private';
import { fail } from '@sveltejs/kit';
import { extractErrorMessage} from '$lib/utils/api-errors.js';

// ========================================
// БАЗОВЫЕ API ФУНКЦИИ
// ========================================

export async function callPhpApi(
	endpoint,
	method = 'GET',
	body = undefined,
	token = undefined,
	fetchFn = undefined
) {
	const fetchToUse = fetchFn || fetch;

	const headers = {
		'Content-Type': 'application/json',
	};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const url = `${PHP_API_URL}${endpoint}`;

	const response = await fetchToUse(url, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	});

	let data;
	try {
		data = await response.json();
	} catch {
		// Если ответ не JSON, создаем стандартную структуру
		data = {
			success: response.ok,
			message: response.ok ? 'Success' : `HTTP ${response.status}: ${response.statusText}`
		};
	}

	return { response, data };
}

export class ApiError extends Error {
	constructor(message, status, errors) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.errors = errors;
	}
}

// ========================================
// ВЫСОКОУРОВНЕВЫЕ API ФУНКЦИИ
// ========================================

/**
 * Обертка для API вызовов с автоматической обработкой ошибок
 */
export async function apiRequest(
	endpoint,
	method = 'GET',
	body = undefined,
	token = undefined,
	fetchFn = undefined
) {
	try {
		const { response, data } = await callPhpApi(endpoint, method, body, token, fetchFn);

		if (!response.ok || !data.success) {
			// Специальная обработка rate limit
			if (response.status === 429) {
				return {
					success: false,
					error: 'Превышен лимит запросов. Попробуйте позже.',
					rateLimited: true,
					status: 429
				};
			}

			// Извлекаем сообщение об ошибке из JsonResponse
			const errorMessage = extractErrorMessage(data);

			return {
				success: false,
				error: errorMessage,
				rateLimited: false,
				status: response.status
			};
		}

		return {
			success: true,
			data: data.data,
			meta: data.meta,
			status: response.status
		};
	} catch (error) {
		console.error(`API request failed [${method} ${endpoint}]:`, error);
		return {
			success: false,
			error: 'Внутренняя ошибка сервера',
			rateLimited: false,
			status: 500
		};
	}
}

/**
 * Создает fail() ответ на основе результата API
 */
export function createFailResponse(result, additionalData = {}) {
	if (result.success) {
		throw new Error('Cannot create fail response from successful result');
	}

	return fail(result.status, {
		error: result.error,
		rateLimited: result.rateLimited || false,
		...additionalData
	});
}