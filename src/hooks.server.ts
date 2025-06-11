import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

// Список защищенных маршрутов
const protectedRoutes = ['/dashboard', '/posts', '/upload', '/profile', '/settings'];

// Список маршрутов только для неавторизованных
const guestOnlyRoutes = ['/login', '/register', '/forgot-password'];

export const handle: Handle = async ({ event, resolve }) => {
	const { url, cookies } = event;
	const pathname = url.pathname;

	// Проверяем наличие токена аутентификации
	const accessToken = cookies.get('access_token');
	const refreshToken = cookies.get('refresh_token');

	// Определяем, авторизован ли пользователь
	const isAuthenticated = !!(accessToken || refreshToken);

	// Проверяем защищенные маршруты
	const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
	const isGuestOnlyRoute = guestOnlyRoutes.some(route => pathname.startsWith(route));

	// Перенаправления для неавторизованных пользователей
	if (!isAuthenticated && (isProtectedRoute || pathname === '/')) {
		throw redirect(303, '/login');
	}

	// Перенаправления для авторизованных пользователей
	if (isAuthenticated && (isGuestOnlyRoute || pathname === '/')) {
		throw redirect(303, '/dashboard');
	}

	const response = await resolve(event);
	return response;
};