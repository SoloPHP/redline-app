import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	// Если пользователь авторизован - направляем в dashboard
	if (locals.user) {
		throw redirect(302, '/dashboard');
	}

	// Если не авторизован - направляем на login
	throw redirect(302, '/login');
};