// Конфигурация API
export const API_URL = import.meta.env.VITE_API_URL || 'https://api.yourdomain.com';

// Базовые настройки для всех запросов
export const fetchConfig = {
	credentials: 'include' as RequestCredentials,
	headers: {
		'Content-Type': 'application/json'
	}
};