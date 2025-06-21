/**
 * Извлекает понятное сообщение об ошибке из API ответа JsonResponse
 */
export function extractErrorMessage(apiData) {
	const { errors, message } = apiData;

	// Сначала пробуем извлечь из errors
	if (errors) {
		// Массив строк
		if (Array.isArray(errors) && errors.length > 0) {
			return typeof errors[0] === 'string' ? errors[0] : JSON.stringify(errors[0]);
		}

		// Строка
		if (typeof errors === 'string') {
			return errors;
		}

		// Объект с полями валидации - берем первую ошибку
		if (typeof errors === 'object') {
			const firstError = Object.values(errors)[0];
			if (Array.isArray(firstError) && firstError.length > 0) {
				return typeof firstError[0] === 'string' ? firstError[0] : JSON.stringify(firstError[0]);
			}
			if (typeof firstError === 'string') {
				return firstError;
			}
		}
	}

	// Если errors не дали результата, используем message
	if (message && typeof message === 'string') {
		return message;
	}

	// Fallback
	return 'Произошла ошибка';
}