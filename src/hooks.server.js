import { callPhpApi } from '$lib/server/api.js';
import { clearAuthCookies, tryRefreshAndSetCookies } from '$lib/server/auth-utils.js';

export const handle = async ({ event, resolve }) => {
	const token = event.cookies.get('jwt_token');
	const refreshToken = event.cookies.get('refresh_token');

	// Инициализируем пользователя как null
	event.locals.user = null;

	try {
		if (token) {
			// Есть access token, проверяем его
			const authResult = await verifyToken(token, event.fetch);

			if (authResult.success && authResult.user) {
				event.locals.user = authResult.user;
			} else if (refreshToken) {
				// Access token недействителен, пробуем refresh
				await handleTokenRefresh(refreshToken, event);
			} else {
				// Нет refresh token, очищаем куки
				clearAuthCookies(event.cookies);
			}
		} else if (refreshToken) {
			// Нет access token, но есть refresh token
			await handleTokenRefresh(refreshToken, event);
		}
	} catch (error) {
		console.error('Auth handler error:', error);
		clearAuthCookies(event.cookies);
		event.locals.user = null;
	}

	return resolve(event);
};

/**
 * Обработка обновления токена
 */
async function handleTokenRefresh(refreshToken, event) {
	const refreshSuccess = await tryRefreshAndSetCookies(
		refreshToken,
		event.cookies,
		event.fetch
	);

	if (refreshSuccess) {
		const newToken = event.cookies.get('jwt_token');
		if (newToken) {
			const authResult = await verifyToken(newToken, event.fetch);
			if (authResult.success && authResult.user) {
				event.locals.user = authResult.user;
			} else {
				clearAuthCookies(event.cookies);
			}
		}
	} else {
		clearAuthCookies(event.cookies);
	}
}

/**
 * Проверяет токен через PHP API
 */
async function verifyToken(token, fetchFn) {
	try {
		const { response, data } = await callPhpApi(
			'/auth/me',
			'GET',
			undefined,
			token,
			fetchFn
		);

		if (response.ok && data.success && data.data?.user) {
			return { success: true, user: data.data.user };
		}

		return { success: false };
	} catch (error) {
		console.error('Auth verification error:', error);
		return { success: false };
	}
}