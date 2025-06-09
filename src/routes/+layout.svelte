<script lang="ts">
    import '../app.css';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { auth } from '$lib/stores/auth';
    import { theme } from '$lib/stores/theme';
    import { API_URL, fetchConfig } from '$lib/config';
    import { DarkMode } from 'flowbite-svelte';

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
    onMount(async () => {
        auth.checkAuth();

        // Инициализируем тему
        theme.init();

        // Инициализируем Flowbite
        const flowbite = await import('flowbite');
        flowbite.initFlowbite();
    });

    // Реактивная проверка маршрутов
    $effect(() => {
        const currentPath = page.url.pathname;

        if (!$auth.isAuthenticated && !$auth.isLoading) {
            const isProtectedRoute = protectedRoutes.some(route =>
                currentPath.startsWith(route)
            );

            if (isProtectedRoute) {
                goto('/login');
            }
        }

        if ($auth.isAuthenticated && !$auth.isLoading) {
            const isGuestOnlyRoute = guestOnlyRoutes.some(route =>
                currentPath.startsWith(route)
            );

            if (isGuestOnlyRoute) {
                goto('/dashboard');
            }
        }
    });

    // Реинициализация Flowbite при смене страницы
    $effect(() => {
        // Реактивно отслеживаем изменение маршрута
        void page.url.pathname;

        setTimeout(async () => {
            const flowbite = await import('flowbite');
            flowbite.initFlowbite();
        }, 100);
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

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <!-- Навигация -->
    <nav class="bg-white dark:bg-gray-800 shadow border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div class="max-w-7xl mx-auto px-4">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <a href="/" class="text-xl font-bold text-gray-900 dark:text-white transition-colors">
                        RedLine App
                    </a>
                </div>

                <div class="flex items-center space-x-4">
                    <!-- Переключатель темы -->
                    <DarkMode />

                    {#if $auth.isAuthenticated}
						<span class="text-gray-700 dark:text-gray-300 transition-colors">
							Привет, {$auth.user?.name}!
						</span>
                        <a href="/dashboard" class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                            Dashboard
                        </a>
                        <a href="/posts" class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                            Посты
                        </a>
                        <button
                                onclick={logout}
                                class="bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
                        >
                            Выйти
                        </button>
                    {:else if !$auth.isLoading}
                        <a href="/login" class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                            Войти
                        </a>
                        <a href="/register" class="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors">
                            Регистрация
                        </a>
                    {/if}
                </div>
            </div>
        </div>
    </nav>

    <!-- Основное содержимое -->
    <main>
        {#if $auth.isLoading && protectedRoutes.some(route => page.url.pathname.startsWith(route))}
            <div class="min-h-screen flex items-center justify-center">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                    <p class="text-gray-600 dark:text-gray-400">Проверка авторизации...</p>
                </div>
            </div>
        {:else}
            {@render children()}
        {/if}
    </main>
</div>