import { requireAuth } from '$lib/server/auth-middleware.js';

export const load = async (event) => {
	const user = requireAuth(event);

	return {
		user
	};
};