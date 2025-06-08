<script lang="ts">
    import '../app.css';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { auth } from '$lib/stores/auth';
    import { API_URL, fetchConfig } from '$lib/config';

    let { children } = $props();

    // Список защищенных маршрутов
    const protectedRoutes = [
        '/dashboard',
        '/posts',
        '/upload',
        '/profile',
        '/settings'
    ];

    // Список маршрутов только для неавторизованных пользователей
    const guestOnlyRoutes = [
        '/login',
        '/register'
    ];

    // Проверяем авторизацию при загрузке
    onMount(() => {
        auth.checkAuth();
    });

    // Реактивная проверка маршрутов
    $effect(() => {
        const currentPath = $page.url.pathname;

        // Если пользователь не авторизован и пытается попасть на защищенную страницу
        if (!$auth.isAuthenticated && !$auth.isLoading) {
            const isProtectedRoute = protectedRoutes.some(route =>
                currentPath.startsWith(route)
            );

            if (isProtectedRoute) {
                goto('/login');
            }
        }

        // Если пользователь авторизован и пытается попасть на страницы для гостей
        if ($auth.isAuthenticated && !$auth.isLoading) {
            const isGuestOnlyRoute = guestOnlyRoutes.some(route =>
                currentPath.startsWith(route)
            );

            if (isGuestOnlyRoute) {
                goto('/dashboard');
            }
        }
    });

    // Выход из системы
    async function logout() {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                ...fetchConfig
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            auth.logout();
        }
    }
</script>

<div class="min-h-screen bg-gray-50">
    <!-- Навигация -->
    <nav class="bg-white shadow border-b">
        <div class="max-w-7xl mx-auto px-4">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <a href="/" class="text-xl font-bold text-gray-900">
                        RedLine App
                    </a>
                </div>

                <div class="flex items-center space-x-4">
                    {#if $auth.isAuthenticated}
						<span class="text-gray-700">
							Привет, {$auth.user?.name}!
						</span>
                        <a href="/dashboard" class="text-gray-700 hover:text-gray-900">
                            Dashboard
                        </a>
                        <a href="/posts" class="text-gray-700 hover:text-gray-900">
                            Посты
                        </a>
                        <button
                                onclick={logout}
                                class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            Выйти
                        </button>
                    {:else if !$auth.isLoading}
                        <a href="/login" class="text-gray-700 hover:text-gray-900">
                            Войти
                        </a>
                        <a href="/register" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Регистрация
                        </a>
                    {/if}
                </div>
            </div>
        </div>
    </nav>

    <!-- Основное содержимое -->
    <main>
        <!-- Показываем лоадер только на защищенных страницах -->
        {#if $auth.isLoading && protectedRoutes.some(route => $page.url.pathname.startsWith(route))}
            <div class="min-h-screen flex items-center justify-center">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p class="text-gray-600">Проверка авторизации...</p>
                </div>
            </div>
        {:else}
            {@render children()}
        {/if}
    </main>
</div>