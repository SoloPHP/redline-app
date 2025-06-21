import { redirect, fail } from '@sveltejs/kit';
import { setAuthCookies } from '$lib/server/auth-utils.js';
import { apiRequest, createFailResponse } from '$lib/server/api.js';

export const load = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/dashboard');
	}
	return {};
};

export const actions = {
	login: async ({ request, cookies, fetch }) => {
		const data = await request.formData();
		const login = data.get('login')?.toString();
		const password = data.get('password')?.toString();

		if (!login || !password) {
			return fail(400, {
				error: 'Логин и пароль обязательны',
				login,
				rateLimited: false
			});
		}

		const result = await apiRequest(
			'/auth/login',
			'POST',
			{ login, password },
			undefined,
			fetch
		);

		if (!result.success) {
			return createFailResponse(result, { login });
		}

		if (!result.data) {
			return fail(500, {
				error: 'Нет данных в ответе сервера',
				login,
				rateLimited: false
			});
		}

		const { access_token, refresh_token } = result.data;

		if (!access_token || !refresh_token) {
			return fail(500, {
				error: 'Не получены токены с сервера',
				login,
				rateLimited: false
			});
		}

		await setAuthCookies(cookies, access_token, refresh_token, fetch);

		return {
			success: true,
			user: result.data.user
		};
	}
};