// src/routes/dashboard/+page.svelte - Полная версия
<script lang="ts">
    import { auth } from '$lib/stores/auth';

    // Функция для форматирования даты
    function formatDate(dateString: string): string {
        try {
            return new Date(dateString).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    }
</script>

<svelte:head>
    <title>Dashboard - RedLine App</title>
</svelte:head>

<div class="max-w-7xl mx-auto py-6 px-4">
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Добро пожаловать, {$auth.user?.name}!
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
            Это ваша панель управления
        </p>
    </div>

    <!-- Карточки с информацией пользователя -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Имя</p>
                    <p class="text-lg font-semibold text-gray-900 dark:text-white">{$auth.user?.name}</p>
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Телефон</p>
                    <p class="text-lg font-semibold text-gray-900 dark:text-white">{$auth.user?.phone}</p>
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2 2 2 0 11-4 0c0-1.1.9-2 2-2zM9 7a2 2 0 00-2 2m0 0a2 2 0 11-4 0 2 2 0 014 0c0-1.1-.9-2-2-2z" />
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Логин</p>
                    <p class="text-lg font-semibold text-gray-900 dark:text-white">{$auth.user?.login}</p>
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">ID</p>
                    <p class="text-lg font-semibold text-gray-900 dark:text-white">#{$auth.user?.id}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Дополнительная информация -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Информация об аккаунте</h3>
            <div class="space-y-3">
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Дата регистрации:</span>
                    <span class="text-gray-900 dark:text-white font-medium">
                        {$auth.user?.created_at ? formatDate($auth.user.created_at) : 'Не указано'}
                    </span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Уведомления:</span>
                    <span class="text-gray-900 dark:text-white font-medium">
                        {#if $auth.user?.notify === 1}
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                Включены
                            </span>
                        {:else}
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                Отключены
                            </span>
                        {/if}
                    </span>
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Статистика</h3>
            <div class="space-y-3">
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Последний вход:</span>
                    <span class="text-gray-900 dark:text-white font-medium">
                        {new Date().toLocaleDateString('ru-RU')}
                    </span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Статус:</span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        Активен
                    </span>
                </div>
            </div>
        </div>
    </div>

    <!-- Быстрые действия -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Быстрые действия</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
                    href="/profile"
                    class="flex items-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors group"
            >
                <svg class="h-6 w-6 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 mr-3 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm font-medium text-gray-900 dark:text-white">Профиль</span>
            </a>

            <a
                    href="/settings"
                    class="flex items-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors group"
            >
                <svg class="h-6 w-6 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 mr-3 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="text-sm font-medium text-gray-900 dark:text-white">Настройки</span>
            </a>

            <a
                    href="/posts"
                    class="flex items-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors group"
            >
                <svg class="h-6 w-6 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 mr-3 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="text-sm font-medium text-gray-900 dark:text-white">Посты</span>
            </a>

            <a
                    href="/upload"
                    class="flex items-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors group"
            >
                <svg class="h-6 w-6 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 mr-3 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span class="text-sm font-medium text-gray-900 dark:text-white">Загрузка</span>
            </a>
        </div>
    </div>
</div>