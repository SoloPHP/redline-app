import { requireAuth } from '$lib/server/auth-middleware.js';
import { apiRequest } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export const load = async (event) => {
  const user = requireAuth(event);
  const { url, cookies, fetch } = event;
  const token = cookies.get('jwt_token');

  // Получаем параметры поиска и фильтрации
  const searchParams = url.searchParams;
  const queryString = searchParams.toString();
  const endpoint = queryString ? `/orders?${queryString}` : '/orders';

  const result = await apiRequest(endpoint, 'GET', undefined, token, fetch);

  if (!result.success) {
    console.error('Orders API error:', result.error);
    // result имеет тип {success: false, error: string, ...} из apiRequest
    throw error(500, String(result.error || 'Ошибка загрузки заказов'));
  }

  // Проверяем структуру данных
  if (!result.data) {
    throw error(500, 'Некорректный ответ API: отсутствуют данные');
  }

  return {
    user,
    orders: result.data.orders || result.data.data || result.data || [],
    pagination: result.data.pagination || result.meta?.pagination || null,
    filters: result.data.filters || null,
    queryParams: result.data.queryParams || null,
    defaultParams: result.data.defaultParams || null
  };
};