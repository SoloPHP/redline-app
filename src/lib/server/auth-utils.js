import { callPhpApi } from '$lib/server/api.js';

let cachedTokenSettings = null;

/**
 * Получает настройки токенов с кешированием
 */
async function getTokenSettings(fetchFn) {
	if (cachedTokenSettings) {
		return cachedTokenSettings;
	}

	try {
		const { response, data } = await callPhpApi(
			'/config/token-settings',
			'GET',
			undefined,
			undefined,
			fetchFn
		);

		if (response.ok && data.success && data.data) {
			cachedTokenSettings = {
				access_token_lifetime: data.data.access_token_lifetime,
				refresh_token_lifetime: data.data.refresh_token_lifetime
			};
			return cachedTokenSettings;
		}
	} catch (error) {
		console.warn('Failed to load token settings from PHP API, using defaults:', error);
	}

	// Fallback настройки
	cachedTokenSettings = {
		access_token_lifetime: 900, // 15 минут
		refresh_token_lifetime: 604800 // 7 дней
	};

	return cachedTokenSettings;
}

/**
 * Создает базовые опции для куки
 */
function createCookieOptions() {
	return {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		path: '/'
	};
}

/**
 * Устанавливает токены в куки
 */
export async function setAuthCookies(cookies, accessToken, refreshToken, fetchFn) {
	const settings = await getTokenSettings(fetchFn);
	const cookieOptions = createCookieOptions();

	cookies.set('jwt_token', accessToken, {
		...cookieOptions,
		maxAge: settings.access_token_lifetime
	});

	cookies.set('refresh_token', refreshToken, {
		...cookieOptions,
		maxAge: settings.refresh_token_lifetime
	});

	cookies.set('logged_in', 'true', {
		...cookieOptions,
		httpOnly: false,
		maxAge: settings.refresh_token_lifetime
	});
}

/**
 * Очищает все куки авторизации
 */
export function clearAuthCookies(cookies) {
	const cookieOptions = {
		path: '/',
		secure: process.env.NODE_ENV === 'production'
	};

	cookies.delete('jwt_token', cookieOptions);
	cookies.delete('refresh_token', cookieOptions);
	cookies.delete('logged_in', cookieOptions);
}

/**
 * Обновляет токены через PHP API
 */
export async function refreshTokens(refreshToken, fetchFn) {
	try {
		const { response, data } = await callPhpApi(
			'/auth/refresh',
			'POST',
			{ refresh_token: refreshToken },
			undefined,
			fetchFn
		);

		if (response.ok && data.success && data.data) {
			const { access_token, refresh_token: newRefreshToken } = data.data;

			if (access_token && newRefreshToken) {
				return {
					success: true,
					accessToken: access_token,
					newRefreshToken: newRefreshToken
				};
			}
		}

		return {
			success: false,
			error: data.message || 'Token refresh failed'
		};
	} catch (error) {
		console.error('Token refresh failed:', error);
		return {
			success: false,
			error: 'Internal server error'
		};
	}
}

/**
 * Пытается обновить токены и установить новые куки
 */
export async function tryRefreshAndSetCookies(refreshToken, cookies, fetchFn) {
	if (!refreshToken) return false;

	const result = await refreshTokens(refreshToken, fetchFn);

	if (result.success && result.accessToken && result.newRefreshToken) {
		await setAuthCookies(cookies, result.accessToken, result.newRefreshToken, fetchFn);
		return true;
	}

	return false;
}