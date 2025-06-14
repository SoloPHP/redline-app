<script lang="ts">
    import '../app.css';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { auth } from '$lib/stores/auth';
    import { theme } from '$lib/stores/theme';
    import { DarkMode } from 'flowbite-svelte';

    let { children } = $props();

    const protectedRoutes = ['/dashboard', '/posts', '/upload', '/profile', '/settings'];
    const guestOnlyRoutes = ['/login', '/register', '/forgot-password'];

    let showNavigation = $derived.by(() => {
        const currentPath = page.url.pathname;
        return !guestOnlyRoutes.some(route => currentPath.startsWith(route));
    });

    onMount(async () => {
        await auth.checkAuth();
        theme.init();
        const flowbite = await import('flowbite');
        flowbite.initFlowbite();
    });

    $effect(() => {
        const currentPath = page.url.pathname;

        // Пропускаем перенаправление, если проверка авторизации ещё не завершена
        if ($auth.isLoading) {
            return;
        }

        if (!$auth.isAuthenticated) {
            const isProtectedRoute = protectedRoutes.some(route =>
                currentPath.startsWith(route)
            );
            if (isProtectedRoute || currentPath === '/') {
                goto('/login', { replaceState: true });
            }
        } else {
            const isGuestOnlyRoute = guestOnlyRoutes.some(route =>
                currentPath.startsWith(route)
            );
            if (isGuestOnlyRoute || currentPath === '/') {
                goto('/dashboard', { replaceState: true });
            }
        }
    });

    $effect(() => {
        void page.url.pathname;
        setTimeout(async () => {
            const flowbite = await import('flowbite');
            flowbite.initFlowbite();
        }, 100);
    });

    async function logout() {
        await auth.logout();
        goto('/login', { replaceState: true });
    }
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    {#if showNavigation}
        <nav class="bg-white dark:bg-gray-800 shadow border-b border-gray-200 dark:border-gray-700 transition-colors">
            <div class="max-w-7xl mx-auto px-4">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <a href="/dashboard" class="text-xl font-bold text-gray-900 dark:text-white transition-colors">
                            RedLine App
                        </a>
                    </div>
                    <div class="flex items-center space-x-4">
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
    {:else}
        <div class="absolute top-4 right-4 z-10">
            <DarkMode />
        </div>
    {/if}

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